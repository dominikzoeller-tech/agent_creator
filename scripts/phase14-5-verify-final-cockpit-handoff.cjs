const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!exists(file)){ console.log("MISS " + file); return false; }
  const content = read(file); let ok = true;
  for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; }
  return ok;
}
console.log("======================================");
console.log(" Phase 14.5 Final Cockpit Handoff Verify");
console.log("======================================");
let ok = true;
ok = check("phase14-5-final-cockpit-handoff-release-summary.md", ["Phase 14.5", "Phase 14.0", "Phase 14.4", "Phase 15.0", "executionAllowed=false", "toolExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase14-final-cockpit-handoff-runbook.md", ["phase14:5:patch", "phase14:5:verify", "cockpit:final:check"]) && ok;
ok = check("next-chat-handoff-phase15.md", ["Phase 15.0", "Master Agent Orchestrator Planning Layer", "keine echte Tool-Ausführung", "Startprompt"]) && ok;
ok = check("package.json", ["phase14:5:patch", "phase14:5:verify", "cockpit:final:check"]) && ok;
const requiredFiles = [
  "frontend/app/master-cockpit/page.tsx",
  "frontend/app/cockpit-actions/page.tsx",
  "frontend/components/UnifiedNavigation.tsx",
  "frontend/app/api/cockpit-actions/route.ts",
  "frontend/lib/cockpit-action-store.ts"
];
for(const file of requiredFiles){ const found=exists(file); console.log((found?"OK  ":"MISS") + " required: " + file); if(!found) ok=false; }
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 14.5 Final Cockpit Handoff ist vorbereitet.");
