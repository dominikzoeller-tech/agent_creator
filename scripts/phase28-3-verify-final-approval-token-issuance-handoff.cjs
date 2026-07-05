const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 28.3 Final Approval Token Issuance Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase28-3-final-approval-token-issuance-handoff-release-summary.md",["Phase 28.3","Phase 28.0","Phase 28.2","Phase 29.0","approvalTokenIssuancePrepared=true","approvalTokenIssued=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase28-final-approval-token-issuance-handoff-runbook.md",["phase28:3:patch","phase28:3:verify","llm:approval-token-issuance:final:check","phase28:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase29.md",["Phase 29.0","Explicit Human Approval Token Activation Gate","Token-Aktivierung","Startprompt"])&&ok;
ok=check("package.json",["phase28:3:patch","phase28:3:verify","llm:approval-token-issuance:final:check"])&&ok;
const required=["frontend/app/approval-token-issuance-gate/page.tsx","frontend/app/approval-token-issuance-policy/page.tsx","frontend/app/approval-token-issuance-dashboard/page.tsx","frontend/app/api/approval-token-issuance-gate/route.ts","frontend/app/api/approval-token-issuance-policy/route.ts","frontend/lib/approval-token-issuance-gate-store.ts","frontend/lib/approval-token-issuance-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 28.3 Final Approval Token Issuance Handoff ist vorbereitet.");
