const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 22.0 Provider LLM Adapter Stub Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-agnostic-llm-invocation-adapter-stub-store.ts",["createProviderAgnosticLlmInvocationAdapterStub","provider_agnostic_no_network_stub","networkCallPerformed:false","providerExecutionAllowed:false","realLlmCallAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-llm-adapter-stub/route.ts",["createProviderAgnosticLlmInvocationAdapterStub","GET","POST"])&&ok;
ok=check("frontend/app/provider-llm-adapter-stub/page.tsx",["Provider-Agnostic LLM Adapter Stub","Provider Adapter Stub vorbereiten","networkCallPerformed","providerExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-llm-adapter-stub","Provider Stub","provider-llm-adapter-stub"])&&ok;
ok=check("phase22-0-provider-agnostic-llm-invocation-adapter-stub.md",["Phase 22.0","Provider-Agnostic LLM Invocation Adapter Stub","Phase 22.1","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase22-provider-agnostic-llm-adapter-stub-runbook.md",["phase22:0:patch","phase22:0:verify","/provider-llm-adapter-stub"])&&ok;
ok=check("package.json",["phase22:0:patch","phase22:0:verify","llm:provider-stub:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 22.0 Provider-Agnostic LLM Invocation Adapter Stub ist vorbereitet.");
