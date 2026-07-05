const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 35.2 Provider Dispatch Final Preflight Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/provider-dispatch-final-preflight-dashboard/page.tsx",["Provider Dispatch Final Preflight Dashboard","Provider Dispatch Final Preflight Übersicht","providerDispatchFinalPreflightPrepared=true","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-dispatch-final-preflight-dashboard","Dispatch Final Dashboard","provider-dispatch-final-preflight-dashboard"])&&ok;
ok=check("scripts/phase35-2-provider-dispatch-final-preflight-dashboard-smoke.cjs",["Phase 35.2 Provider Dispatch Final Preflight Dashboard Smoke","UI Provider Dispatch Final Preflight Dashboard","API Provider Dispatch Final Policy"])&&ok;
ok=check("phase35-2-provider-dispatch-final-preflight-dashboard-smoke.md",["Phase 35.2","Phase 35.3","Provider Dispatch Final Preflight Dashboard","providerDispatchFinalPreflightPrepared=true","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase35-provider-dispatch-final-preflight-dashboard-smoke-runbook.md",["phase35:2:patch","phase35:2:verify","phase35:2:smoke"])&&ok;
ok=check("package.json",["phase35:2:patch","phase35:2:verify","phase35:2:smoke","llm:provider-dispatch-final-preflight:release:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 35.2 Provider Dispatch Final Preflight Dashboard & Smoke ist vorbereitet.");
