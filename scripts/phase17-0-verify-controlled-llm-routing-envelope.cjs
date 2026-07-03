const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 17.0 Controlled LLM Routing Envelope Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/controlled-llm-routing-envelope-store.ts",["createControlledLlmRoutingEnvelope","sanitizedContext","allowedOutputContract","executionAllowed:false","toolExecutionAllowed:false","agentExecutionAllowed:false","llmRoutingPrepOnly:true","noSecretsIncluded"])&&ok;
ok=check("frontend/app/api/llm-routing-envelope/route.ts",["createControlledLlmRoutingEnvelope","GET","POST"])&&ok;
ok=check("frontend/app/llm-routing-envelope/page.tsx",["Controlled LLM Routing Envelope","LLM Routing Envelope erzeugen","Sanitized Context","Explainer Prompt","noSecretsIncluded"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/llm-routing-envelope","LLM Routing","llm-routing-envelope"])&&ok;
ok=check("phase17-0-controlled-llm-routing-envelope.md",["Phase 17.0","Controlled LLM Routing Envelope","Phase 17.1","llmRoutingPrepOnly=true"])&&ok;
ok=check("docs/phase17-controlled-llm-routing-envelope-runbook.md",["phase17:0:patch","phase17:0:verify","/llm-routing-envelope"])&&ok;
ok=check("package.json",["phase17:0:patch","phase17:0:verify","llm:routing:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 17.0 Controlled LLM Routing Envelope ist vorbereitet.");
