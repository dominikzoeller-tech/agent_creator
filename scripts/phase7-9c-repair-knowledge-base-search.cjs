const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "knowledge-base.ts");

if (!fs.existsSync(file)) {
  console.error("knowledge-base.ts wurde nicht gefunden.");
  process.exit(1);
}

let content = fs.readFileSync(file, "utf8");
const original = content;

function decodeBasicHtmlEntities(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

content = decodeBasicHtmlEntities(content);

if (!content.includes("minScore?: number;")) {
  content = content.replace(
    "export interface KnowledgeSearchOptions {\n  limit?: number;\n  tags?: string[];\n}",
    "export interface KnowledgeSearchOptions {\n  limit?: number;\n  tags?: string[];\n  minScore?: number;\n}"
  );
}

const constants = `const KNOWLEDGE_STOPWORDS = new Set([
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
`;

if (!content.includes("const KNOWLEDGE_STOPWORDS")) {
  const marker = "export async function ensureKnowledgeBase";
  const idx = content.indexOf(marker);
  if (idx === -1) {
    console.error("Marker ensureKnowledgeBase nicht gefunden.");
    process.exit(1);
  }
  content = content.slice(0, idx) + constants + "\n" + content.slice(idx);
}

const cleanSearchFunction = `export async function searchKnowledgeBase(
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

function findSearchFunctionRange(source) {
  const lines = source.split(/\r?\n/);
  let start = lines.findIndex((line) => line.includes("export async function searchKnowledgeBase"));

  if (start === -1) {
    const promiseLine = lines.findIndex((line) => line.includes("): Promise<KnowledgeSearchResult[]>") || line.includes("): Promise&lt;KnowledgeSearchResult[]&gt;"));
    if (promiseLine !== -1) {
      start = promiseLine;
      while (start > 0 && !lines[start - 1].trim().startsWith("export async function") && lines[start - 1].trim() !== "") {
        start -= 1;
      }
      if (lines[start - 1]?.trim() === "export async function searchKnowledgeBase(") start -= 1;
    }
  }

  if (start === -1) return null;

  let end = -1;
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes("return scored.slice")) {
      for (let j = i; j < lines.length; j++) {
        if (lines[j].trim() === "}") {
          end = j;
          break;
        }
      }
      break;
    }
  }

  if (end === -1) return null;
  return { lines, start, end };
}

const range = findSearchFunctionRange(content);
if (!range) {
  console.error("Konnte den kaputten searchKnowledgeBase-Block nicht finden.");
  process.exit(1);
}

range.lines.splice(range.start, range.end - range.start + 1, ...cleanSearchFunction.split("\n"));
content = range.lines.join("\n");

if (!content.includes("function tokenizeKnowledgeQuery")) {
  const helperBlock = `
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
`;
  const marker = "function countOccurrences";
  const idx = content.indexOf(marker);
  if (idx === -1) {
    console.error("countOccurrences Marker nicht gefunden.");
    process.exit(1);
  }
  content = content.slice(0, idx) + helperBlock + "\n" + content.slice(idx);
}

// Ensure buildSnippet is syntactically safe if the previous patch inserted a broken template string.
content = content.replace(
  /return `\$\{start > 0 \? "[^`]*?" : ""\}\$\{compact\.slice\(start, end\)\}\$\{end < compact\.length \? "[^`]*?" : ""\}`;/g,
  'return (start > 0 ? "..." : "") + compact.slice(start, end) + (end < compact.length ? "..." : "");'
);

fs.writeFileSync(file, content, "utf8");

if (content === original) {
  console.log("Keine Änderung nötig. knowledge-base.ts war bereits repariert.");
} else {
  console.log("OK knowledge-base.ts: searchKnowledgeBase wurde sauber neu aufgebaut.");
}
