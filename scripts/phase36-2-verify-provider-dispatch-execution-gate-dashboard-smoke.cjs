const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 36.2 Provider Dispatch Execution Gate Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/provider-dispatch-execution-gate-dashboard/page.tsx",["Provider Dispatch Execution Gate Dashboard","Provider Dispatch Execution Gate Übersicht","providerDispatchExecutionGatePrepared=true","executionGateOpen=false","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-dispatch-execution-gate-dashboard","Dispatch Execution Dashboard","provider-dispatch-execution-gate-dashboard"])&&ok;
ok=check("scripts/phase36-2-provider-dispatch-execution-gate-dashboard-smoke.cjs",["Phase 36.2 Provider Dispatch Execution Gate Dashboard Smoke","UI Provider Dispatch Execution Gate Dashboard","API Provider Dispatch Execution Policy"])&&ok;
ok=check("phase36-2-provider-dispatch-execution-gate-dashboard-smoke.md",["Phase 36.2","Phase 36.3","Provider Dispatch Execution Gate Dashboard","providerDispatchExecutionGatePrepared=true","executionGateOpen=false","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase36-provider-dispatch-execution-gate-dashboard-smoke-runbook.md",["phase36:2:patch","phase36:2:verify","phase36:2:smoke"])&&ok;
ok=check("package.json",["phase36:2:patch","phase36:2:verify","phase36:2:smoke","llm:provider-dispatch-execution-gate:release:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 36.2 Provider Dispatch Execution Gate Dashboard & Smoke ist vorbereitet.");
