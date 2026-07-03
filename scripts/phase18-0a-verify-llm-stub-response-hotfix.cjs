const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file)} function exists(file){return fs.existsSync(full(file))} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):""}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false } return ok }
console.log("======================================"); console.log(" Phase 18.0a LLM Stub Response Hotfix Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/controlled-llm-stub-response-store.ts",["createControlledLlmStubResponse","llmCallPerformed:false","stubOnly:true","executionAllowed:false","toolExecutionAllowed:false","agentExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/llm-stub-response/route.ts",["createControlledLlmStubResponse","GET","POST"])&&ok;
ok=check("frontend/app/llm-stub-response/page.tsx",["Controlled LLM Stub Response","Dry-run Explainer Response erzeugen","llmCallPerformed","stubOnly"])&&ok;
ok=check("package.json",["phase18:0:verify","phase18:0:patch","llm:stub:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1)}
console.log("Verify OK. Phase 18.0a Hotfix ist vorbereitet.");
