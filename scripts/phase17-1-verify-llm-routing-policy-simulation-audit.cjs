const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 17.1 LLM Routing Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/llm-routing-policy-simulation-store.ts",["simulateLlmRoutingPolicy","appendGovernanceAuditEvent","executionAllowed:false","toolExecutionAllowed:false","agentExecutionAllowed:false","llmRoutingPrepOnly:true"])&&ok;
ok=check("frontend/app/api/llm-routing-policy/route.ts",["simulateLlmRoutingPolicy","GET","POST"])&&ok;
ok=check("frontend/app/llm-routing-policy/page.tsx",["LLM Routing Policy","LLM Routing Policy simulieren","llmRoutingPrepOnly","agentExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/llm-routing-policy","LLM Policy","llm-routing-policy"])&&ok;
ok=check("phase17-1-llm-routing-policy-simulation-audit.md",["Phase 17.1","LLM Routing Policy Simulation","Phase 17.2","llmRoutingPrepOnly=true"])&&ok;
ok=check("docs/phase17-llm-routing-policy-simulation-audit-runbook.md",["phase17:1:patch","phase17:1:verify"])&&ok;
ok=check("package.json",["phase17:1:patch","phase17:1:verify","llm:routing:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 17.1 LLM Routing Policy Simulation & Audit ist vorbereitet.");
