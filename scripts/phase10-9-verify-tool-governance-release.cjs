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
console.log(" Phase 10.9 Tool Governance Release Verify");
console.log("======================================");
let ok = true;
ok = check("docs/phase10-tool-governance-release-notes.md", ["Phase 10 Tool Governance Release Notes", "10.0", "10.9", "Tool Enforcement"]) && ok;
ok = check("docs/tool-governance-runbook.md", ["Tool Governance Runbook", "TOOL_PERMISSION_ENFORCEMENT_ENABLED", "Rollback"]) && ok;
ok = check("docs/phase10-completion-checklist.md", ["Phase 10 Completion Checklist", "tools:governance:smoke", "Secret Safety"]) && ok;
ok = check("scripts/phase10-9-tool-governance-smoke.cjs", ["/api/tools", "/api/tool-permissions", "/api/tool-preflight", "/api/analytics"]) && ok;
ok = check("package.json", ["tools:governance:release:verify", "tools:governance:smoke", "tools:governance:release:check"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Tool Governance Release Polish ist vorbereitet.");
