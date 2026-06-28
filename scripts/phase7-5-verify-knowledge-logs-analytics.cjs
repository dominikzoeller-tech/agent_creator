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
console.log(" Phase 7.5 Knowledge Analytics Verify");
console.log("======================================");
let ok = true;
ok = check("decision-log.ts", ["usedKnowledge?: boolean", "knowledgeSummary?: string", "knowledgeHits?: unknown[]"]) && ok;
ok = check("server.ts", ["usedKnowledge: resultWithKnowledge.usedKnowledge", "knowledgeSummary: resultWithKnowledge.knowledgeSummary", "knowledgeHits: resultWithKnowledge.knowledgeHits"]) && ok;
ok = check("frontend/app/api/analytics/route.ts", ["knowledgeUsedCount", "knowledgeUsedSharePercent", "topKnowledgeFiles", "topKnowledgeTags"]) && ok;
ok = check("frontend/lib/types.ts", ["knowledgeUsedCount?: number", "topKnowledgeFiles?: TopItem[]", "topKnowledgeTags?: TopItem[]"]) && ok;
ok = check("frontend/components/KnowledgeAnalyticsPanel.tsx", ["Knowledge-Analytics", "topKnowledgeFiles", "knowledgeUsedCount"]) && ok;
ok = check("frontend/app/analytics/page.tsx", ["KnowledgeAnalyticsPanel"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Knowledge Hits werden in Logs und Analytics aufgenommen.");
