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
  minScore?: number;
}

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const SUPPORTED_EXTENSIONS = new Set([".md", ".txt"]);

const KNOWLEDGE_STOPWORDS = new Set([
  "der", "die", "das", "den", "dem", "des", "ein", "eine", "einer", "einem", "einen",
  "und", "oder", "aber", "wenn", "dann", "wie", "was", "warum", "wieso", "welche", "welcher", "welches",
  "ich", "du", "wir", "ihr", "sie", "es", "ist", "sind", "sein", "für", "mit", "auf", "aus", "von", "im", "in",
  "zu", "zur", "zum", "am", "an", "als", "auch", "noch", "nur", "bitte", "mir", "mich", "mein", "meine",
  "the", "a", "an", "and", "or", "but", "if", "then", "how", "what", "why", "which", "is", "are", "to", "for", "with", "of", "in", "on"
]);

const TITLE_MATCH_WEIGHT = 8;
const TAG_MATCH_WEIGHT = 6;
const CONTENT_MATCH_WEIGHT = 1;
const EXACT_PHRASE_WEIGHT = 10;
const DEFAULT_MIN_SCORE = 2;

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

  const queryTerms = tokenizeKnowledgeQuery(normalizedQuery);
  if (queryTerms.length === 0) return [];

  const documents = await loadKnowledgeDocuments();
  const requestedTags = (options.tags ?? []).map(normalizeText).filter(Boolean);
  const minScore = typeof options.minScore === "number" ? options.minScore : DEFAULT_MIN_SCORE;

  const scored = documents
    .filter((document) => {
      if (requestedTags.length === 0) return true;
      const documentTags = document.tags.map(normalizeText);
      return requestedTags.every((tag) => documentTags.includes(tag));
    })
    .map((document) => {
      const titleText = normalizeText(document.title);
      const tagText = normalizeText(document.tags.join(" "));
      const contentText = normalizeText(document.content);

      const titleScore = scoreText(titleText, queryTerms, TITLE_MATCH_WEIGHT);
      const tagScore = scoreText(tagText, queryTerms, TAG_MATCH_WEIGHT);
      const contentScore = scoreText(contentText, queryTerms, CONTENT_MATCH_WEIGHT);
      const exactPhraseScore =
        contentText.includes(normalizedQuery) || titleText.includes(normalizedQuery)
          ? EXACT_PHRASE_WEIGHT
          : 0;

      const score = titleScore + tagScore + contentScore + exactPhraseScore;

      return {
        id: document.id,
        title: document.title,
        sourcePath: document.sourcePath,
        score,
        snippet: buildSnippet(document.content, queryTerms),
        tags: document.tags,
      } satisfies KnowledgeSearchResult;
    })
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return scored.slice(0, options.limit ?? 5);
}

export async function createKnowledgeSeedFile(): Promise<string> {
  await ensureKnowledgeBase();

  const seedPath = path.join(KNOWLEDGE_DIR, "agent-routing-guide.md");
  const content = [
    "# Agent Routing Guide",
    "",
    "Tags: agents, routing, phase6",
    "",
    "Diese Wissensdatei beschreibt, dass der Agent Council-Routing-Metadaten nutzt.",
    "",
    "Wichtige Felder:",
    "",
    "- suggestedAgents",
    "- routingDetails",
    "- routingSummary",
    "",
    "Routing-Analytics zeigen Top Suggested Agents, Routing-Komplexitäten und Privacy-Risiken.",
    "",
  ].join("\n");

  await writeFile(seedPath, content, "utf8");
  return seedPath;
}

function parseKnowledgeDocument(fileName: string, sourcePath: string, content: string): KnowledgeDocument {
  const lines = content.split(/\r?\n/);

  const heading = lines
    .find((line) => line.trim().startsWith("# "))
    ?.replace(/^#\s+/, "")
    .trim();

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

  const bestTerm = queryTerms
    .map((term) => ({ term, index: lower.indexOf(term) }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index)[0];

  if (!bestTerm) return compact.slice(0, 260);

  const start = Math.max(0, bestTerm.index - 90);
  const end = Math.min(compact.length, bestTerm.index + 210);

  return (start > 0 ? "..." : "") + compact.slice(start, end) + (end < compact.length ? "..." : "");
}

function tokenizeKnowledgeQuery(value: string): string[] {
  return value
    .split(/[^a-zA-Z0-9äöüÄÖÜß_-]+/)
    .map((term) => normalizeText(term))
    .filter((term) => term.length >= 2)
    .filter((term) => !KNOWLEDGE_STOPWORDS.has(term));
}

function scoreText(value: string, queryTerms: string[], weight: number): number {
  return queryTerms.reduce((sum, term) => {
    const occurrences = countOccurrences(value, term);
    if (occurrences === 0) return sum;
    return sum + occurrences * weight;
  }, 0);
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
