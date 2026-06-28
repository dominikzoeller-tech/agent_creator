import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const MEMORY_DIR = process.env.MEMORY_DIR || "/memory";
const MEMORY_FILE = path.join(MEMORY_DIR, "project-memory.json");
const MAX_SUMMARY_LENGTH = 20_000;

const ALLOWED_TYPES = new Set(["decision", "milestone", "issue", "preference", "system-state", "note"]);

type ProjectMemoryType = "decision" | "milestone" | "issue" | "preference" | "system-state" | "note";

interface ProjectMemoryEntry {
  id: string;
  type: ProjectMemoryType;
  title: string;
  summary: string;
  tags: string[];
  source?: string;
  createdAt: string;
  updatedAt: string;
}

interface MemoryStore {
  entries: ProjectMemoryEntry[];
}

async function ensureMemoryStore(): Promise<void> {
  await mkdir(MEMORY_DIR, { recursive: true });
  try {
    await readFile(MEMORY_FILE, "utf8");
  } catch {
    await writeFile(MEMORY_FILE, JSON.stringify({ entries: [] }, null, 2) + "\n", "utf8");
  }
}

async function loadStore(): Promise<MemoryStore> {
  await ensureMemoryStore();
  const raw = await readFile(MEMORY_FILE, "utf8");
  const parsed = JSON.parse(raw) as Partial<MemoryStore>;
  return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
}

async function saveStore(store: MemoryStore): Promise<void> {
  const sorted = [...store.entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  await writeFile(MEMORY_FILE, JSON.stringify({ entries: sorted }, null, 2) + "\n", "utf8");
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
  }

  if (typeof value === "string") {
    return Array.from(new Set(value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
  }

  return [];
}

function normalizeType(value: unknown): ProjectMemoryType {
  const candidate = normalizeText(value) as ProjectMemoryType;
  if (!ALLOWED_TYPES.has(candidate)) return "note";
  return candidate;
}

function buildMemoryId(type: ProjectMemoryType, title: string, timestamp: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "memory";
  const compactTime = timestamp.replace(/[^0-9]/g, "").slice(0, 14);
  return `${type}-${slug}-${compactTime}`;
}

function validateInput(title: string, summary: string): void {
  if (!title) throw new Error("Titel fehlt.");
  if (!summary) throw new Error("Summary fehlt.");
  if (summary.length > MAX_SUMMARY_LENGTH) throw new Error(`Summary ist zu lang. Maximum: ${MAX_SUMMARY_LENGTH} Zeichen.`);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type");
    const tag = url.searchParams.get("tag");
    const q = url.searchParams.get("q")?.toLowerCase().trim() ?? "";

    const store = await loadStore();
    let entries = store.entries;

    if (id) entries = entries.filter((entry) => entry.id === id);
    if (type) entries = entries.filter((entry) => entry.type === type);
    if (tag) entries = entries.filter((entry) => entry.tags.includes(tag.toLowerCase().trim()));
    if (q) {
      entries = entries.filter((entry) => [entry.title, entry.summary, entry.type, entry.source ?? "", entry.tags.join(" ")].join(" ").toLowerCase().includes(q));
    }

    return Response.json({ ok: true, entries, total: store.entries.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project Memory konnte nicht gelesen werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const store = await loadStore();
    const now = new Date().toISOString();

    const id = normalizeText(body.id);
    const type = normalizeType(body.type);
    const title = normalizeText(body.title);
    const summary = normalizeText(body.summary);
    const tags = normalizeTags(body.tags);
    const source = normalizeText(body.source) || undefined;

    validateInput(title, summary);

    if (id) {
      const index = store.entries.findIndex((entry) => entry.id === id);
      if (index === -1) throw new Error(`Memory-Eintrag nicht gefunden: ${id}`);

      const existing = store.entries[index];
      store.entries[index] = {
        ...existing,
        type,
        title,
        summary,
        tags,
        source,
        updatedAt: now,
      };

      await saveStore(store);
      return Response.json({ ok: true, entry: store.entries[index], mode: "updated" });
    }

    const entry: ProjectMemoryEntry = {
      id: buildMemoryId(type, title, now),
      type,
      title,
      summary,
      tags,
      source,
      createdAt: now,
      updatedAt: now,
    };

    await saveStore({ entries: [entry, ...store.entries] });
    return Response.json({ ok: true, entry, mode: "created" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project Memory konnte nicht gespeichert werden.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) throw new Error("Parameter 'id' fehlt.");

    const store = await loadStore();
    const nextEntries = store.entries.filter((entry) => entry.id !== id);
    if (nextEntries.length === store.entries.length) throw new Error(`Memory-Eintrag nicht gefunden: ${id}`);

    await saveStore({ entries: nextEntries });
    return Response.json({ ok: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project Memory konnte nicht gelöscht werden.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
