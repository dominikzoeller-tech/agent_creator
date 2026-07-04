const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 23.1 Provider Config Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-config-policy-store.ts",["simulateProviderConfigPolicy","appendGovernanceAuditEvent","simulation_allowed_secret_boundary_only","networkCallPerformed:false","providerExecutionAllowed:false","noSecretValuesStored:true"])&&ok;
ok=check("frontend/app/api/provider-config-policy/route.ts",["simulateProviderConfigPolicy","GET","POST"])&&ok;
ok=check("frontend/app/provider-config-policy/page.tsx",["Provider Config Policy","Provider Config Policy simulieren","networkCallPerformed","providerExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-config-policy","Provider Config Policy","provider-config-policy"])&&ok;
ok=check("phase23-1-provider-config-policy-simulation-audit.md",["Phase 23.1","Provider Config Policy Simulation","Phase 23.2","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase23-provider-config-policy-simulation-audit-runbook.md",["phase23:1:patch","phase23:1:verify"])&&ok;
ok=check("package.json",["phase23:1:patch","phase23:1:verify","llm:provider-config:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 23.1 Provider Config Policy Simulation & Audit ist vorbereitet.");
