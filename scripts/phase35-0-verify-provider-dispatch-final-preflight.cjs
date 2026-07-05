const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 35.0 Provider Dispatch Final Preflight Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-dispatch-final-preflight-store.ts",["createProviderDispatchFinalPreflight","controlled_provider_dispatch_final_preflight_no_provider_call","providerDispatchFinalPreflightPrepared:true","finalDispatchAllowed:false","networkCallAllowed:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-dispatch-final-preflight/route.ts",["createProviderDispatchFinalPreflight","GET","POST"])&&ok;
ok=check("frontend/app/provider-dispatch-final-preflight/page.tsx",["Provider Dispatch Final Preflight","Provider Dispatch Final Preflight vorbereiten","providerDispatchFinalPreflightPrepared","finalDispatchAllowed","networkCallAllowed","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-dispatch-final-preflight","Dispatch Final Preflight","provider-dispatch-final-preflight"])&&ok;
ok=check("phase35-0-provider-dispatch-final-preflight.md",["Phase 35.0","Phase 35.1","providerDispatchFinalPreflightPrepared=true","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase35-provider-dispatch-final-preflight-runbook.md",["phase35:0:patch","phase35:0:verify"])&&ok;
ok=check("package.json",["phase35:0:patch","phase35:0:verify","llm:provider-dispatch-final-preflight:verify"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 35.0 Provider Dispatch Final Preflight ist vorbereitet.");
