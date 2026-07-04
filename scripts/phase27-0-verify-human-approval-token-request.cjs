const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 27.0 Human Approval Token Request Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/human-approval-token-request-store.ts",["createHumanApprovalTokenRequest","explicit_human_approval_token_request_no_provider_call","approvalTokenRequested:true","approvalTokenIssued:false","humanApproved:false","networkCallPerformed:false","providerExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/human-approval-token-request/route.ts",["createHumanApprovalTokenRequest","GET","POST"])&&ok;
ok=check("frontend/app/human-approval-token-request/page.tsx",["Human Approval Token Request","Human Approval Token Request erfassen","approvalTokenIssued","providerExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/human-approval-token-request","Approval Token Request","human-approval-token-request"])&&ok;
ok=check("phase27-0-human-approval-token-request.md",["Phase 27.0","Explicit Human Approval Token Request","Phase 27.1","approvalTokenIssued=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase27-human-approval-token-request-runbook.md",["phase27:0:patch","phase27:0:verify","/human-approval-token-request"])&&ok;
ok=check("package.json",["phase27:0:patch","phase27:0:verify","llm:human-approval-token-request:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 27.0 Human Approval Token Request ist vorbereitet.");
