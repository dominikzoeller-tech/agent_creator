const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 25.2 Provider Simulation Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/provider-simulation-dashboard/page.tsx",["Provider Simulation Dashboard","Provider Simulation Übersicht","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-simulation-dashboard","Simulation Dashboard","provider-simulation-dashboard"])&&ok;
ok=check("scripts/phase25-2-provider-simulation-dashboard-smoke.cjs",["Phase 25.2 Provider Simulation Dashboard Smoke","UI Provider Simulation Dashboard","API Provider Simulation Policy"])&&ok;
ok=check("phase25-2-provider-simulation-dashboard-smoke.md",["Phase 25.2","Provider Simulation Dashboard","Phase 25.3","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase25-provider-simulation-dashboard-smoke-runbook.md",["phase25:2:patch","phase25:2:verify","phase25:2:smoke"])&&ok;
ok=check("package.json",["phase25:2:patch","phase25:2:verify","phase25:2:smoke","llm:provider-simulation:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 25.2 Provider Simulation Dashboard & Smoke ist vorbereitet.");
