import { mkdir, readFile, readdir, stat, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/knowledge";
const SUPPORTED_EXTENSIONS = new Set([".md", ".txt"]);
const MAX_CONTENT_LENGTH = 200_000;

interface KnowledgeFileSummary {
  fileName: string;
  title: string;
  tags: string[];
  size: number;
  updatedAt: string;
}

function sanitizeFileName(input: string): string {
  const trimmed = input.trim();
  const baseName = path.basename(trimmed).replace(/[^a-zA-Z0-9._-]/g, "-");
  const extension = path.extname(baseName).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error("Nur .md und .txt Dateien sind erlaubt.");
  }

  if (!baseName || baseName === extension || baseName.includes("..")) {
    throw new Error("Ungültiger Dateiname.");
  }

  return baseName;
}

function resolveKnowledgePath(fileName: string): string {
  const safeName = sanitizeFileName(fileName);
  const resolved = path.resolve(KNOWLEDGE_DIR, safeName);
  const root = path.resolve(KNOWLEDGE_DIR);

  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error("Ungültiger Knowledge-Pfad.");
  }

  return resolved;
}

function parseTitle(content: string, fileName: string): string {
  const heading = content
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith("# "))
    ?.replace(/^#\s+/, "")
    .trim();

  return heading || fileName;
}

function parseTags(content: string): string[] {
  const tagsLine = content
    .split(/\r?\n/)
    .find((line) => line.trim().toLowerCase().startsWith("tags:"));

  if (!tagsLine) return [];

  return tagsLine
    .replace(/^tags:/i, "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function ensureKnowledgeDir(): Promise<void> {
  await mkdir(KNOWLEDGE_DIR, { recursive: true });
}

async function listKnowledgeFiles(): Promise<KnowledgeFileSummary[]> {
  await ensureKnowledgeDir();
  const entries = await readdir(KNOWLEDGE_DIR, { withFileTypes: true });
  const summaries: KnowledgeFileSummary[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) continue;

    const fullPath = resolveKnowledgePath(entry.name);
    const [metadata, content] = await Promise.all([
      stat(fullPath),
      readFile(fullPath, "utf8"),
    ]);

    summaries.push({
      fileName: entry.name,
      title: parseTitle(content, entry.name),
      tags: parseTags(content),
      size: metadata.size,
      updatedAt: metadata.mtime.toISOString(),
    });
  }

  return summaries.sort((a, b) => a.fileName.localeCompare(b.fileName));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const file = url.searchParams.get("file");

  try {
    await ensureKnowledgeDir();

    if (file) {
      const fileName = sanitizeFileName(file);
      const fullPath = resolveKnowledgePath(fileName);
      const content = await readFile(fullPath, "utf8");
      const metadata = await stat(fullPath);

      return Response.json({
        ok: true,
        fileName,
        title: parseTitle(content, fileName),
        tags: parseTags(content),
        content,
        size: metadata.size,
        updatedAt: metadata.mtime.toISOString(),
      });
    }

    const files = await listKnowledgeFiles();
    return Response.json({ ok: true, files });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Knowledge-Datei konnte nicht gelesen werden.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureKnowledgeDir();
    const body = (await request.json()) as Record<string, unknown>;
    const fileName = sanitizeFileName(String(body.fileName ?? ""));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean)
      : [];
    const rawContent = typeof body.content === "string" ? body.content : "";

    if (rawContent.length > MAX_CONTENT_LENGTH) {
      throw new Error(`Datei ist zu groß. Maximum: ${MAX_CONTENT_LENGTH} Zeichen.`);
    }

    let content = rawContent.trimEnd();

    if (title && !content.trimStart().startsWith("# ")) {
      content = `# ${title}\n\n${content}`.trimEnd();
    }

    if (tags.length > 0 && !content.split(/\r?\n/).some((line) => line.trim().toLowerCase().startsWith("tags:"))) {
      const lines = content.split(/\r?\n/);
      if (lines[0]?.startsWith("# ")) {
        lines.splice(1, 0, "", `Tags: ${tags.join(", ")}`);
        content = lines.join("\n");
      } else {
        content = `Tags: ${tags.join(", ")}\n\n${content}`;
      }
    }

    const fullPath = resolveKnowledgePath(fileName);
    await writeFile(fullPath, `${content}\n`, "utf8");

    return Response.json({ ok: true, fileName, title: parseTitle(content, fileName), tags: parseTags(content) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Knowledge-Datei konnte nicht gespeichert werden.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const file = url.searchParams.get("file");

  try {
    if (!file) throw new Error("Parameter 'file' fehlt.");
    const fileName = sanitizeFileName(file);
    const fullPath = resolveKnowledgePath(fileName);
    await unlink(fullPath);
    return Response.json({ ok: true, fileName });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Knowledge-Datei konnte nicht gelöscht werden.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
