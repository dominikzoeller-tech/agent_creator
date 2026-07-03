const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 16.1 Planner Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/master-agent-planner-policy-store.ts",["simulateMasterAgentPlannerPolicy","appendGovernanceAuditEvent","executionAllowed:false","toolExecutionAllowed:false","agentExecutionAllowed:false","llmRoutingPrepOnly:true"])&&ok;
ok=check("frontend/app/api/master-planner-policy/route.ts",["simulateMasterAgentPlannerPolicy","GET","POST"])&&ok;
ok=check("frontend/app/master-planner-policy/page.tsx",["Master Planner Policy","Planner Policy simulieren","llmRoutingPrepOnly","agentExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/master-planner-policy","Planner Policy","master-planner-policy"])&&ok;
ok=check("phase16-1-planner-policy-simulation-audit.md",["Phase 16.1","Planner Policy Simulation","Phase 16.2","llmRoutingPrepOnly=true"])&&ok;
ok=check("docs/phase16-planner-policy-simulation-audit-runbook.md",["phase16:1:patch","phase16:1:verify"])&&ok;
ok=check("package.json",["phase16:1:patch","phase16:1:verify","planner:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 16.1 Planner Policy Simulation & Audit ist vorbereitet.");
