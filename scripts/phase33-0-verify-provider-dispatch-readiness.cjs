const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 33.0 Provider Dispatch Readiness Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-dispatch-readiness-store.ts",["createProviderDispatchReadiness","controlled_provider_dispatch_readiness_metadata_only_no_provider_call","providerDispatchPrepared:true","providerDispatchPerformed:false","metadataOnly:true","dispatchPayloadIncluded:false","envelopePayloadIncluded:false","promptPayloadIncluded:false","secretValuesIncluded:false","requestBodyIncluded:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-dispatch-readiness/route.ts",["createProviderDispatchReadiness","GET","POST"])&&ok;
ok=check("frontend/app/provider-dispatch-readiness/page.tsx",["Provider Dispatch Readiness","Provider Dispatch Readiness vorbereiten","providerDispatchPrepared","providerDispatchPerformed","metadataOnly","dispatchPayloadIncluded","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-dispatch-readiness","Provider Dispatch Readiness","provider-dispatch-readiness"])&&ok;
ok=check("phase33-0-provider-dispatch-readiness.md",["Phase 33.0","Phase 33.1","providerDispatchPrepared=true","providerDispatchPerformed=false","metadataOnly=true","dispatchPayloadIncluded=false","envelopePayloadIncluded=false","promptPayloadIncluded=false","secretValuesIncluded=false","requestBodyIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase33-provider-dispatch-readiness-runbook.md",["phase33:0:patch","phase33:0:verify","/provider-dispatch-readiness"])&&ok;
ok=check("package.json",["phase33:0:patch","phase33:0:verify","llm:provider-dispatch-readiness:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 33.0 Provider Dispatch Readiness ist vorbereitet.");
