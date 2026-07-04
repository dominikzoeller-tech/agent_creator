const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 25.0 Controlled Provider Invocation Simulation Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/controlled-provider-invocation-simulation-envelope-store.ts",["createControlledProviderInvocationSimulationEnvelope","controlled_provider_invocation_simulation_envelope_no_external_call","networkCallPerformed:false","providerExecutionAllowed:false","realLlmCallAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/controlled-provider-invocation-simulation-envelope/route.ts",["createControlledProviderInvocationSimulationEnvelope","GET","POST"])&&ok;
ok=check("frontend/app/controlled-provider-invocation-simulation-envelope/page.tsx",["Controlled Provider Invocation Simulation Envelope","Controlled Provider Simulation Envelope vorbereiten","networkCallPerformed","providerExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/controlled-provider-invocation-simulation-envelope","Provider Simulation","controlled-provider-invocation-simulation-envelope"])&&ok;
ok=check("phase25-0-controlled-provider-invocation-simulation-envelope.md",["Phase 25.0","Controlled Provider Invocation Simulation Envelope","Phase 25.1","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase25-controlled-provider-invocation-simulation-envelope-runbook.md",["phase25:0:patch","phase25:0:verify","/controlled-provider-invocation-simulation-envelope"])&&ok;
ok=check("package.json",["phase25:0:patch","phase25:0:verify","llm:provider-simulation-envelope:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 25.0 Controlled Provider Invocation Simulation Envelope ist vorbereitet.");
