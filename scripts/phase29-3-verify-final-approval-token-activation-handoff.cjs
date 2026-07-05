const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 29.3 Final Approval Token Activation Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase29-3-final-approval-token-activation-handoff-release-summary.md",["Phase 29.3","Phase 29.0","Phase 29.2","Phase 30.0","tokenActivationPrepared=true","tokenActive=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase29-final-approval-token-activation-handoff-runbook.md",["phase29:3:patch","phase29:3:verify","llm:approval-token-activation:final:check","phase29:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase30.md",["Phase 30.0","Controlled Token-Backed Provider Invocation Preflight","Startprompt"])&&ok;
ok=check("package.json",["phase29:3:patch","phase29:3:verify","llm:approval-token-activation:final:check"])&&ok;
const required=["frontend/app/approval-token-activation-gate/page.tsx","frontend/app/approval-token-activation-policy/page.tsx","frontend/app/approval-token-activation-dashboard/page.tsx","frontend/app/api/approval-token-activation-gate/route.ts","frontend/app/api/approval-token-activation-policy/route.ts","frontend/lib/approval-token-activation-gate-store.ts","frontend/lib/approval-token-activation-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 29.3 Final Approval Token Activation Handoff ist vorbereitet.");
