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
console.log(" Phase 9.6 Web Research Governance Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/web-research-governance.ts", ["evaluateWebResearchGovernance", "duplicate-sources", "sensitive-data", "few-sources"]) && ok;
ok = check("frontend/app/api/web-research-governance/route.ts", ["evaluateWebResearchGovernance", "export async function POST"]) && ok;
ok = check("frontend/app/api/web-research-save/route.ts", ["evaluateWebResearchGovernance", "Governance blockiert"]) && ok;
ok = check("frontend/app/web-research-governance/page.tsx", ["Web Research Governance", "Governance prüfen", "Deduplizierte Quellen"]) && ok;
ok = check("package.json", ["web:research:governance:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Web Research Quality & Governance ist vorbereitet.");
