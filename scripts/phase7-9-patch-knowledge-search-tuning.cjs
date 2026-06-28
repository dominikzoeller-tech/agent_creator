const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "knowledge-base.ts");

if (!fs.existsSync(target)) {
  console.error("knowledge-base.ts wurde im Projekt-Root nicht gefunden.");
  process.exit(1);
}

let content = fs.readFileSync(target, "utf8");
const original = content;

function replaceFunction(source, functionName, replacement) {
  const startMarker = `export async function ${functionName}`;
  const start = source.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`Funktion ${functionName} nicht gefunden.`);
  }

  let braceStart = source.indexOf("{", start);
  if (braceStart === -1) {
    throw new Error(`Ã–ffnende Klammer fÃ¼r ${functionName} nicht gefunden.`);
  }

  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    const char = source[i];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) {
      return source.slice(0, start) + replacement.trimEnd() + source.slice(i + 1);
    }
  }

  throw new Error(`Ende von ${functionName} nicht gefunden.`);
}

function ensureBeforeFunction(source, functionName, block) {
  if (source.includes("const KNOWLEDGE_STOPWORDS")) return source;
  const marker = `export async function ${functionName}`;
  const index = source.indexOf(marker);
  if (index === -1) throw new Error(`Marker ${marker} nicht gefunden.`);
  return source.slice(0, index) + block.trimEnd() + "\n\n" + source.slice(index);
}

const tuningConstants = `const KNOWLEDGE_STOPWORDS = new Set([
  "der", "die", "das", "den", "dem", "des", "ein", "eine", "einer", "einem", "einen",
  "und", "oder", "aber", "wenn", "dann", "wie", "was", "warum", "wieso", "welche", "welcher", "welches",
  "ich", "du", "wir", "ihr", "sie", "es", "ist", "sind", "sein", "fÃ¼r", "mit", "auf", "aus", "von", "im", "in",
  "zu", "zur", "zum", "am", "an", "als", "auch", "noch", "nur", "bitte", "mir", "mich", "mein", "meine",
  "the", "a", "an", "and", "or", "but", "if", "then", "how", "what", "why", "which", "is", "are", "to", "for", "with", "of", "in", "on"
]);

const TITLE_MATCH_WEIGHT = 8;
const TAG_MATCH_WEIGHT = 6;
const CONTENT_MATCH_WEIGHT = 1;
const EXACT_PHRASE_WEIGHT = 10;
const DEFAULT_MIN_SCORE = 2;
`;

const newSearchFunction = `export async function searchKnowledgeBase(
  query: string,
  options: KnowledgeSearchOptions = {}
): Promise<KnowledgeSearchResult[]> {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const queryTerms = tokenizeKnowledgeQuery(normalizedQuery);
  if (queryTerms.length === 0) return [];

  const documents = await loadKnowledgeDocuments();
  const requestedTags = (options.tags ?? []).map(normalizeText).filter(Boolean);
  const minScore = typeof (options as { minScore?: number }).minScore === "number"
    ? (options as { minScore?: number }).minScore ?? DEFAULT_MIN_SCORE
    : DEFAULT_MIN_SCORE;

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
      const exactPhraseScore = contentText.includes(normalizedQuery) || titleText.includes(normalizedQuery)
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
}`;

// Extend KnowledgeSearchOptions with minScore if missing.
if (!content.includes("minScore?: number;")) {
  content = content.replace(
    "export interface KnowledgeSearchOptions {\n  limit?: number;\n  tags?: string[];\n}",
    "export interface KnowledgeSearchOptions {\n  limit?: number;\n  tags?: string[];\n  minScore?: number;\n}"
  );
}

content = ensureBeforeFunction(content, "searchKnowledgeBase", tuningConstants);
content = replaceFunction(content, "searchKnowledgeBase", newSearchFunction);

// Add helper functions before countOccurrences or before slugify.
if (!content.includes("function tokenizeKnowledgeQuery")) {
  const helperBlock = `
function tokenizeKnowledgeQuery(value: string): string[] {
  return value
    .split(/[^a-zA-Z0-9Ã¤Ã¶Ã¼Ã„Ã–ÃœÃŸ_-]+/)
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
`;
  const marker = "function countOccurrences";
  const index = content.indexOf(marker);
  if (index === -1) throw new Error("countOccurrences Marker nicht gefunden.");
  content = content.slice(0, index) + helperBlock + "\n" + content.slice(index);
}

// Improve snippet if old buildSnippet is present.
if (!content.includes("const bestTerm = queryTerms")) {
  const snippetStart = content.indexOf("function buildSnippet(content: string, queryTerms: string[]): string {");
  if (snippetStart !== -1) {
    let braceStart = content.indexOf("{", snippetStart);
    let depth = 0;
    for (let i = braceStart; i < content.length; i++) {
      if (content[i] === "{") depth += 1;
      if (content[i] === "}") depth -= 1;
      if (depth === 0) {
        const newSnippet = `function buildSnippet(content: string, queryTerms: string[]): string {
  const compact = content.replace(/\\s+/g, " ").trim();
  const lower = normalizeText(compact);
  const bestTerm = queryTerms
    .map((term) => ({ term, index: lower.indexOf(term) }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index)[0];

  if (!bestTerm) return compact.slice(0, 260);

  const start = Math.max(0, bestTerm.index - 90);
  const end = Math.min(compact.length, bestTerm.index + 210);
  return (start > 0 ? "..." : "") + compact.slice(start, end) + (end < compact.length ? "..." : "");
}`;
        content = content.slice(0, snippetStart) + newSnippet + content.slice(i + 1);
        break;
      }
    }
  }
}

if (content === original) {
  console.log("Keine Ã„nderung nÃ¶tig. Knowledge Search Tuning scheint bereits aktiv zu sein.");
} else {
  fs.writeFileSync(target, content, "utf8");
  console.log("OK knowledge-base.ts: gewichtete Suche, Stopwords, minScore und Snippet-Tuning ergÃ¤nzt.");
}

