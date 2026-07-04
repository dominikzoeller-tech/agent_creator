const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 24.1 Provider Readiness Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-readiness-policy-store.ts",["simulateProviderReadinessPolicy","appendGovernanceAuditEvent","simulation_allowed_readiness_only","networkCallPerformed:false","providerExecutionAllowed:false","realLlmCallAllowed:false"])&&ok;
ok=check("frontend/app/api/provider-readiness-policy/route.ts",["simulateProviderReadinessPolicy","GET","POST"])&&ok;
ok=check("frontend/app/provider-readiness-policy/page.tsx",["Provider Readiness Policy","Provider Readiness Policy simulieren","networkCallPerformed","providerExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-readiness-policy","Readiness Policy","provider-readiness-policy"])&&ok;
ok=check("phase24-1-readiness-policy-simulation-audit.md",["Phase 24.1","Readiness Policy Simulation","Phase 24.2","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase24-readiness-policy-simulation-audit-runbook.md",["phase24:1:patch","phase24:1:verify"])&&ok;
ok=check("package.json",["phase24:1:patch","phase24:1:verify","llm:provider-readiness:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 24.1 Provider Readiness Policy Simulation & Audit ist vorbereitet.");
