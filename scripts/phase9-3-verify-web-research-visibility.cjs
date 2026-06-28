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
console.log(" Phase 9.3 Web Research Frontend Visibility Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/components/WebResearchPanel.tsx", ["Web Research", "AI Research Summary", "webResearchResults", "webResearchSources"]) && ok;
ok = check("frontend/lib/types.ts", ["WebResearchResult", "WebResearchSource", "usedWebResearch?: boolean", "webResearchSummary?: string"]) && ok;
ok = check("frontend/app/page.tsx", ["WebResearchPanel", "<WebResearchPanel response={response} />"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Web Research ist im Frontend sichtbar vorbereitet.");
