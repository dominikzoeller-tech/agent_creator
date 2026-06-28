import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const route = url.searchParams.get("route") ?? "all";
  const search = normalizeText(url.searchParams.get("search") ?? "");
  const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit") ?? 100), 500));
  const logPath = path.join(process.cwd(), "..", "logs", "decision-log.jsonl");

  try {
    const raw = await readFile(logPath, "utf8");
    let entries = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (route === "direct" || route === "council") {
      entries = entries.filter((entry: any) => entry.route === route);
    }

    if (search) {
      entries = entries.filter((entry: any) => {
        const haystack = normalizeText(
          [entry.userInput, entry.recommendation, entry.firstStep, entry.routingSummary, entry.knowledgeSummary, entry.memorySummary, ...(entry.extractedOptions ?? []), ...(entry.suggestedAgents ?? []), ...((entry.knowledgeHits ?? []).map((hit: any) => [hit.title, hit.sourcePath, ...(hit.tags ?? [])].filter(Boolean).join(' '))), ...((entry.memoryHits ?? []).map((hit: any) => [hit.title, hit.type, hit.summary, ...(hit.tags ?? [])].filter(Boolean).join(' ')))]
            .filter(Boolean)
            .join(" ")
        );
        return haystack.includes(search);
      });
    }

    entries = entries
      .sort((a: any, b: any) => String(b.timestamp ?? "").localeCompare(String(a.timestamp ?? "")))
      .slice(0, limit);

    return Response.json({ ok: true, entries, filters: { route, search, limit } });
  } catch {
    return Response.json({ ok: true, entries: [], filters: { route, search, limit }, note: "Log-Datei nicht gefunden oder leer." });
  }
}
