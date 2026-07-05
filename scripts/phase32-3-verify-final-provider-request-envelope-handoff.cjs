const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 32.3 Final Provider Request Envelope Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase32-3-final-provider-request-envelope-handoff-release-summary.md",["Phase 32.3","Phase 32.0","Phase 32.2","Phase 33.0","providerRequestEnvelopeAssembled=true","metadataOnly=true","envelopePayloadIncluded=false","promptPayloadIncluded=false","secretValuesIncluded=false","requestBodyIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase32-final-provider-request-envelope-handoff-runbook.md",["phase32:3:patch","phase32:3:verify","llm:provider-request-envelope:final:check","phase32:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase33.md",["Phase 33.0","Controlled Provider Dispatch Readiness","Startprompt"])&&ok;
ok=check("package.json",["phase32:3:patch","phase32:3:verify","llm:provider-request-envelope:final:check"])&&ok;
const required=["frontend/app/provider-request-envelope/page.tsx","frontend/app/provider-request-envelope-policy/page.tsx","frontend/app/provider-request-envelope-dashboard/page.tsx","frontend/app/api/provider-request-envelope/route.ts","frontend/app/api/provider-request-envelope-policy/route.ts","frontend/lib/provider-request-envelope-store.ts","frontend/lib/provider-request-envelope-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 32.3 Final Provider Request Envelope Handoff ist vorbereitet.");
