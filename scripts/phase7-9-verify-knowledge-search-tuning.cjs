const fs = require("fs");
const path = require("path");

function check(file, patterns) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) { console.log(`MISS ${file}`); return false; }
  const content = fs.readFileSync(full, "utf8");
  let ok = true;
  for (const pattern of patterns) {
    const found = content.includes(pattern);
    console.log(`${found ? "OK  " : "MISS"} ${file}: ${pattern}`);
    if (!found) ok = false;
  }
  return ok;
}

console.log("======================================");
console.log(" Phase 7.9 Knowledge Search Tuning Verify");
console.log("======================================");
let ok = true;
ok = check("knowledge-base.ts", ["KNOWLEDGE_STOPWORDS", "TITLE_MATCH_WEIGHT", "TAG_MATCH_WEIGHT", "minScore?: number", "tokenizeKnowledgeQuery", "scoreText"]) && ok;
ok = check("knowledge-search-tuning-smoke-test.ts", ["Knowledge Search Tuning Smoke Test OK", "suggestedAgents routingDetails"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Knowledge Search Tuning ist vorbereitet.");
