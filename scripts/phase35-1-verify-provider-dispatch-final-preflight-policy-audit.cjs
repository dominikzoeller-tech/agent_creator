const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 35.1 Provider Dispatch Final Preflight Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-dispatch-final-preflight-policy-store.ts",["simulateProviderDispatchFinalPreflightPolicy","appendGovernanceAuditEvent","provider_dispatch_final_preflight_policy_allowed_no_provider_call","providerDispatchFinalPreflightPrepared:true","finalDispatchAllowed:false","networkCallAllowed:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-dispatch-final-preflight-policy/route.ts",["simulateProviderDispatchFinalPreflightPolicy","GET","POST"])&&ok;
ok=check("frontend/app/provider-dispatch-final-preflight-policy/page.tsx",["Provider Dispatch Final Preflight Policy","Provider Dispatch Final Preflight Policy simulieren","providerDispatchFinalPreflightPrepared","finalDispatchAllowed","networkCallAllowed","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-dispatch-final-preflight-policy","Dispatch Final Policy","provider-dispatch-final-preflight-policy"])&&ok;
ok=check("phase35-1-provider-dispatch-final-preflight-policy-audit.md",["Phase 35.1","Phase 35.2","providerDispatchFinalPreflightPrepared=true","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase35-provider-dispatch-final-preflight-policy-audit-runbook.md",["phase35:1:patch","phase35:1:verify"])&&ok;
ok=check("package.json",["phase35:1:patch","phase35:1:verify","llm:provider-dispatch-final-preflight:policy:verify"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 35.1 Provider Dispatch Final Preflight Policy & Audit ist vorbereitet.");
