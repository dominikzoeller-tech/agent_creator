const fs = require("fs");
const path = require("path");
const file = path.join(process.cwd(), "knowledge-base.ts");
const content = fs.readFileSync(file, "utf8");
const checks = [
  "export async function searchKnowledgeBase(",
  "): Promise<KnowledgeSearchResult[]>",
  "tokenizeKnowledgeQuery",
  "scoreText",
  "KNOWLEDGE_STOPWORDS",
  "TITLE_MATCH_WEIGHT",
  "TAG_MATCH_WEIGHT",
  "minScore?: number"
];
let ok = true;
for (const check of checks) {
  const found = content.includes(check);
  console.log(`${found ? "OK  " : "MISS"} knowledge-base.ts: ${check}`);
  if (!found) ok = false;
}
if (!ok) process.exit(1);
console.log("Verify OK. knowledge-base.ts search repair ist vorhanden.");
