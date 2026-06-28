import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export interface SessionSummaryOptions {
  limit?: number;
  save?: boolean;
  logsDir?: string;
  memoryDir?: string;
}

export interface SessionSummaryProposal {
  type: "milestone" | "decision" | "note";
  title: string;
  summary: string;
  tags: string[];
  source: string;
}

export interface SessionSummaryResult {
  ok: true;
  totalLogEntries: number;
  usedMemoryCount: number;
  usedKnowledgeCount: number;
  routes: Record<string, number>;
  topMemoryTitles: string[];
  topKnowledgeTitles: string[];
  proposal: SessionSummaryProposal;
  saved?: boolean;
  savedEntryId?: string;
}

type LogEntry = Record<string, unknown>;

const DEFAULT_LOGS_DIR = process.env.LOGS_DIR || "/logs";
const DEFAULT_MEMORY_DIR = process.env.MEMORY_DIR || "/memory";
const MEMORY_FILE_NAME = "project-memory.json";

export async function buildSessionSummaryToMemory(
  options: SessionSummaryOptions = {}
): Promise<SessionSummaryResult> {
  const logsDir = options.logsDir ?? DEFAULT_LOGS_DIR;
  const memoryDir = options.memoryDir ?? DEFAULT_MEMORY_DIR;
  const limit = options.limit ?? 25;
  const entries = await loadRecentLogEntries(logsDir, limit);

  const usedMemoryEntries = entries.filter((entry) => Boolean(entry.usedMemory) || Array.isArray(entry.memoryHits));
  const usedKnowledgeEntries = entries.filter((entry) => Boolean(entry.usedKnowledge) || Array.isArray(entry.knowledgeHits));
  const routes = countBy(entries.map((entry) => String(entry.route ?? entry.mode ?? "unknown")));
  const topMemoryTitles = topItems(
    usedMemoryEntries.flatMap((entry) => readHits(entry.memoryHits).map((hit) => String(hit.title ?? hit.id ?? "").trim()).filter(Boolean)),
    5
  );
  const topKnowledgeTitles = topItems(
    usedKnowledgeEntries.flatMap((entry) => readHits(entry.knowledgeHits).map((hit) => String(hit.title ?? hit.sourcePath ?? "").trim()).filter(Boolean)),
    5
  );

  const proposal = buildMemoryProposal({
    total: entries.length,
    usedMemoryCount: usedMemoryEntries.length,
    usedKnowledgeCount: usedKnowledgeEntries.length,
    routes,
    topMemoryTitles,
    topKnowledgeTitles,
  });

  const result: SessionSummaryResult = {
    ok: true,
    totalLogEntries: entries.length,
    usedMemoryCount: usedMemoryEntries.length,
    usedKnowledgeCount: usedKnowledgeEntries.length,
    routes,
    topMemoryTitles,
    topKnowledgeTitles,
    proposal,
  };

  if (options.save) {
    const savedEntryId = await saveProposalAsMemory(memoryDir, proposal);
    result.saved = true;
    result.savedEntryId = savedEntryId;
  }

  return result;
}

async function loadRecentLogEntries(logsDir: string, limit: number): Promise<LogEntry[]> {
  let files: string[] = [];
  try {
    const entries = await readdir(logsDir, { withFileTypes: true });
    files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name).filter((name) => name.endsWith(".jsonl") || name.endsWith(".log"));
  } catch {
    return [];
  }

  const allLines: string[] = [];
  for (const file of files.sort()) {
    try {
      const raw = await readFile(path.join(logsDir, file), "utf8");
      allLines.push(...raw.split(/\r?\n/).filter(Boolean));
    } catch {
      // Ignore unreadable log files.
    }
  }

  return allLines
    .slice(-limit)
    .map((line) => {
      try { return JSON.parse(line) as LogEntry; } catch { return null; }
    })
    .filter((entry): entry is LogEntry => entry !== null);
}

function readHits(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null) : [];
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    const key = value || "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function topItems(values: string[], limit: number): string[] {
  const counts = countBy(values.filter(Boolean));
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([label]) => label);
}

function buildMemoryProposal(input: {
  total: number;
  usedMemoryCount: number;
  usedKnowledgeCount: number;
  routes: Record<string, number>;
  topMemoryTitles: string[];
  topKnowledgeTitles: string[];
}): SessionSummaryProposal {
  const routeSummary = Object.entries(input.routes).map(([route, count]) => `${route}: ${count}`).join(", ") || "keine Routen";
  const memoryTitles = input.topMemoryTitles.length ? input.topMemoryTitles.join(", ") : "keine Memory-Titel";
  const knowledgeTitles = input.topKnowledgeTitles.length ? input.topKnowledgeTitles.join(", ") : "keine Knowledge-Titel";

  return {
    type: "note",
    title: `Session Summary: ${new Date().toISOString().slice(0, 10)}`,
    summary: [
      `Aus den letzten ${input.total} Logeinträgen wurde eine Session-Zusammenfassung erstellt.`,
      `Project Memory wurde ${input.usedMemoryCount} Mal genutzt.`,
      `Knowledge wurde ${input.usedKnowledgeCount} Mal genutzt.`,
      `Routenverteilung: ${routeSummary}.`,
      `Top Memory-Titel: ${memoryTitles}.`,
      `Top Knowledge-Titel: ${knowledgeTitles}.`,
    ].join(" "),
    tags: ["session-summary", "memory", "logs"],
    source: "phase8.8-session-summary",
  };
}

async function saveProposalAsMemory(memoryDir: string, proposal: SessionSummaryProposal): Promise<string> {
  await mkdir(memoryDir, { recursive: true });
  const memoryFile = path.join(memoryDir, MEMORY_FILE_NAME);
  let entries: Record<string, unknown>[] = [];

  try {
    const raw = await readFile(memoryFile, "utf8");
    const parsed = JSON.parse(raw) as { entries?: Record<string, unknown>[] };
    entries = Array.isArray(parsed.entries) ? parsed.entries : [];
  } catch {
    entries = [];
  }

  const now = new Date().toISOString();
  const id = `note-session-summary-${now.replace(/[^0-9]/g, "").slice(0, 14)}`;
  const entry = {
    id,
    type: proposal.type,
    title: proposal.title,
    summary: proposal.summary,
    tags: proposal.tags,
    source: proposal.source,
    createdAt: now,
    updatedAt: now,
  };

  await writeFile(memoryFile, JSON.stringify({ entries: [entry, ...entries] }, null, 2) + "\n", "utf8");
  return id;
}
