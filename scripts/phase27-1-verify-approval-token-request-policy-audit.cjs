const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 27.1 Approval Token Request Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/approval-token-request-policy-store.ts",["simulateApprovalTokenRequestPolicy","appendGovernanceAuditEvent","approval_token_request_policy_allowed_no_token_issued","approvalTokenIssued:false","humanApproved:false","networkCallPerformed:false","providerExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/approval-token-request-policy/route.ts",["simulateApprovalTokenRequestPolicy","GET","POST"])&&ok;
ok=check("frontend/app/approval-token-request-policy/page.tsx",["Approval Token Request Policy","Approval Token Request Policy simulieren","approvalTokenIssued","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approval-token-request-policy","Approval Token Policy","approval-token-request-policy"])&&ok;
ok=check("phase27-1-approval-token-request-policy-audit.md",["Phase 27.1","Approval Token Request Policy","Phase 27.2","approvalTokenIssued=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase27-approval-token-request-policy-audit-runbook.md",["phase27:1:patch","phase27:1:verify"])&&ok;
ok=check("package.json",["phase27:1:patch","phase27:1:verify","llm:approval-token-request:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 27.1 Approval Token Request Policy & Audit ist vorbereitet.");
