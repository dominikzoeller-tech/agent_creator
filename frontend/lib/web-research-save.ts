import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface WebResearchSavePayload {
  query: string;
  summary?: string;
  results?: Array<{ title?: string; url?: string; snippet?: string; source?: string }>;
  sources?: Array<{ title?: string; url?: string; source?: string }>;
  saveKnowledge?: boolean;
  saveMemory?: boolean;
  memoryType?: "decision" | "milestone" | "issue" | "preference" | "system-state" | "note";
  tags?: string[];
}

export interface WebResearchSaveResult {
  ok: true;
  savedKnowledge?: boolean;
  savedKnowledgePath?: string;
  savedMemory?: boolean;
  savedMemoryId?: string;
  message: string;
}

const DEFAULT_KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/knowledge";
const DEFAULT_MEMORY_DIR = process.env.MEMORY_DIR || "/memory";
const MEMORY_FILE_NAME = "project-memory.json";

export async function saveWebResearch(payload: WebResearchSavePayload): Promise<WebResearchSaveResult> {
  const query = normalizeText(payload.query);
  if (!query) throw new Error("Query fehlt.");

  const tags = normalizeTags(payload.tags ?? ["web-research", "research"]);
  const now = new Date().toISOString();
  const summary = normalizeText(payload.summary) || "Keine AI Research Summary vorhanden.";

  let savedKnowledgePath: string | undefined;
  let savedMemoryId: string | undefined;

  if (payload.saveKnowledge) {
    savedKnowledgePath = await saveKnowledgeDocument({
      query,
      summary,
      results: payload.results ?? [],
      sources: payload.sources ?? [],
      tags,
      now,
    });
  }

  if (payload.saveMemory) {
    savedMemoryId = await saveMemoryEntry({
      query,
      summary,
      sources: payload.sources ?? [],
      tags,
      now,
      type: payload.memoryType ?? "note",
    });
  }

  return {
    ok: true,
    savedKnowledge: Boolean(savedKnowledgePath),
    savedKnowledgePath,
    savedMemory: Boolean(savedMemoryId),
    savedMemoryId,
    message: "Web Research wurde gespeichert.",
  };
}

async function saveKnowledgeDocument(input: {
  query: string;
  summary: string;
  results: Array<{ title?: string; url?: string; snippet?: string; source?: string }>;
  sources: Array<{ title?: string; url?: string; source?: string }>;
  tags: string[];
  now: string;
}): Promise<string> {
  await mkdir(DEFAULT_KNOWLEDGE_DIR, { recursive: true });
  const filename = `${slugify(input.query).slice(0, 70) || "web-research"}-${input.now.replace(/[^0-9]/g, "").slice(0, 14)}.md`;
  const targetPath = path.join(DEFAULT_KNOWLEDGE_DIR, filename);

  const content = [
    `# Web Research: ${input.query}`,
    "",
    `- Erstellt: ${input.now}`,
    `- Tags: ${input.tags.join(", ")}`,
    `- Quelle: phase9.5-web-research-save`,
    "",
    "## AI Research Summary",
    "",
    input.summary,
    "",
    "## Suchtreffer",
    "",
    ...(input.results.length
      ? input.results.map((result, index) => [
          `### Treffer ${index + 1}: ${result.title ?? "Ohne Titel"}`,
          "",
          `- URL: ${result.url ?? ""}`,
          `- Source: ${result.source ?? ""}`,
          "",
          result.snippet ?? "",
          "",
        ].join("\n"))
      : ["Keine Suchtreffer gespeichert.\n"]),
    "## Quellen",
    "",
    ...(input.sources.length
      ? input.sources.map((source, index) => `- Quelle ${index + 1}: [${source.title ?? source.url ?? "Quelle"}](${source.url ?? ""})${source.source ? ` â€” ${source.source}` : ""}`)
      : ["- Keine Quellen gespeichert."]),
    "",
  ].join("\n");

  await writeFile(targetPath, content, "utf8");
  return targetPath;
}

async function saveMemoryEntry(input: {
  query: string;
  summary: string;
  sources: Array<{ title?: string; url?: string; source?: string }>;
  tags: string[];
  now: string;
  type: "decision" | "milestone" | "issue" | "preference" | "system-state" | "note";
}): Promise<string> {
  await mkdir(DEFAULT_MEMORY_DIR, { recursive: true });
  const memoryFile = path.join(DEFAULT_MEMORY_DIR, MEMORY_FILE_NAME);
  let entries: Record<string, unknown>[] = [];

  try {
    const raw = await readFile(memoryFile, "utf8");
    const parsed = JSON.parse(raw) as { entries?: Record<string, unknown>[] };
    entries = Array.isArray(parsed.entries) ? parsed.entries : [];
  } catch {
    entries = [];
  }

  const id = `web-research-${slugify(input.query).slice(0, 45) || "summary"}-${input.now.replace(/[^0-9]/g, "").slice(0, 14)}`;
  const sourceList = input.sources.slice(0, 5).map((source, index) => `Quelle ${index + 1}: ${source.title ?? source.url ?? "Quelle"} (${source.url ?? ""})`).join("; ");
  const entry = {
    id,
    type: input.type,
    title: `Web Research: ${input.query}`,
    summary: `${input.summary}${sourceList ? ` Quellen: ${sourceList}` : ""}`,
    tags: Array.from(new Set(["web-research", ...input.tags])),
    source: "phase9.5-web-research-save",
    createdAt: input.now,
    updatedAt: input.now,
  };

  await writeFile(memoryFile, JSON.stringify({ entries: [entry, ...entries] }, null, 2) + "\n", "utf8");
  return id;
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return ["web-research", "research"];
  return Array.from(new Set(value.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9Ã¤Ã¶Ã¼ÃŸ]+/g, "-").replace(/^-|-$/g, "");
}

