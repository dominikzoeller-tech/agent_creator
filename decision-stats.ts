
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import { readDecisionLog, type DecisionLogEntry } from "./decision-log";

type RouteFilter = "all" | "council" | "direct";
type OrderMode = "newest" | "oldest";
type TimeBucket = "day" | "week" | "month";

interface CliOptions {
  route: RouteFilter;
  order: OrderMode;
  limit: number;
}

interface TopItem {
  label: string;
  count: number;
}

interface PeriodAggregate {
  period: string;
  total: number;
  direct: number;
  council: number;
  avgConfidencePercent: number | "";
}

interface PatternAggregate {
  pattern: string;
  count: number;
  avgConfidencePercent: number | "";
  exampleQuestion: string;
}

function parseArgs(argv: string[]): CliOptions {
  let route: RouteFilter = "all";
  let order: OrderMode = "newest";
  let limit = 1000;

  for (const arg of argv) {
    if (arg.startsWith("--route=")) {
      const value = arg.split("=")[1]?.trim().toLowerCase();
      if (value === "all" || value === "council" || value === "direct") {
        route = value;
      }
    }

    if (arg.startsWith("--order=")) {
      const value = arg.split("=")[1]?.trim().toLowerCase();
      if (value === "newest" || value === "oldest") {
        order = value;
      }
    }

    if (arg.startsWith("--limit=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) {
        limit = Math.floor(value);
      }
    }
  }

  return { route, order, limit };
}

function round(value: number, digits = 2): number {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function countBy<T extends string>(values: T[]): Record<T, number> {
  const result = {} as Record<T, number>;
  for (const value of values) {
    result[value] = (result[value] ?? 0) + 1;
  }
  return result;
}

function topNFromMap(map: Record<string, number>, limit = 5): TopItem[] {
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function collectRecommendations(entries: DecisionLogEntry[]): string[] {
  return entries
    .map((entry) => entry.recommendation)
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function collectFirstSteps(entries: DecisionLogEntry[]): string[] {
  return entries
    .map((entry) => entry.firstStep)
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function collectOptions(entries: DecisionLogEntry[]): string[] {
  return entries.flatMap((entry) => entry.extractedOptions ?? []);
}

function printSectionTitle(title: string): void {
  console.log("======================================");
  console.log(title);
  console.log("======================================");
}

function printKeyValue(label: string, value: string | number): void {
  console.log(`${label}: ${value}`);
}

function printTopItems(title: string, items: TopItem[]): void {
  console.log(`\n${title}`);
  if (items.length === 0) {
    console.log("- keine");
    return;
  }

  for (const item of items) {
    console.log(`- ${item.label} (${item.count}x)`);
  }
}

function asciiBar(label: string, value: number, maxValue: number, width = 24): string {
  const safeMax = Math.max(maxValue, 1);
  const filled = Math.round((value / safeMax) * width);
  const bar = "█".repeat(filled) + "·".repeat(Math.max(0, width - filled));
  return `${label.padEnd(16)} | ${bar} | ${value}`;
}

function asciiHeat(value: number, maxValue: number): string {
  const chars = ["░", "▒", "▓", "█"];
  if (maxValue <= 0) return chars[0];
  const ratio = value / maxValue;
  if (ratio >= 0.85) return chars[3];
  if (ratio >= 0.6) return chars[2];
  if (ratio >= 0.3) return chars[1];
  return chars[0];
}

function printAsciiDistribution(params: { directCount: number; councilCount: number }): void {
  console.log("\nASCII-Balken / Verteilung");
  const maxValue = Math.max(params.directCount, params.councilCount, 1);
  console.log(asciiBar("direct", params.directCount, maxValue));
  console.log(asciiBar("council", params.councilCount, maxValue));
}

function printAsciiHeatmap(title: string, items: TopItem[]): void {
  console.log(`\n${title}`);
  if (items.length === 0) {
    console.log("- keine");
    return;
  }

  const maxValue = Math.max(...items.map((item) => item.count), 1);
  for (const item of items) {
    const heat = asciiHeat(item.count, maxValue).repeat(8);
    console.log(`${heat}  ${item.label} (${item.count}x)`);
  }
}

function formatDateForName(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d}_${hh}-${mm}-${ss}`;
}

function getIsoWeek(date: Date): { year: number; week: number } {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: temp.getUTCFullYear(), week };
}

function bucketForDate(date: Date, bucket: TimeBucket): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  if (bucket === "day") return `${y}-${m}-${d}`;
  if (bucket === "month") return `${y}-${m}`;

  const iso = getIsoWeek(date);
  return `${iso.year}-W${String(iso.week).padStart(2, "0")}`;
}

function aggregateByPeriod(entries: DecisionLogEntry[], bucket: TimeBucket): PeriodAggregate[] {
  const map = new Map<string, { total: number; direct: number; council: number; confidences: number[] }>();

  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    if (Number.isNaN(date.getTime())) continue;

    const key = bucketForDate(date, bucket);
    const current = map.get(key) ?? { total: 0, direct: 0, council: 0, confidences: [] };

    current.total += 1;
    if (entry.route === "direct") current.direct += 1;
    if (entry.route === "council") current.council += 1;
    if (typeof entry.confidence === "number") current.confidences.push(entry.confidence * 100);

    map.set(key, current);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, values]) => ({
      period,
      total: values.total,
      direct: values.direct,
      council: values.council,
      avgConfidencePercent:
        values.confidences.length > 0 ? round(average(values.confidences) ?? 0) : "",
    }));
}

function inferPattern(entry: DecisionLogEntry): string {
  if (entry.extractedOptions && entry.extractedOptions.length >= 2) {
    const normalizedOptions = [...entry.extractedOptions]
      .map((option) => option.trim())
      .filter(Boolean)
      .sort((a, b) => normalizeText(a).localeCompare(normalizeText(b)));

    return normalizedOptions.join(" ⇄ ");
  }

  const question = normalizeText(entry.userInput)
    .replace(/^rat das durch:\s*/i, "")
    .replace(/^ich bin hin- und hergerissen:\s*/i, "")
    .replace(/^ich kann mich nicht entscheiden:\s*/i, "");

  return question.slice(0, 120);
}

function aggregatePatterns(entries: DecisionLogEntry[]): PatternAggregate[] {
  const map = new Map<string, { count: number; confidences: number[]; exampleQuestion: string }>();

  for (const entry of entries) {
    const pattern = inferPattern(entry);
    const current = map.get(pattern) ?? {
      count: 0,
      confidences: [],
      exampleQuestion: entry.userInput,
    };

    current.count += 1;

    if (typeof entry.confidence === "number") {
      current.confidences.push(entry.confidence * 100);
    }

    if (!current.exampleQuestion) {
      current.exampleQuestion = entry.userInput;
    }

    map.set(pattern, current);
  }

  return Array.from(map.entries())
    .map(([pattern, values]): PatternAggregate => {
      const avgConfidencePercent: number | "" =
        values.confidences.length > 0
          ? round(average(values.confidences) ?? 0)
          : "";

      return {
        pattern,
        count: values.count,
        avgConfidencePercent,
        exampleQuestion: values.exampleQuestion,
      };
    })
    .sort((a, b) => b.count - a.count || a.pattern.localeCompare(b.pattern));
}

function printPeriodTable(title: string, rows: PeriodAggregate[]): void {
  console.log(`\n${title}`);
  if (rows.length === 0) {
    console.log("- keine");
    return;
  }

  for (const row of rows) {
    const conf = row.avgConfidencePercent === "" ? "-" : `${row.avgConfidencePercent}%`;
    console.log(`${row.period} | total=${row.total} | direct=${row.direct} | council=${row.council} | ØConf=${conf}`);
  }
}

function printPatternScorecard(patterns: PatternAggregate[]): void {
  console.log("\nMini-Scorecard: Wiederkehrende Entscheidungsmuster");
  if (patterns.length === 0) {
    console.log("- keine");
    return;
  }

  const topPatterns = patterns.slice(0, 5);
  const maxCount = Math.max(...topPatterns.map((pattern) => pattern.count), 1);

  for (const pattern of topPatterns) {
    const avgConf = pattern.avgConfidencePercent === "" ? "-" : `${pattern.avgConfidencePercent}%`;
    console.log(asciiBar(pattern.pattern.slice(0, 16), pattern.count, maxCount, 18));
    console.log(`  Beispiel: ${pattern.exampleQuestion}`);
    console.log(`  Ø Konfidenz: ${avgConf}`);
  }
}

function escapeCsv(value: unknown): string {
  const str = String(value ?? "");
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

function toFullCsv(entries: DecisionLogEntry[]): string {
  const header = [
    "timestamp",
    "route",
    "userInput",
    "recommendation",
    "firstStep",
    "confidence",
    "confidencePercent",
    "context",
    "extractedOptions",
  ];

  const rows = entries.map((entry) => {
    const confidencePercent = typeof entry.confidence === "number" ? Math.round(entry.confidence * 100) : "";

    return [
      escapeCsv(entry.timestamp),
      escapeCsv(entry.route),
      escapeCsv(entry.userInput),
      escapeCsv(entry.recommendation ?? ""),
      escapeCsv(entry.firstStep ?? ""),
      escapeCsv(typeof entry.confidence === "number" ? entry.confidence.toFixed(2) : ""),
      escapeCsv(confidencePercent),
      escapeCsv((entry.context ?? []).join(" | ")),
      escapeCsv((entry.extractedOptions ?? []).join(" | ")),
    ].join(",");
  });

  return [header.join(","), ...rows].join("\n");
}

function toCompactCsv(entries: DecisionLogEntry[]): string {
  const header = ["timestamp", "route", "userInput", "recommendation", "firstStep", "confidencePercent"];
  const rows = entries.map((entry) => [
    escapeCsv(entry.timestamp),
    escapeCsv(entry.route),
    escapeCsv(entry.userInput),
    escapeCsv(entry.recommendation ?? ""),
    escapeCsv(entry.firstStep ?? ""),
    escapeCsv(typeof entry.confidence === "number" ? Math.round(entry.confidence * 100) : ""),
  ].join(","));

  return [header.join(","), ...rows].join("\n");
}

function toSummaryCsv(rows: Array<Record<string, string | number>>): string {
  const header = ["section", "metric", "value"];
  const lines = rows.map((row) => [
    escapeCsv(row.section),
    escapeCsv(row.metric),
    escapeCsv(row.value),
  ].join(","));

  return [header.join(","), ...lines].join("\n");
}

function toTopItemsCsv(items: TopItem[], labelName: string): string {
  const header = [labelName, "count"];
  const rows = items.map((item) => [escapeCsv(item.label), escapeCsv(item.count)].join(","));
  return [header.join(","), ...rows].join("\n");
}

function toPatternCsv(items: PatternAggregate[]): string {
  const header = ["pattern", "count", "avgConfidencePercent", "exampleQuestion"];
  const rows = items.map((item) => [
    escapeCsv(item.pattern),
    escapeCsv(item.count),
    escapeCsv(item.avgConfidencePercent === "" ? "" : item.avgConfidencePercent),
    escapeCsv(item.exampleQuestion),
  ].join(","));

  return [header.join(","), ...rows].join("\n");
}

function routeSuffix(route: RouteFilter): string {
  return route === "all" ? "all" : route;
}

function orderSuffix(order: OrderMode): string {
  return order;
}

async function exportCsvFiles(
  entries: DecisionLogEntry[],
  route: RouteFilter,
  order: OrderMode,
  summaryRows: Array<Record<string, string | number>>,
  topRecommendations: TopItem[],
  topFirstSteps: TopItem[],
  topOptions: TopItem[],
  patterns: PatternAggregate[],
  timestampTag: string
): Promise<{
  fullPath: string;
  compactPath: string;
  summaryPath: string;
  recommendationsPath: string;
  firstStepsPath: string;
  optionsPath: string;
  patternsPath: string;
}> {
  const logDir = path.join(process.cwd(), "logs");
  await mkdir(logDir, { recursive: true });

  const suffix = `${routeSuffix(route)}-${orderSuffix(order)}-${timestampTag}`;
  const fullPath = path.join(logDir, `decision-log-export-${suffix}.csv`);
  const compactPath = path.join(logDir, `decision-log-compact-${suffix}.csv`);
  const summaryPath = path.join(logDir, `decision-summary-${suffix}.csv`);
  const recommendationsPath = path.join(logDir, `decision-recommendations-${suffix}.csv`);
  const firstStepsPath = path.join(logDir, `decision-first-steps-${suffix}.csv`);
  const optionsPath = path.join(logDir, `decision-options-${suffix}.csv`);
  const patternsPath = path.join(logDir, `decision-patterns-${suffix}.csv`);

  await writeFile(fullPath, toFullCsv(entries), "utf8");
  await writeFile(compactPath, toCompactCsv(entries), "utf8");
  await writeFile(summaryPath, toSummaryCsv(summaryRows), "utf8");
  await writeFile(recommendationsPath, toTopItemsCsv(topRecommendations, "recommendation"), "utf8");
  await writeFile(firstStepsPath, toTopItemsCsv(topFirstSteps, "firstStep"), "utf8");
  await writeFile(optionsPath, toTopItemsCsv(topOptions, "option"), "utf8");
  await writeFile(patternsPath, toPatternCsv(patterns), "utf8");

  return {
    fullPath,
    compactPath,
    summaryPath,
    recommendationsPath,
    firstStepsPath,
    optionsPath,
    patternsPath,
  };
}

function buildEntriesSheetData(entries: DecisionLogEntry[]) {
  return entries.map((entry) => ({
    timestamp: entry.timestamp,
    route: entry.route,
    userInput: entry.userInput,
    recommendation: entry.recommendation ?? "",
    firstStep: entry.firstStep ?? "",
    confidence: typeof entry.confidence === "number" ? entry.confidence.toFixed(2) : "",
    confidencePercent: typeof entry.confidence === "number" ? Math.round(entry.confidence * 100) : "",
    context: (entry.context ?? []).join(" | "),
    extractedOptions: (entry.extractedOptions ?? []).join(" | "),
  }));
}

function buildSummaryRows(params: {
  route: RouteFilter;
  order: OrderMode;
  totalEntries: number;
  directCount: number;
  councilCount: number;
  directShare: number;
  councilShare: number;
  avgConfidence: number | null;
  topRecommendations: TopItem[];
  topFirstSteps: TopItem[];
  topOptions: TopItem[];
  patterns: PatternAggregate[];
  byDay: PeriodAggregate[];
  byWeek: PeriodAggregate[];
  byMonth: PeriodAggregate[];
}): Array<Record<string, string | number>> {
  const rows: Array<Record<string, string | number>> = [];

  rows.push({ section: "Overview", metric: "Route Filter", value: params.route });
  rows.push({ section: "Overview", metric: "Order", value: params.order });
  rows.push({ section: "Overview", metric: "Gesamtanzahl Einträge", value: params.totalEntries });
  rows.push({ section: "Overview", metric: "Direct", value: params.directCount });
  rows.push({ section: "Overview", metric: "Council", value: params.councilCount });
  rows.push({ section: "Overview", metric: "Direct Anteil (%)", value: params.directShare });
  rows.push({ section: "Overview", metric: "Council Anteil (%)", value: params.councilShare });
  rows.push({ section: "Overview", metric: "Ø Konfidenz Council (%)", value: params.avgConfidence !== null ? round(params.avgConfidence * 100) : "" });

  params.topRecommendations.forEach((item, index) => {
    rows.push({ section: "Top Recommendations", metric: `#${index + 1}`, value: `${item.label} (${item.count}x)` });
  });

  params.topFirstSteps.forEach((item, index) => {
    rows.push({ section: "Top First Steps", metric: `#${index + 1}`, value: `${item.label} (${item.count}x)` });
  });

  params.topOptions.forEach((item, index) => {
    rows.push({ section: "Top Options", metric: `#${index + 1}`, value: `${item.label} (${item.count}x)` });
  });

  params.patterns.slice(0, 10).forEach((item, index) => {
    rows.push({ section: "Top Patterns", metric: `#${index + 1}`, value: `${item.pattern} (${item.count}x)` });
  });

  params.byDay.forEach((row) => {
    rows.push({ section: "By Day", metric: row.period, value: `total=${row.total}; direct=${row.direct}; council=${row.council}; avgConf=${row.avgConfidencePercent === "" ? "-" : row.avgConfidencePercent + "%"}` });
  });

  params.byWeek.forEach((row) => {
    rows.push({ section: "By Week", metric: row.period, value: `total=${row.total}; direct=${row.direct}; council=${row.council}; avgConf=${row.avgConfidencePercent === "" ? "-" : row.avgConfidencePercent + "%"}` });
  });

  params.byMonth.forEach((row) => {
    rows.push({ section: "By Month", metric: row.period, value: `total=${row.total}; direct=${row.direct}; council=${row.council}; avgConf=${row.avgConfidencePercent === "" ? "-" : row.avgConfidencePercent + "%"}` });
  });

  return rows;
}

async function exportExcelFiles(params: {
  entries: DecisionLogEntry[];
  route: RouteFilter;
  order: OrderMode;
  totalEntries: number;
  directCount: number;
  councilCount: number;
  directShare: number;
  councilShare: number;
  avgConfidence: number | null;
  topRecommendations: TopItem[];
  topFirstSteps: TopItem[];
  topOptions: TopItem[];
  patterns: PatternAggregate[];
  byDay: PeriodAggregate[];
  byWeek: PeriodAggregate[];
  byMonth: PeriodAggregate[];
  timestampTag: string;
}): Promise<{ reportPath: string; summaryOnlyPath: string }> {
  const logDir = path.join(process.cwd(), "logs");
  await mkdir(logDir, { recursive: true });

  const suffix = `${routeSuffix(params.route)}-${orderSuffix(params.order)}-${params.timestampTag}`;
  const reportPath = path.join(logDir, `decision-report-${suffix}.xlsx`);
  const summaryOnlyPath = path.join(logDir, `decision-summary-${suffix}.xlsx`);

  const entriesData = buildEntriesSheetData(params.entries);
  const summaryRows = buildSummaryRows({
    route: params.route,
    order: params.order,
    totalEntries: params.totalEntries,
    directCount: params.directCount,
    councilCount: params.councilCount,
    directShare: params.directShare,
    councilShare: params.councilShare,
    avgConfidence: params.avgConfidence,
    topRecommendations: params.topRecommendations,
    topFirstSteps: params.topFirstSteps,
    topOptions: params.topOptions,
    patterns: params.patterns,
    byDay: params.byDay,
    byWeek: params.byWeek,
    byMonth: params.byMonth,
  });

  const reportWb = XLSX.utils.book_new();
  const entriesSheet = XLSX.utils.json_to_sheet(entriesData);
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  const byDaySheet = XLSX.utils.json_to_sheet(params.byDay);
  const byWeekSheet = XLSX.utils.json_to_sheet(params.byWeek);
  const byMonthSheet = XLSX.utils.json_to_sheet(params.byMonth);
  const patternSheet = XLSX.utils.json_to_sheet(params.patterns);

  entriesSheet["!cols"] = [
    { wch: 24 },
    { wch: 12 },
    { wch: 60 },
    { wch: 60 },
    { wch: 60 },
    { wch: 12 },
    { wch: 18 },
    { wch: 60 },
    { wch: 40 },
  ];
  summarySheet["!cols"] = [{ wch: 24 }, { wch: 28 }, { wch: 100 }];
  byDaySheet["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 22 }];
  byWeekSheet["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 22 }];
  byMonthSheet["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 22 }];
  patternSheet["!cols"] = [{ wch: 45 }, { wch: 10 }, { wch: 22 }, { wch: 70 }];

  XLSX.utils.book_append_sheet(reportWb, entriesSheet, "Entries");
  XLSX.utils.book_append_sheet(reportWb, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(reportWb, byDaySheet, "ByDay");
  XLSX.utils.book_append_sheet(reportWb, byWeekSheet, "ByWeek");
  XLSX.utils.book_append_sheet(reportWb, byMonthSheet, "ByMonth");
  XLSX.utils.book_append_sheet(reportWb, patternSheet, "Patterns");
  XLSX.writeFile(reportWb, reportPath);

  const summaryOnlyWb = XLSX.utils.book_new();
  const summaryOnlySheet = XLSX.utils.json_to_sheet(summaryRows);
  const summaryOnlyByDaySheet = XLSX.utils.json_to_sheet(params.byDay);
  const summaryOnlyByWeekSheet = XLSX.utils.json_to_sheet(params.byWeek);
  const summaryOnlyByMonthSheet = XLSX.utils.json_to_sheet(params.byMonth);
  const summaryOnlyPatternSheet = XLSX.utils.json_to_sheet(params.patterns);

  summaryOnlySheet["!cols"] = [{ wch: 24 }, { wch: 28 }, { wch: 100 }];
  summaryOnlyByDaySheet["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 22 }];
  summaryOnlyByWeekSheet["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 22 }];
  summaryOnlyByMonthSheet["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 22 }];
  summaryOnlyPatternSheet["!cols"] = [{ wch: 45 }, { wch: 10 }, { wch: 22 }, { wch: 70 }];

  XLSX.utils.book_append_sheet(summaryOnlyWb, summaryOnlySheet, "Summary");
  XLSX.utils.book_append_sheet(summaryOnlyWb, summaryOnlyByDaySheet, "ByDay");
  XLSX.utils.book_append_sheet(summaryOnlyWb, summaryOnlyByWeekSheet, "ByWeek");
  XLSX.utils.book_append_sheet(summaryOnlyWb, summaryOnlyByMonthSheet, "ByMonth");
  XLSX.utils.book_append_sheet(summaryOnlyWb, summaryOnlyPatternSheet, "Patterns");
  XLSX.writeFile(summaryOnlyWb, summaryOnlyPath);

  return { reportPath, summaryOnlyPath };
}

function filterEntries(entries: DecisionLogEntry[], route: RouteFilter): DecisionLogEntry[] {
  if (route === "all") return entries;
  return entries.filter((entry) => entry.route === route);
}

function sortEntries(entries: DecisionLogEntry[], order: OrderMode): DecisionLogEntry[] {
  if (order === "newest") {
    return [...entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
  return [...entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

async function main() {
  console.log("decision-stats.ts wurde gestartet\n");

  const options = parseArgs(process.argv.slice(2));
  console.log(`Route-Filter: ${options.route}`);
  console.log(`Reihenfolge: ${options.order}`);
  console.log(`Limit: ${options.limit}\n`);

  const allEntries = await readDecisionLog(options.limit);
  const filteredEntries = filterEntries(allEntries, options.route);
  const entries = sortEntries(filteredEntries, options.order);

  if (entries.length === 0) {
    console.log("Keine passenden Log-Einträge gefunden.");
    return;
  }

  const totalEntries = entries.length;
  const routes = entries.map((entry) => entry.route);
  const routeCounts = countBy(routes);
  const councilEntries = entries.filter((entry) => entry.route === "council");
  const directEntries = entries.filter((entry) => entry.route === "direct");

  const confidences = councilEntries
    .map((entry) => entry.confidence)
    .filter((value): value is number => typeof value === "number");

  const avgConfidence = average(confidences);
  const recommendationCounts = countBy(collectRecommendations(councilEntries));
  const firstStepCounts = countBy(collectFirstSteps(councilEntries));
  const optionCounts = countBy(collectOptions(councilEntries));

  const directCount = routeCounts.direct ?? 0;
  const councilCount = routeCounts.council ?? 0;
  const directShare = round((directEntries.length / totalEntries) * 100);
  const councilShare = round((councilEntries.length / totalEntries) * 100);

  const topRecommendations = topNFromMap(recommendationCounts, 5);
  const topFirstSteps = topNFromMap(firstStepCounts, 5);
  const topOptions = topNFromMap(optionCounts, 8);
  const latestEntries = entries.slice(0, 5);
  const patterns = aggregatePatterns(councilEntries);

  const byDay = aggregateByPeriod(entries, "day");
  const byWeek = aggregateByPeriod(entries, "week");
  const byMonth = aggregateByPeriod(entries, "month");

  printSectionTitle("Decision Stats v4");
  printKeyValue("Gesamtanzahl Einträge", totalEntries);
  printKeyValue("Direct", directCount);
  printKeyValue("Council", councilCount);
  printKeyValue("Direct Anteil", `${directShare}%`);
  printKeyValue("Council Anteil", `${councilShare}%`);
  printKeyValue("Route Filter", options.route);
  printKeyValue("Reihenfolge", options.order);
  if (avgConfidence !== null) {
    printKeyValue("Ø Konfidenz (Council)", `${round(avgConfidence * 100)}%`);
  } else {
    printKeyValue("Ø Konfidenz (Council)", "-");
  }

  printAsciiDistribution({ directCount, councilCount });
  printTopItems("Häufigste Empfehlungen", topRecommendations);
  printTopItems("Häufigste erste Schritte", topFirstSteps);
  printTopItems("Häufigste Optionen", topOptions);
  printAsciiHeatmap("Heatmap: Empfehlungen", topRecommendations);
  printAsciiHeatmap("Heatmap: Erste Schritte", topFirstSteps);
  printAsciiHeatmap("Heatmap: Optionen", topOptions);

  printPeriodTable("Aggregation pro Tag", byDay);
  printPeriodTable("Aggregation pro Woche", byWeek);
  printPeriodTable("Aggregation pro Monat", byMonth);
  printPatternScorecard(patterns);

  console.log("\nLetzte 5 Einträge");
  for (const entry of latestEntries) {
    console.log("\n--------------------------------------");
    console.log(`Zeit: ${entry.timestamp}`);
    console.log(`Route: ${entry.route}`);
    console.log(`Frage: ${entry.userInput}`);
    console.log(`Empfehlung: ${entry.recommendation ?? "-"}`);
    console.log(`Erster Schritt: ${entry.firstStep ?? "-"}`);
    console.log(`Konfidenz: ${typeof entry.confidence === "number" ? `${Math.round(entry.confidence * 100)}%` : "-"}`);
    if (entry.extractedOptions && entry.extractedOptions.length > 0) {
      console.log("Optionen:");
      for (const option of entry.extractedOptions) {
        console.log(`- ${option}`);
      }
    }
  }

  const timestampTag = formatDateForName(new Date());
  const summaryRows = buildSummaryRows({
    route: options.route,
    order: options.order,
    totalEntries,
    directCount,
    councilCount,
    directShare,
    councilShare,
    avgConfidence,
    topRecommendations,
    topFirstSteps,
    topOptions,
    patterns,
    byDay,
    byWeek,
    byMonth,
  });

  const csvFiles = await exportCsvFiles(
    entries,
    options.route,
    options.order,
    summaryRows,
    topRecommendations,
    topFirstSteps,
    topOptions,
    patterns,
    timestampTag
  );

  const excelFiles = await exportExcelFiles({
    entries,
    route: options.route,
    order: options.order,
    totalEntries,
    directCount,
    councilCount,
    directShare,
    councilShare,
    avgConfidence,
    topRecommendations,
    topFirstSteps,
    topOptions,
    patterns,
    byDay,
    byWeek,
    byMonth,
    timestampTag,
  });

  console.log("\n--------------------------------------");
  console.log("CSV-Export (voll):");
  console.log(csvFiles.fullPath);
  console.log("CSV-Export (kompakt):");
  console.log(csvFiles.compactPath);
  console.log("CSV-Export (Summary):");
  console.log(csvFiles.summaryPath);
  console.log("CSV-Export (Empfehlungen):");
  console.log(csvFiles.recommendationsPath);
  console.log("CSV-Export (Erste Schritte):");
  console.log(csvFiles.firstStepsPath);
  console.log("CSV-Export (Optionen):");
  console.log(csvFiles.optionsPath);
  console.log("CSV-Export (Patterns):");
  console.log(csvFiles.patternsPath);
  console.log("--------------------------------------");

  console.log("\n--------------------------------------");
  console.log("Excel-Export (Report mit Entries + Summary + Zeitaggregation + Patterns):");
  console.log(excelFiles.reportPath);
  console.log("Excel-Export (nur Summary + Zeitaggregation + Patterns):");
  console.log(excelFiles.summaryOnlyPath);
  console.log("--------------------------------------");

  console.log("\nFERTIG");
}

main().catch((err) => {
  console.error("Fehler in decision-stats.ts:");
  console.error(err);
});
