const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 28.1 Approval Token Issuance Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/approval-token-issuance-policy-store.ts",["simulateApprovalTokenIssuancePolicy","appendGovernanceAuditEvent","approval_token_issuance_policy_allowed_no_token_issued","approvalTokenIssued:false","humanApproved:false","networkCallPerformed:false","providerExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/approval-token-issuance-policy/route.ts",["simulateApprovalTokenIssuancePolicy","GET","POST"])&&ok;
ok=check("frontend/app/approval-token-issuance-policy/page.tsx",["Approval Token Issuance Policy","Approval Token Issuance Policy simulieren","approvalTokenIssued","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approval-token-issuance-policy","Token Issuance Policy","approval-token-issuance-policy"])&&ok;
ok=check("phase28-1-approval-token-issuance-policy-audit.md",["Phase 28.1","Approval Token Issuance Policy","Phase 28.2","approvalTokenIssued=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase28-approval-token-issuance-policy-audit-runbook.md",["phase28:1:patch","phase28:1:verify"])&&ok;
ok=check("package.json",["phase28:1:patch","phase28:1:verify","llm:approval-token-issuance:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 28.1 Approval Token Issuance Policy & Audit ist vorbereitet.");
