const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 31.3 Final Provider Request Contract Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase31-3-final-provider-request-contract-handoff-release-summary.md",["Phase 31.3","Phase 31.0","Phase 31.2","Phase 32.0","providerRequestContractPrepared=true","metadataOnly=true","promptIncluded=false","secretValuesIncluded=false","requestBodyIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase31-final-provider-request-contract-handoff-runbook.md",["phase31:3:patch","phase31:3:verify","llm:provider-request-contract:final:check","phase31:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase32.md",["Phase 32.0","Controlled Provider Request Envelope Assembly","Startprompt"])&&ok;
ok=check("package.json",["phase31:3:patch","phase31:3:verify","llm:provider-request-contract:final:check"])&&ok;
const required=["frontend/app/provider-request-contract/page.tsx","frontend/app/provider-request-contract-policy/page.tsx","frontend/app/provider-request-contract-dashboard/page.tsx","frontend/app/api/provider-request-contract/route.ts","frontend/app/api/provider-request-contract-policy/route.ts","frontend/lib/provider-request-contract-store.ts","frontend/lib/provider-request-contract-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 31.3 Final Provider Request Contract Handoff ist vorbereitet.");
