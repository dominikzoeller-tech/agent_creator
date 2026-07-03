const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 16.0 Planner LLM Routing Prep Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/master-agent-planner-store.ts",["createMasterAgentPlannerRecommendation","executionAllowed:false","toolExecutionAllowed:false","agentExecutionAllowed:false","dryRunOnly:true","llmRoutingPrepOnly:true"])&&ok;
ok=check("frontend/app/api/master-planner/route.ts",["createMasterAgentPlannerRecommendation","GET","POST"])&&ok;
ok=check("frontend/app/master-planner/page.tsx",["Master Agent Planner","Planner Recommendation erzeugen","LLM Routing Prep","agentExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/master-planner","Planner","master-planner"])&&ok;
ok=check("phase16-0-master-agent-orchestration-planner-llm-routing-prep.md",["Phase 16.0","LLM-Routing Prep","Phase 16.1","llmRoutingPrepOnly=true"])&&ok;
ok=check("docs/phase16-master-agent-orchestration-planner-runbook.md",["phase16:0:patch","phase16:0:verify","/master-planner"])&&ok;
ok=check("package.json",["phase16:0:patch","phase16:0:verify","planner:routing:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 16.0 Master Agent Orchestration Planner / LLM-Routing Prep ist vorbereitet.");
