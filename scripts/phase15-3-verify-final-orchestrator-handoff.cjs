const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 15.3 Final Orchestrator Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase15-3-final-orchestrator-handoff-release-summary.md",["Phase 15.3","Phase 15.0","Phase 15.2","Phase 16.0","executionAllowed=false","agentExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase15-final-orchestrator-handoff-runbook.md",["phase15:3:patch","phase15:3:verify","orchestrator:final:check"])&&ok;
ok=check("next-chat-handoff-phase16.md",["Phase 16.0","Master Agent Orchestration Planner Integration","keine echte Tool-Ausführung","Startprompt"])&&ok;
ok=check("package.json",["phase15:3:patch","phase15:3:verify","orchestrator:final:check"])&&ok;
const required=["frontend/app/master-orchestrator/page.tsx","frontend/app/master-orchestrator-policy/page.tsx","frontend/app/master-orchestrator-dashboard/page.tsx","frontend/app/api/master-orchestrator/route.ts","frontend/app/api/master-orchestrator-policy/route.ts","frontend/lib/master-agent-orchestrator-store.ts","frontend/lib/master-agent-orchestration-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 15.3 Final Orchestrator Handoff ist vorbereitet.");
