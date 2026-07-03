const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 16.2 Planner Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/master-planner-dashboard/page.tsx",["Master Planner Dashboard","Planner Übersicht","executionAllowed=false","llmRoutingPrepOnly=true"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/master-planner-dashboard","Planner Dashboard","master-planner-dashboard"])&&ok;
ok=check("scripts/phase16-2-planner-dashboard-smoke.cjs",["Phase 16.2 Planner Dashboard Smoke","UI Master Planner Dashboard","API Master Planner Policy"])&&ok;
ok=check("phase16-2-planner-dashboard-smoke.md",["Phase 16.2","Planner Dashboard","Phase 16.3","llmRoutingPrepOnly=true"])&&ok;
ok=check("docs/phase16-planner-dashboard-smoke-runbook.md",["phase16:2:patch","phase16:2:verify","phase16:2:smoke"])&&ok;
ok=check("package.json",["phase16:2:patch","phase16:2:verify","phase16:2:smoke","planner:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 16.2 Planner Dashboard & Smoke ist vorbereitet.");
