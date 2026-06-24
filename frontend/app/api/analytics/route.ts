import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

interface DecisionLogEntry {
  timestamp: string;
  route: "direct" | "council";
  userInput: string;
  recommendation?: string | null;
  firstStep?: string | null;
  confidence?: number | null;
  extractedOptions?: string[];
}

function round(value: number, digits = 2) {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function inferPattern(entry: DecisionLogEntry): string {
  if (entry.extractedOptions && entry.extractedOptions.length >= 2) {
    return [...entry.extractedOptions]
      .map((option) => option.trim())
      .filter(Boolean)
      .sort((a, b) => normalizeText(a).localeCompare(normalizeText(b)))
      .join(" ⇄ ");
  }

  return normalizeText(entry.userInput).slice(0, 100);
}

function toTopItems(values: string[], limit = 5) {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = value.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export async function GET() {
  const logPath = path.join(process.cwd(), "..", "logs", "decision-log.jsonl");

  try {
    const raw = await readFile(logPath, "utf8");
    const entries: DecisionLogEntry[] = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as DecisionLogEntry;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as DecisionLogEntry[];

    const totalEntries = entries.length;
    const directEntries = entries.filter((entry) => entry.route === "direct");
    const councilEntries = entries.filter((entry) => entry.route === "council");
    const directCount = directEntries.length;
    const councilCount = councilEntries.length;
    const directSharePercent = totalEntries > 0 ? round((directCount / totalEntries) * 100) : 0;
    const councilSharePercent = totalEntries > 0 ? round((councilCount / totalEntries) * 100) : 0;

    const confidences = councilEntries
      .map((entry) => entry.confidence)
      .filter((value): value is number => typeof value === "number");

    const avgCouncilConfidencePercent = confidences.length > 0
      ? round((confidences.reduce((acc, value) => acc + value, 0) / confidences.length) * 100)
      : null;

    const topRecommendations = toTopItems(councilEntries.map((entry) => entry.recommendation ?? ""), 5);
    const topFirstSteps = toTopItems(councilEntries.map((entry) => entry.firstStep ?? ""), 5);

    const patternMap = new Map<string, { count: number; confidences: number[]; exampleQuestion: string }>();
    for (const entry of councilEntries) {
      const pattern = inferPattern(entry);
      const current = patternMap.get(pattern) ?? { count: 0, confidences: [], exampleQuestion: entry.userInput };
      current.count += 1;
      if (typeof entry.confidence === "number") current.confidences.push(entry.confidence * 100);
      patternMap.set(pattern, current);
    }

    const topPatterns = Array.from(patternMap.entries())
      .map(([pattern, value]) => ({
        pattern,
        count: value.count,
        avgConfidencePercent: value.confidences.length > 0 ? round(value.confidences.reduce((a, b) => a + b, 0) / value.confidences.length) : null,
        exampleQuestion: value.exampleQuestion,
      }))
      .sort((a, b) => b.count - a.count || a.pattern.localeCompare(b.pattern))
      .slice(0, 5);

    return Response.json({
      ok: true,
      totalEntries,
      directCount,
      councilCount,
      directSharePercent,
      councilSharePercent,
      avgCouncilConfidencePercent,
      topRecommendations,
      topFirstSteps,
      topPatterns,
    });
  } catch {
    return Response.json({
      ok: true,
      totalEntries: 0,
      directCount: 0,
      councilCount: 0,
      directSharePercent: 0,
      councilSharePercent: 0,
      avgCouncilConfidencePercent: null,
      topRecommendations: [],
      topFirstSteps: [],
      topPatterns: [],
    });
  }
}
