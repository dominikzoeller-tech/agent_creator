const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 29.0 Approval Token Activation Gate Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/approval-token-activation-gate-store.ts",["createApprovalTokenActivationGate","explicit_human_approval_token_activation_gate_no_provider_call","tokenActivationPrepared:true","tokenActive:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/approval-token-activation-gate/route.ts",["createApprovalTokenActivationGate","GET","POST"])&&ok;
ok=check("frontend/app/approval-token-activation-gate/page.tsx",["Approval Token Activation Gate","Approval Token Activation Gate vorbereiten","tokenActive","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approval-token-activation-gate","Token Activation Gate","approval-token-activation-gate"])&&ok;
ok=check("phase29-0-approval-token-activation-gate.md",["Phase 29.0","Phase 29.1","tokenActivationPrepared=true","tokenActive=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase29-approval-token-activation-gate-runbook.md",["phase29:0:patch","phase29:0:verify","/approval-token-activation-gate"])&&ok;
ok=check("package.json",["phase29:0:patch","phase29:0:verify","llm:approval-token-activation:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 29.0 Approval Token Activation Gate ist vorbereitet.");
