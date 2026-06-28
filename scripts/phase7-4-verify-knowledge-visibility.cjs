const fs = require("fs");
const path = require("path");

function check(file, patterns) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) {
    console.log(`MISS ${file}`);
    return false;
  }
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
console.log(" Phase 7.4 Knowledge Visibility Verify");
console.log("======================================");

let ok = true;
ok = check("server.ts", ["resultWithKnowledge", "usedKnowledge", "knowledgeSummary", "knowledgeHits"]) && ok;
ok = check("frontend/lib/types.ts", ["KnowledgeSearchResult", "usedKnowledge?: boolean", "knowledgeHits?: KnowledgeSearchResult[]"]) && ok;
ok = check("frontend/app/page.tsx", ["KnowledgeHitsPanel", "<KnowledgeHitsPanel response={response} />"]) && ok;
ok = check("frontend/components/KnowledgeHitsPanel.tsx", ["Lokale Knowledge-Treffer", "knowledgeHits", "usedKnowledge"]) && ok;

if (!ok) {
  console.error("Verify fehlgeschlagen. Bitte Patch-Ausgabe prüfen.");
  process.exit(1);
}

console.log("Verify OK. Knowledge-Hits sind in API-Debug und Frontend sichtbar vorbereitet.");
