const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 19.1 Real LLM Gate Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/controlled-real-llm-gate-policy-store.ts",["simulateControlledRealLlmGatePolicy","appendGovernanceAuditEvent","realLlmCallAllowed:false","policyGateRequired:true","llmCallPerformed:false","executionAllowed:false"])&&ok;
ok=check("frontend/app/api/real-llm-gate-policy/route.ts",["simulateControlledRealLlmGatePolicy","GET","POST"])&&ok;
ok=check("frontend/app/real-llm-gate-policy/page.tsx",["Real LLM Gate Policy","Real LLM Gate Policy simulieren","policyGateRequired","realLlmCallAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/real-llm-gate-policy","Real LLM Policy","real-llm-gate-policy"])&&ok;
ok=check("phase19-1-real-llm-gate-policy-simulation-audit.md",["Phase 19.1","Real LLM Gate Policy Simulation","Phase 19.2","realLlmCallAllowed=false","policyGateRequired=true"])&&ok;
ok=check("docs/phase19-real-llm-gate-policy-simulation-audit-runbook.md",["phase19:1:patch","phase19:1:verify"])&&ok;
ok=check("package.json",["phase19:1:patch","phase19:1:verify","llm:real-gate:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 19.1 Real LLM Gate Policy Simulation & Audit ist vorbereitet.");
