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
console.log(" Phase 9.8 Web Research Hardening Verify");
console.log("======================================");
let ok = true;
ok = check("scripts/phase9-8-web-research-smoke.cjs", ["/api/web-research-settings", "assertNoSecretLeak", "duplicate-sources", "nothing-selected"]) && ok;
ok = check("docs/web-research-test-matrix.md", ["Web Research Test Matrix", "Secret-Leak", "Governance", "Save API"]) && ok;
ok = check("docs/web-research-hardening-runbook.md", ["Web Research Hardening Runbook", "API-Key", "Smoke Test", "Governance"]) && ok;
ok = check("package.json", ["web:research:hardening:verify", "web:research:smoke"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Web Research Regression & Hardening ist vorbereitet.");
