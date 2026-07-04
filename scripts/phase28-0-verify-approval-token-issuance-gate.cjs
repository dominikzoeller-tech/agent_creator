const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 28.0 Approval Token Issuance Gate Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/approval-token-issuance-gate-store.ts",["createApprovalTokenIssuanceGate","explicit_human_approval_token_issuance_gate_no_provider_call","approvalTokenIssuancePrepared:true","approvalTokenIssued:false","humanApproved:false","networkCallPerformed:false","providerExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/approval-token-issuance-gate/route.ts",["createApprovalTokenIssuanceGate","GET","POST"])&&ok;
ok=check("frontend/app/approval-token-issuance-gate/page.tsx",["Approval Token Issuance Gate","Approval Token Issuance Gate vorbereiten","approvalTokenIssued","providerExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approval-token-issuance-gate","Token Issuance Gate","approval-token-issuance-gate"])&&ok;
ok=check("phase28-0-approval-token-issuance-gate.md",["Phase 28.0","Explicit Human Approval Token Issuance Gate","Phase 28.1","approvalTokenIssued=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase28-approval-token-issuance-gate-runbook.md",["phase28:0:patch","phase28:0:verify","/approval-token-issuance-gate"])&&ok;
ok=check("package.json",["phase28:0:patch","phase28:0:verify","llm:approval-token-issuance-gate:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 28.0 Approval Token Issuance Gate ist vorbereitet.");
