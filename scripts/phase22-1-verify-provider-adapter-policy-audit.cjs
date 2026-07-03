const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 22.1 Provider Adapter Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-agnostic-llm-adapter-policy-store.ts",["simulateProviderAdapterPolicy","appendGovernanceAuditEvent","simulation_allowed_stub_only","networkCallPerformed:false","providerExecutionAllowed:false","realLlmCallAllowed:false"])&&ok;
ok=check("frontend/app/api/provider-llm-adapter-policy/route.ts",["simulateProviderAdapterPolicy","GET","POST"])&&ok;
ok=check("frontend/app/provider-llm-adapter-policy/page.tsx",["Provider Adapter Policy","Provider Adapter Policy simulieren","networkCallPerformed","providerExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-llm-adapter-policy","Provider Policy","provider-llm-adapter-policy"])&&ok;
ok=check("phase22-1-provider-adapter-policy-simulation-audit.md",["Phase 22.1","Provider Adapter Policy Simulation","Phase 22.2","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase22-provider-adapter-policy-simulation-audit-runbook.md",["phase22:1:patch","phase22:1:verify"])&&ok;
ok=check("package.json",["phase22:1:patch","phase22:1:verify","llm:provider-stub:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 22.1 Provider Adapter Policy Simulation & Audit ist vorbereitet.");
