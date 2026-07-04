const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 27.3 Final Approval Token Request Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase27-3-final-approval-token-request-handoff-release-summary.md",["Phase 27.3","Phase 27.0","Phase 27.2","Phase 28.0","approvalTokenRequested=true","approvalTokenIssued=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase27-final-approval-token-request-handoff-runbook.md",["phase27:3:patch","phase27:3:verify","llm:approval-token-request:final:check","phase27:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase28.md",["Phase 28.0","Explicit Human Approval Token Issuance Gate","Token-Ausstellung","Startprompt"])&&ok;
ok=check("package.json",["phase27:3:patch","phase27:3:verify","llm:approval-token-request:final:check"])&&ok;
const required=["frontend/app/human-approval-token-request/page.tsx","frontend/app/approval-token-request-policy/page.tsx","frontend/app/approval-token-request-dashboard/page.tsx","frontend/app/api/human-approval-token-request/route.ts","frontend/app/api/approval-token-request-policy/route.ts","frontend/lib/human-approval-token-request-store.ts","frontend/lib/approval-token-request-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 27.3 Final Approval Token Request Handoff ist vorbereitet.");
