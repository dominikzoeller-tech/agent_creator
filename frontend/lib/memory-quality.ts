import { readFile } from "node:fs/promises";
import path from "node:path";

export type MemoryQualitySeverity = "info" | "warning" | "error";

export interface MemoryQualityIssue {
  code: string;
  severity: MemoryQualitySeverity;
  message: string;
}

export interface MemoryQualityEntryReport {
  id: string;
  type: string;
  title: string;
  tags: string[];
  source?: string;
  summaryLength: number;
  wordCount: number;
  createdAt?: string;
  updatedAt?: string;
  issues: MemoryQualityIssue[];
}

export interface MemoryQualityReport {
  ok: true;
  memoryFile: string;
  totalEntries: number;
  entriesWithIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  duplicateTitleGroups: string[][];
  reports: MemoryQualityEntryReport[];
}

const ALLOWED_TYPES = new Set(["decision", "milestone", "issue", "preference", "system-state", "note"]);
const DEFAULT_MEMORY_FILE = path.join(process.cwd(), "memory", "project-memory.json");

interface RawMemoryEntry {
  id?: string;
  type?: string;
  title?: string;
  summary?: string;
  tags?: string[];
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function buildMemoryQualityReport(memoryFile = DEFAULT_MEMORY_FILE): Promise<MemoryQualityReport> {
  const raw = await readFile(memoryFile, "utf8");
  const parsed = JSON.parse(raw) as { entries?: RawMemoryEntry[] };
  const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
  const duplicateTitleGroups = findDuplicateTitleGroups(entries);
  const duplicateTitleIds = new Set(duplicateTitleGroups.flat());

  const reports = entries.map((entry) => {
    const issues = evaluateEntry(entry, duplicateTitleIds);
    const summary = entry.summary ?? "";
    return {
      id: entry.id ?? "",
      type: entry.type ?? "",
      title: entry.title ?? "",
      tags: Array.isArray(entry.tags) ? entry.tags : [],
      source: entry.source,
      summaryLength: summary.length,
      wordCount: countWords(summary),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      issues,
    } satisfies MemoryQualityEntryReport;
  });

  return {
    ok: true,
    memoryFile,
    totalEntries: reports.length,
    entriesWithIssues: reports.filter((report) => report.issues.length > 0).length,
    errorCount: countSeverity(reports, "error"),
    warningCount: countSeverity(reports, "warning"),
    infoCount: countSeverity(reports, "info"),
    duplicateTitleGroups,
    reports: reports.sort((a, b) => b.issues.length - a.issues.length || a.title.localeCompare(b.title)),
  };
}

function evaluateEntry(entry: RawMemoryEntry, duplicateTitleIds: Set<string>): MemoryQualityIssue[] {
  const issues: MemoryQualityIssue[] = [];
  const id = entry.id ?? "";
  const title = (entry.title ?? "").trim();
  const summary = (entry.summary ?? "").trim();
  const tags = Array.isArray(entry.tags) ? entry.tags.filter(Boolean) : [];
  const type = entry.type ?? "";

  if (!id) issues.push({ code: "missing-id", severity: "error", message: "Memory-Eintrag hat keine ID." });
  if (!title) issues.push({ code: "missing-title", severity: "error", message: "Memory-Eintrag hat keinen Titel." });
  if (!summary) issues.push({ code: "missing-summary", severity: "error", message: "Memory-Eintrag hat keine Summary." });
  if (!ALLOWED_TYPES.has(type)) issues.push({ code: "invalid-type", severity: "warning", message: `Memory-Typ ist unbekannt: ${type || "leer"}.` });
  if (tags.length === 0) issues.push({ code: "missing-tags", severity: "warning", message: "Memory-Eintrag hat keine Tags." });
  if (summary && countWords(summary) < 8) issues.push({ code: "very-short-summary", severity: "info", message: "Summary ist sehr kurz und liefert eventuell wenig Kontext." });
  if (summary.length > 4000) issues.push({ code: "very-long-summary", severity: "info", message: "Summary ist sehr lang. KÃ¼rzen kÃ¶nnte die TrefferqualitÃ¤t verbessern." });
  if (duplicateTitleIds.has(id)) issues.push({ code: "duplicate-title", severity: "warning", message: "Titel kommt in mehreren Memory-EintrÃ¤gen vor." });
  if (type === "system-state" && entry.updatedAt && isOlderThanDays(entry.updatedAt, 30)) {
    issues.push({ code: "old-system-state", severity: "info", message: "System-State ist Ã¤lter als 30 Tage und sollte geprÃ¼ft werden." });
  }
  if (!entry.createdAt || !entry.updatedAt) issues.push({ code: "missing-timestamps", severity: "info", message: "createdAt oder updatedAt fehlt." });

  return issues;
}

function findDuplicateTitleGroups(entries: RawMemoryEntry[]): string[][] {
  const groups = new Map<string, string[]>();
  for (const entry of entries) {
    const key = normalizeText(entry.title ?? "");
    if (!key || key.length < 4) continue;
    const ids = groups.get(key) ?? [];
    ids.push(entry.id ?? "unknown-id");
    groups.set(key, ids);
  }
  return Array.from(groups.values()).filter((group) => group.length >= 2);
}

function countWords(value: string): number {
  return value.split(/\r?\n/).map((word) => word.trim()).filter(Boolean).length;
}

function countSeverity(reports: MemoryQualityEntryReport[], severity: MemoryQualitySeverity): number {
  return reports.reduce((sum, report) => sum + report.issues.filter((issue) => issue.severity === severity).length, 0);
}

function isOlderThanDays(value: string, days: number): boolean {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return false;
  return Date.now() - time > days * 24 * 60 * 60 * 1000;
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

