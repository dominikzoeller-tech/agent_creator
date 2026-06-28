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
console.log(" Phase 10.8 Tool Enforcement Analytics Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/api/analytics/route.ts", ["toolEnforcementEntriesCount", "toolEnforcementWouldBlockCount", "topToolEnforcementReasons"]) && ok;
ok = check("frontend/lib/types.ts", ["toolEnforcementEntriesCount?: number", "topToolEnforcementBlockedTools?: TopItem[]", "topToolEnforcementModes?: TopItem[]"]) && ok;
ok = check("frontend/components/ToolEnforcementAnalyticsPanel.tsx", ["Tool-Enforcement-Analytics", "toolEnforcementWouldBlockSharePercent", "topToolEnforcementBlockedTools"]) && ok;
ok = check("frontend/app/analytics/page.tsx", ["ToolEnforcementAnalyticsPanel"]) && ok;
ok = check("package.json", ["tools:enforcement:analytics:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Tool Enforcement Analytics ist vorbereitet.");
