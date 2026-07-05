const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 34.0 Provider Dispatch Token Binding Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-dispatch-token-binding-store.ts",["createProviderDispatchTokenBinding","controlled_provider_dispatch_token_binding_no_provider_call","providerDispatchTokenBindingPrepared:true","tokenBoundToDispatch:false","tokenBindingActive:false","tokenActive:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-dispatch-token-binding/route.ts",["createProviderDispatchTokenBinding","GET","POST"])&&ok;
ok=check("frontend/app/provider-dispatch-token-binding/page.tsx",["Provider Dispatch Token Binding","Provider Dispatch Token Binding vorbereiten","providerDispatchTokenBindingPrepared","tokenBoundToDispatch","tokenBindingActive","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-dispatch-token-binding","Dispatch Token Binding","provider-dispatch-token-binding"])&&ok;
ok=check("phase34-0-provider-dispatch-token-binding.md",["Phase 34.0","Phase 34.1","providerDispatchTokenBindingPrepared=true","tokenBoundToDispatch=false","tokenBindingActive=false","tokenActive=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase34-provider-dispatch-token-binding-runbook.md",["phase34:0:patch","phase34:0:verify"])&&ok;
ok=check("package.json",["phase34:0:patch","phase34:0:verify","llm:provider-dispatch-token-binding:verify"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 34.0 Provider Dispatch Token Binding ist vorbereitet.");
