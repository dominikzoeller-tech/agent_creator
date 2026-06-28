import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ProjectMemoryType =
  | "decision"
  | "milestone"
  | "issue"
  | "preference"
  | "system-state"
  | "note";

export interface ProjectMemoryEntry {
  id: string;
  type: ProjectMemoryType;
  title: string;
  summary: string;
  tags: string[];
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemoryInput {
  type: ProjectMemoryType;
  title: string;
  summary: string;
  tags?: string[];
  source?: string;
}

export interface ProjectMemorySearchOptions {
  limit?: number;
  type?: ProjectMemoryType;
  tags?: string[];
}

const MEMORY_DIR = path.join(process.cwd(), "memory");
const MEMORY_FILE = path.join(MEMORY_DIR, "project-memory.json");

export async function ensureProjectMemoryStore(): Promise<void> {
  await mkdir(MEMORY_DIR, { recursive: true });
  try {
    await readFile(MEMORY_FILE, "utf8");
  } catch {
    await writeFile(MEMORY_FILE, JSON.stringify({ entries: [] }, null, 2) + "\n", "utf8");
  }
}

export async function loadProjectMemory(): Promise<ProjectMemoryEntry[]> {
  await ensureProjectMemoryStore();
  const raw = await readFile(MEMORY_FILE, "utf8");
  const parsed = JSON.parse(raw) as { entries?: ProjectMemoryEntry[] };
  return Array.isArray(parsed.entries) ? parsed.entries : [];
}

export async function saveProjectMemory(entries: ProjectMemoryEntry[]): Promise<void> {
  await ensureProjectMemoryStore();
  const sorted = [...entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  await writeFile(MEMORY_FILE, JSON.stringify({ entries: sorted }, null, 2) + "\n", "utf8");
}

export async function addProjectMemory(input: ProjectMemoryInput): Promise<ProjectMemoryEntry> {
  const entries = await loadProjectMemory();
  const now = new Date().toISOString();
  const entry: ProjectMemoryEntry = {
    id: buildMemoryId(input.type, input.title, now),
    type: input.type,
    title: input.title.trim(),
    summary: input.summary.trim(),
    tags: normalizeTags(input.tags ?? []),
    source: input.source?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  await saveProjectMemory([entry, ...entries]);
  return entry;
}

export async function searchProjectMemory(
  query: string,
  options: ProjectMemorySearchOptions = {}
): Promise<ProjectMemoryEntry[]> {
  const normalizedQuery = normalizeText(query);
  const terms = normalizedQuery.split(/\s+/).filter((term) => term.length >= 2);
  const entries = await loadProjectMemory();
  const requestedTags = normalizeTags(options.tags ?? []);

  const filtered = entries.filter((entry) => {
    if (options.type && entry.type !== options.type) return false;
    if (requestedTags.length > 0) {
      const entryTags = normalizeTags(entry.tags);
      if (!requestedTags.every((tag) => entryTags.includes(tag))) return false;
    }
    return true;
  });

  if (terms.length === 0) return filtered.slice(0, options.limit ?? 10);

  return filtered
    .map((entry) => ({ entry, score: scoreMemoryEntry(entry, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.updatedAt.localeCompare(a.entry.updatedAt))
    .map((item) => item.entry)
    .slice(0, options.limit ?? 10);
}

export async function createProjectMemorySeed(): Promise<ProjectMemoryEntry> {
  const existing = await loadProjectMemory();
  const existingSeed = existing.find((entry) => entry.id === "milestone-phase-7-knowledge-layer");
  if (existingSeed) return existingSeed;

  const now = new Date().toISOString();
  const entry: ProjectMemoryEntry = {
    id: "milestone-phase-7-knowledge-layer",
    type: "milestone",
    title: "Phase 7 Knowledge Layer abgeschlossen",
    summary:
      "Das System kann lokale Knowledge-Dateien speichern, verwalten, durchsuchen, im Agent Flow nutzen, sichtbar machen, loggen, analysieren und qualitätsprüfen.",
    tags: ["phase7", "knowledge", "milestone"],
    source: "phase8.0-seed",
    createdAt: now,
    updatedAt: now,
  };

  await saveProjectMemory([entry, ...existing]);
  return entry;
}

function scoreMemoryEntry(entry: ProjectMemoryEntry, terms: string[]): number {
  const title = normalizeText(entry.title);
  const tags = normalizeText(entry.tags.join(" "));
  const summary = normalizeText(entry.summary);
  const source = normalizeText(entry.source ?? "");

  return terms.reduce((score, term) => {
    let next = score;
    if (title.includes(term)) next += 8;
    if (tags.includes(term)) next += 5;
    if (summary.includes(term)) next += 2;
    if (source.includes(term)) next += 1;
    return next;
  }, 0);
}

function buildMemoryId(type: ProjectMemoryType, title: string, timestamp: string): string {
  const slug = normalizeText(title).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "memory";
  const compactTime = timestamp.replace(/[^0-9]/g, "").slice(0, 14);
  return `${type}-${slug}-${compactTime}`;
}

function normalizeTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((tag) => normalizeText(tag)).filter(Boolean)));
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
