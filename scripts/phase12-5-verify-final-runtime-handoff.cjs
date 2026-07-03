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
console.log(" Phase 12.5 Final Runtime Handoff Verify");
console.log("======================================");
let ok=true;
ok = check("phase12-5-final-runtime-handoff-release-summary.md", ["Phase 12.5", "Phase 12.0", "Phase 12.4", "toolExecutionAllowed", "dryRunOnly", "data/"]) && ok;
ok = check("docs/phase12-final-runtime-handoff-runbook.md", ["phase12:5:patch", "phase12:5:verify", "runtime:final:check", "data/"]) && ok;
ok = check("next-chat-handoff-phase13.md", ["Phase 13.0", "Controlled Tool Execution Sandbox", "keine echte Tool-Ausführung", "Startprompt"]) && ok;
ok = check("package.json", ["phase12:5:patch", "phase12:5:verify", "runtime:final:check"]) && ok;
const requiredFiles = [
  "frontend/app/agent-runtime/page.tsx",
  "frontend/app/agent-runtime-consent/page.tsx",
  "frontend/app/agent-runtime-resume/page.tsx",
  "frontend/app/agent-runtime-policy/page.tsx",
  "frontend/app/agent-runtime-dashboard/page.tsx",
  "scripts/phase12-4-runtime-dashboard-smoke.cjs"
];
for(const file of requiredFiles){
  const found=exists(file);
  console.log((found?"OK  ":"MISS") + " required: " + file);
  if(!found) ok=false;
}
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 12.5 Final Runtime Handoff ist vorbereitet.");
