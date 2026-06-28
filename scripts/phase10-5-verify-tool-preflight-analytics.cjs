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
console.log(" Phase 10.5 Tool Preflight Analytics Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/api/analytics/route.ts", ["toolPreflightEntriesCount", "topToolPreflightCandidates", "topToolPreflightBlockReasons"]) && ok;
ok = check("frontend/lib/types.ts", ["toolPreflightEntriesCount?: number", "topToolPreflightCandidates?: TopItem[]", "topToolPreflightWarnings?: TopItem[]"]) && ok;
ok = check("frontend/components/ToolPreflightAnalyticsPanel.tsx", ["Tool-Preflight-Analytics", "topToolPreflightCandidates", "toolPreflightBlockedSharePercent"]) && ok;
ok = check("frontend/app/analytics/page.tsx", ["ToolPreflightAnalyticsPanel"]) && ok;
ok = check("package.json", ["tools:preflight:analytics:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Tool Preflight Analytics ist vorbereitet.");
