const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!exists(file)){ console.log("MISS " + file); return false; }
  const content=read(file); let ok=true;
  for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; }
  return ok;
}
console.log("======================================");
console.log(" Phase 11.10 Final Governance Handoff Verify");
console.log("======================================");
let ok=true;
ok = check("phase11-10-final-governance-handoff-release-summary.md", ["Phase 11.10", "Phase 11.2", "Phase 11.9", "Controlled Agent Runtime Foundation", "data/"]) && ok;
ok = check("docs/phase11-final-governance-handoff-runbook.md", ["phase11:10:patch", "phase11:10:verify", "governance:final:check", "data/"]) && ok;
ok = check("next-chat-handoff-phase12.md", ["Phase 12.0", "Controlled Agent Runtime Foundation", "keine freie Agent-Ausführung", "Startprompt"]) && ok;
ok = check("package.json", ["phase11:10:patch", "phase11:10:verify", "governance:final:check"]) && ok;
const requiredFiles = [
  "frontend/components/UnifiedNavigation.tsx",
  "frontend/app/governance-audit/page.tsx",
  "frontend/app/agent-registry/page.tsx",
  "frontend/app/agent-blueprints/page.tsx",
  "frontend/app/capability-requests/page.tsx",
  "frontend/app/tool-consent/page.tsx",
  "scripts/phase11-9-governance-release-smoke.cjs"
];
for(const file of requiredFiles){
  const found=exists(file);
  console.log((found?"OK  ":"MISS") + " required: " + file);
  if(!found) ok=false;
}
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.10 Final Governance Handoff ist vorbereitet.");
