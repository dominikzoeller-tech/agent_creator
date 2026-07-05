const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 31.0 Provider Request Contract Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-request-contract-store.ts",["createProviderRequestContract","controlled_provider_request_contract_metadata_only_no_provider_call","providerRequestContractPrepared:true","metadataOnly:true","promptIncluded:false","secretValuesIncluded:false","requestBodyIncluded:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-request-contract/route.ts",["createProviderRequestContract","GET","POST"])&&ok;
ok=check("frontend/app/provider-request-contract/page.tsx",["Provider Request Contract","Provider Request Contract vorbereiten","metadataOnly","requestBodyIncluded","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-request-contract","Provider Request Contract","provider-request-contract"])&&ok;
ok=check("phase31-0-provider-request-contract-preparation.md",["Phase 31.0","Phase 31.1","providerRequestContractPrepared=true","metadataOnly=true","promptIncluded=false","secretValuesIncluded=false","requestBodyIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase31-provider-request-contract-preparation-runbook.md",["phase31:0:patch","phase31:0:verify","/provider-request-contract"])&&ok;
ok=check("package.json",["phase31:0:patch","phase31:0:verify","llm:provider-request-contract:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 31.0 Provider Request Contract Preparation ist vorbereitet.");
