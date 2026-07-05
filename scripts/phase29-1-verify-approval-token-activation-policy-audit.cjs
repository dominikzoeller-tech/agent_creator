const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 29.1 Approval Token Activation Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/approval-token-activation-policy-store.ts",["simulateApprovalTokenActivationPolicy","appendGovernanceAuditEvent","approval_token_activation_policy_allowed_no_activation","tokenActive:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/approval-token-activation-policy/route.ts",["simulateApprovalTokenActivationPolicy","GET","POST"])&&ok;
ok=check("frontend/app/approval-token-activation-policy/page.tsx",["Approval Token Activation Policy","Approval Token Activation Policy simulieren","tokenActive","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approval-token-activation-policy","Token Activation Policy","approval-token-activation-policy"])&&ok;
ok=check("phase29-1-approval-token-activation-policy-audit.md",["Phase 29.1","Phase 29.2","tokenActivationPrepared=true","tokenActive=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase29-approval-token-activation-policy-audit-runbook.md",["phase29:1:patch","phase29:1:verify"])&&ok;
ok=check("package.json",["phase29:1:patch","phase29:1:verify","llm:approval-token-activation:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 29.1 Approval Token Activation Policy & Audit ist vorbereitet.");
