const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 34.2 Provider Dispatch Token Binding Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/provider-dispatch-token-binding-dashboard/page.tsx",["Provider Dispatch Token Binding Dashboard","Provider Dispatch Token Binding Übersicht","providerDispatchTokenBindingPrepared=true","tokenBoundToDispatch=false","tokenBindingActive=false","tokenActive=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-dispatch-token-binding-dashboard","Dispatch Token Dashboard","provider-dispatch-token-binding-dashboard"])&&ok;
ok=check("scripts/phase34-2-provider-dispatch-token-binding-dashboard-smoke.cjs",["Phase 34.2 Provider Dispatch Token Binding Dashboard Smoke","UI Provider Dispatch Token Binding Dashboard","API Provider Dispatch Token Policy"])&&ok;
ok=check("phase34-2-provider-dispatch-token-binding-dashboard-smoke.md",["Phase 34.2","Phase 34.3","Provider Dispatch Token Binding Dashboard","providerDispatchTokenBindingPrepared=true","tokenBoundToDispatch=false","tokenBindingActive=false","tokenActive=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase34-provider-dispatch-token-binding-dashboard-smoke-runbook.md",["phase34:2:patch","phase34:2:verify","phase34:2:smoke"])&&ok;
ok=check("package.json",["phase34:2:patch","phase34:2:verify","phase34:2:smoke","llm:provider-dispatch-token-binding:release:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 34.2 Provider Dispatch Token Binding Dashboard & Smoke ist vorbereitet.");
