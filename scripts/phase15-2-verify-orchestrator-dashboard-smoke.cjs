const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 15.2 Orchestrator Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/master-orchestrator-dashboard/page.tsx",["Master Orchestrator Dashboard","Orchestrator Übersicht","executionAllowed=false","toolExecutionAllowed=false","agentExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/master-orchestrator-dashboard","Orch Dashboard","master-orchestrator-dashboard"])&&ok;
ok=check("scripts/phase15-2-orchestrator-dashboard-smoke.cjs",["Phase 15.2 Orchestrator Dashboard Smoke","UI Master Orchestrator Dashboard","API Master Orchestrator Policy"])&&ok;
ok=check("phase15-2-orchestrator-dashboard-smoke.md",["Phase 15.2","Orchestrator Dashboard","Phase 15.3","agentExecutionAllowed=false"])&&ok;
ok=check("docs/phase15-orchestrator-dashboard-smoke-runbook.md",["phase15:2:patch","phase15:2:verify","phase15:2:smoke"])&&ok;
ok=check("package.json",["phase15:2:patch","phase15:2:verify","phase15:2:smoke","orchestrator:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 15.2 Orchestrator Dashboard & Smoke ist vorbereitet.");
