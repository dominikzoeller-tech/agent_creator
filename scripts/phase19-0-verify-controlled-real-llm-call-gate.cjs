const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 19.0 Controlled Real LLM Call Gate Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/controlled-real-llm-call-gate-store.ts",["createControlledRealLlmCallGate","realLlmCallAllowed:false","policyGateRequired:true","llmCallPerformed:false","executionAllowed:false","toolExecutionAllowed:false","agentExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/real-llm-call-gate/route.ts",["createControlledRealLlmCallGate","GET","POST"])&&ok;
ok=check("frontend/app/real-llm-call-gate/page.tsx",["Controlled Real LLM Call Gate","Real LLM Call Gate vorbereiten","policyGateRequired","realLlmCallAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/real-llm-call-gate","Real LLM Gate","real-llm-call-gate"])&&ok;
ok=check("phase19-0-controlled-real-llm-call-gate.md",["Phase 19.0","Controlled Real LLM Call Gate","Phase 19.1","realLlmCallAllowed=false","policyGateRequired=true"])&&ok;
ok=check("docs/phase19-controlled-real-llm-call-gate-runbook.md",["phase19:0:patch","phase19:0:verify","/real-llm-call-gate"])&&ok;
ok=check("package.json",["phase19:0:patch","phase19:0:verify","llm:real-gate:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 19.0 Controlled Real LLM Call Gate ist vorbereitet.");
