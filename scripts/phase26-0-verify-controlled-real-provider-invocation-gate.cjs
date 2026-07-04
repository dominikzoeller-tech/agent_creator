const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 26.0 Controlled Real Provider Invocation Gate Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/controlled-real-provider-invocation-gate-store.ts",["createControlledRealProviderInvocationGate","controlled_real_provider_invocation_gate_human_approval_required","humanApprovalRequired:true","humanApproved:false","networkCallPerformed:false","providerExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/controlled-real-provider-invocation-gate/route.ts",["createControlledRealProviderInvocationGate","GET","POST"])&&ok;
ok=check("frontend/app/controlled-real-provider-invocation-gate/page.tsx",["Controlled Real Provider Invocation Gate","Controlled Real Provider Invocation Gate vorbereiten","humanApprovalRequired","providerExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/controlled-real-provider-invocation-gate","Real Provider Gate","controlled-real-provider-invocation-gate"])&&ok;
ok=check("phase26-0-controlled-real-provider-invocation-gate.md",["Phase 26.0","Controlled Real Provider Invocation Gate","Phase 26.1","humanApprovalRequired=true","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase26-controlled-real-provider-invocation-gate-runbook.md",["phase26:0:patch","phase26:0:verify","/controlled-real-provider-invocation-gate"])&&ok;
ok=check("package.json",["phase26:0:patch","phase26:0:verify","llm:real-provider-gate:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 26.0 Controlled Real Provider Invocation Gate ist vorbereitet.");
