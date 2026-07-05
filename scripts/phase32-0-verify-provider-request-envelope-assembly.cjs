const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 32.0 Provider Request Envelope Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-request-envelope-store.ts",["createProviderRequestEnvelope","controlled_provider_request_envelope_metadata_only_no_provider_call","providerRequestEnvelopeAssembled:true","metadataOnly:true","envelopePayloadIncluded:false","promptPayloadIncluded:false","secretValuesIncluded:false","requestBodyIncluded:false","sensitiveRequestBodyIncluded:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-request-envelope/route.ts",["createProviderRequestEnvelope","GET","POST"])&&ok;
ok=check("frontend/app/provider-request-envelope/page.tsx",["Provider Request Envelope","Provider Request Envelope assemblieren","metadataOnly","promptPayloadIncluded","envelopePayloadIncluded","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-request-envelope","Provider Request Envelope","provider-request-envelope"])&&ok;
ok=check("phase32-0-provider-request-envelope-assembly.md",["Phase 32.0","Phase 32.1","providerRequestEnvelopeAssembled=true","metadataOnly=true","envelopePayloadIncluded=false","promptPayloadIncluded=false","secretValuesIncluded=false","requestBodyIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase32-provider-request-envelope-assembly-runbook.md",["phase32:0:patch","phase32:0:verify","/provider-request-envelope"])&&ok;
ok=check("package.json",["phase32:0:patch","phase32:0:verify","llm:provider-request-envelope:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 32.0 Provider Request Envelope Assembly ist vorbereitet.");
