const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 18.0 Controlled LLM Call Stub Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/controlled-llm-stub-response-store.ts",["createControlledLlmStubResponse","llmCallPerformed:false","stubOnly:true","executionAllowed:false","toolExecutionAllowed:false","agentExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/llm-stub-response/route.ts",["createControlledLlmStubResponse","GET","POST"])&&ok;
ok=check("frontend/app/llm-stub-response/page.tsx",["Controlled LLM Stub Response","Dry-run Explainer Response erzeugen","llmCallPerformed","stubOnly"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/llm-stub-response","LLM Stub","llm-stub-response"])&&ok;
ok=check("phase18-0-controlled-llm-call-stub-dry-run-explainer.md",["Phase 18.0","Dry-run Explainer Response","Phase 18.1","llmCallPerformed=false","stubOnly=true"])&&ok;
ok=check("docs/phase18-controlled-llm-call-stub-runbook.md",["phase18:0:patch","phase18:0:verify","/llm-stub-response"])&&ok;
ok=check("package.json",["phase18:0:patch","phase18:0:verify","llm:stub:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 18.0 Controlled LLM Call Stub ist vorbereitet.");
