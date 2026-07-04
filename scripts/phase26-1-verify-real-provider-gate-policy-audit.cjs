const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 26.1 Real Provider Gate Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/real-provider-gate-policy-store.ts",["simulateRealProviderGatePolicy","appendGovernanceAuditEvent","gate_policy_simulation_allowed_human_approval_required","humanApprovalRequired:true","humanApproved:false","networkCallPerformed:false","providerExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/real-provider-gate-policy/route.ts",["simulateRealProviderGatePolicy","GET","POST"])&&ok;
ok=check("frontend/app/real-provider-gate-policy/page.tsx",["Real Provider Gate Policy","Real Provider Gate Policy simulieren","humanApprovalRequired","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/real-provider-gate-policy","Real Gate Policy","real-provider-gate-policy"])&&ok;
ok=check("phase26-1-real-provider-gate-policy-audit.md",["Phase 26.1","Real Provider Gate Policy","Phase 26.2","humanApprovalRequired=true","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase26-real-provider-gate-policy-audit-runbook.md",["phase26:1:patch","phase26:1:verify"])&&ok;
ok=check("package.json",["phase26:1:patch","phase26:1:verify","llm:real-provider-gate:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 26.1 Real Provider Gate Policy & Audit ist vorbereitet.");
