const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 32.1 Provider Request Envelope Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-request-envelope-policy-store.ts",["simulateProviderRequestEnvelopePolicy","appendGovernanceAuditEvent","provider_request_envelope_policy_allowed_metadata_only_no_provider_call","metadataOnly:true","envelopePayloadIncluded:false","promptPayloadIncluded:false","secretValuesIncluded:false","requestBodyIncluded:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-request-envelope-policy/route.ts",["simulateProviderRequestEnvelopePolicy","GET","POST"])&&ok;
ok=check("frontend/app/provider-request-envelope-policy/page.tsx",["Provider Request Envelope Policy","Provider Request Envelope Policy simulieren","metadataOnly","promptPayloadIncluded","envelopePayloadIncluded","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-request-envelope-policy","Provider Envelope Policy","provider-request-envelope-policy"])&&ok;
ok=check("phase32-1-provider-request-envelope-policy-audit.md",["Phase 32.1","Phase 32.2","providerRequestEnvelopeAssembled=true","metadataOnly=true","envelopePayloadIncluded=false","promptPayloadIncluded=false","secretValuesIncluded=false","requestBodyIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase32-provider-request-envelope-policy-audit-runbook.md",["phase32:1:patch","phase32:1:verify"])&&ok;
ok=check("package.json",["phase32:1:patch","phase32:1:verify","llm:provider-request-envelope:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 32.1 Provider Request Envelope Policy & Audit ist vorbereitet.");
