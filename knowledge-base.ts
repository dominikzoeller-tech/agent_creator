import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface KnowledgeDocument {
  id: string;
  title: string;
  sourcePath: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface KnowledgeSearchResult {
  id: string;
  title: string;
  sourcePath: string;
  score: number;
  snippet: string;
  tags: string[];
}

export interface KnowledgeSearchOptions {
  limit?: number;
  tags?: string[];
}

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const SUPPORTED_EXTENSIONS = new Set([".md", ".txt"]);

export async function ensureKnowledgeBase(): Promise<void> {
  await mkdir(KNOWLEDGE_DIR, { recursive: true });
}

export async function loadKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  await ensureKnowledgeBase();
  const files = await readdir(KNOWLEDGE_DIR, { withFileTypes: true });
  const documents: KnowledgeDocument[] = [];

  for (const file of files) {
    if (!file.isFile()) continue;
    const extension = path.extname(file.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) continue;

    const sourcePath = path.join(KNOWLEDGE_DIR, file.name);
    const content = await readFile(sourcePath, "utf8");
    const parsed = parseKnowledgeDocument(file.name, sourcePath, content);
    documents.push(parsed);
  }

  return documents.sort((a, b) => a.title.localeCompare(b.title));
}

export async function searchKnowledgeBase(
  query: string,
  options: KnowledgeSearchOptions = {}
): Promise<KnowledgeSearchResult[]> {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const queryTerms = normalizedQuery.split(" ").filter(Boolean);
  const documents = await loadKnowledgeDocuments();
  const requestedTags = (options.tags ?? []).map(normalizeText).filter(Boolean);

  const scored = documents
    .filter((document) => {
      if (requestedTags.length === 0) return true;
      const documentTags = document.tags.map(normalizeText);
      return requestedTags.every((tag) => documentTags.includes(tag));
    })
    .map((document) => {
      const searchable = normalizeText(`${document.title} ${document.tags.join(" ")} ${document.content}`);
      const score = queryTerms.reduce((sum, term) => {
        if (!term) return sum;
        const exactMatches = countOccurrences(searchable, term);
        return sum + exactMatches;
      }, 0);

      return {
        id: document.id,
        title: document.title,
        sourcePath: document.sourcePath,
        score,
        snippet: buildSnippet(document.content, queryTerms),
        tags: document.tags,
      } satisfies KnowledgeSearchResult;
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return scored.slice(0, options.limit ?? 5);
}

export async function createKnowledgeSeedFile(): Promise<string> {
  await ensureKnowledgeBase();
  const seedPath = path.join(KNOWLEDGE_DIR, "agent-routing-guide.md");
  const content = `# Agent Routing Guide\n\nTags: agents, routing, phase6\n\nDiese Wissensdatei beschreibt, dass der Agent Council-Routing-Metadaten nutzt.\n\nWichtige Felder:\n\n- suggestedAgents\n- routingDetails\n- routingSummary\n\nRouting-Analytics zeigen Top Suggested Agents, Routing-Komplexitäten und Privacy-Risiken.\n`;
  await writeFile(seedPath, content, "utf8");
  return seedPath;
}

function parseKnowledgeDocument(fileName: string, sourcePath: string, content: string): KnowledgeDocument {
  const lines = content.split(/\r?\n/);
  const heading = lines.find((line) => line.trim().startsWith("# "))?.replace(/^#\s+/, "").trim();
  const tagsLine = lines.find((line) => normalizeText(line).startsWith("tags:"));
  const tags = tagsLine
    ? tagsLine.replace(/^tags:/i, "").split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  return {
    id: slugify(fileName.replace(path.extname(fileName), "")),
    title: heading || fileName,
    sourcePath,
    content,
    tags,
    updatedAt: new Date().toISOString(),
  };
}

function buildSnippet(content: string, queryTerms: string[]): string {
  const compact = content.replace(/\s+/g, " ").trim();
  const lower = normalizeText(compact);
  const firstIndex = queryTerms
    .map((term) => lower.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (firstIndex === undefined) return compact.slice(0, 240);
  const start = Math.max(0, firstIndex - 80);
  const end = Math.min(compact.length, firstIndex + 180);
  return `${start > 0 ? "…" : ""}${compact.slice(start, end)}${end < compact.length ? "…" : ""}`;
}

function countOccurrences(value: string, term: string): number {
  if (!term) return 0;
  return value.split(term).length - 1;
}

function slugify(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "document";
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
