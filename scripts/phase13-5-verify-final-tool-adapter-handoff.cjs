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
console.log(" Phase 13.5 Final Tool Adapter Handoff Verify");
console.log("======================================");
let ok=true;
ok = check("phase13-5-final-tool-adapter-handoff-release-summary.md", ["Phase 13.5", "Phase 13.0", "Phase 13.4", "toolExecutionAllowed", "dryRunOnly", "data/", "Master Agent Cockpit"]) && ok;
ok = check("docs/phase13-final-tool-adapter-handoff-runbook.md", ["phase13:5:patch", "phase13:5:verify", "tool-adapter:final:check", "data/"]) && ok;
ok = check("next-chat-handoff-phase14.md", ["Phase 14.0", "Master Agent Cockpit", "Unified Control Center", "keine echte Tool-Ausführung", "Startprompt"]) && ok;
ok = check("package.json", ["phase13:5:patch", "phase13:5:verify", "tool-adapter:final:check"]) && ok;
const requiredFiles = [
  "frontend/app/tool-sandbox/page.tsx",
  "frontend/app/tool-adapter-consent/page.tsx",
  "frontend/app/tool-adapter-resume/page.tsx",
  "frontend/app/tool-adapter-policy/page.tsx",
  "frontend/app/tool-adapter-dashboard/page.tsx",
  "scripts/phase13-4-tool-adapter-smoke.cjs"
];
for(const file of requiredFiles){
  const found=exists(file);
  console.log((found?"OK  ":"MISS") + " required: " + file);
  if(!found) ok=false;
}
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 13.5 Final Tool Adapter Handoff ist vorbereitet.");
