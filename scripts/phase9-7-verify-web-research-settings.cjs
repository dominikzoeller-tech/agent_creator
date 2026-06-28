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
console.log(" Phase 9.7 Web Research Settings Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/web-research-settings.ts", ["getWebResearchSettingsStatus", "webResearchEnabled", "bingSearchConfigured", "openAiConfigured"]) && ok;
ok = check("frontend/app/api/web-research-settings/route.ts", ["getWebResearchSettingsStatus", "export async function GET"]) && ok;
ok = check("frontend/app/web-research-settings/page.tsx", ["Web Research Admin / Settings", "Governance-Regeln", "WEB_RESEARCH_ENABLED=true"]) && ok;
ok = check("package.json", ["web:research:settings:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Web Research Admin/Settings ist vorbereitet.");
