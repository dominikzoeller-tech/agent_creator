const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 32.2 Provider Request Envelope Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/provider-request-envelope-dashboard/page.tsx",["Provider Request Envelope Dashboard","Provider Request Envelope Übersicht","providerRequestEnvelopeAssembled=true","metadataOnly=true","envelopePayloadIncluded=false","promptPayloadIncluded=false","secretValuesIncluded=false","requestBodyIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-request-envelope-dashboard","Provider Envelope Dashboard","provider-request-envelope-dashboard"])&&ok;
ok=check("scripts/phase32-2-provider-request-envelope-dashboard-smoke.cjs",["Phase 32.2 Provider Request Envelope Dashboard Smoke","UI Provider Envelope Dashboard","API Provider Envelope Policy"])&&ok;
ok=check("phase32-2-provider-request-envelope-dashboard-smoke.md",["Phase 32.2","Provider Request Envelope Dashboard","Phase 32.3","providerRequestEnvelopeAssembled=true","metadataOnly=true","envelopePayloadIncluded=false","promptPayloadIncluded=false","secretValuesIncluded=false","requestBodyIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase32-provider-request-envelope-dashboard-smoke-runbook.md",["phase32:2:patch","phase32:2:verify","phase32:2:smoke"])&&ok;
ok=check("package.json",["phase32:2:patch","phase32:2:verify","phase32:2:smoke","llm:provider-request-envelope:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 32.2 Provider Request Envelope Dashboard & Smoke ist vorbereitet.");
