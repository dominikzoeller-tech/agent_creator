const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 25.1 Provider Simulation Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/controlled-provider-invocation-simulation-policy-store.ts",["simulateControlledProviderSimulationPolicy","appendGovernanceAuditEvent","simulation_allowed_metadata_only","networkCallPerformed:false","providerExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/controlled-provider-invocation-simulation-policy/route.ts",["simulateControlledProviderSimulationPolicy","GET","POST"])&&ok;
ok=check("frontend/app/controlled-provider-invocation-simulation-policy/page.tsx",["Provider Simulation Policy","Provider Simulation Policy simulieren","networkCallPerformed","providerExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/controlled-provider-invocation-simulation-policy","Simulation Policy","controlled-provider-invocation-simulation-policy"])&&ok;
ok=check("phase25-1-provider-simulation-policy-audit.md",["Phase 25.1","Provider Simulation Policy","Phase 25.2","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase25-provider-simulation-policy-audit-runbook.md",["phase25:1:patch","phase25:1:verify"])&&ok;
ok=check("package.json",["phase25:1:patch","phase25:1:verify","llm:provider-simulation:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 25.1 Provider Simulation Policy & Audit ist vorbereitet.");
