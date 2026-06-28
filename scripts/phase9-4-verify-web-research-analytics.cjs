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
console.log(" Phase 9.4 Web Research Analytics Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/api/analytics/route.ts", ["webResearchUsedCount", "webResearchUsedSharePercent", "topWebResearchQueries", "topWebResearchSources", "topWebResearchTitles"]) && ok;
ok = check("frontend/lib/types.ts", ["webResearchUsedCount?: number", "topWebResearchQueries?: TopItem[]", "topWebResearchSources?: TopItem[]", "topWebResearchTitles?: TopItem[]"]) && ok;
ok = check("frontend/components/WebResearchAnalyticsPanel.tsx", ["Web-Research-Analytics", "topWebResearchQueries", "webResearchSummarySuccessPercent"]) && ok;
ok = check("frontend/app/analytics/page.tsx", ["WebResearchAnalyticsPanel"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Web Research Analytics sind vorbereitet.");
