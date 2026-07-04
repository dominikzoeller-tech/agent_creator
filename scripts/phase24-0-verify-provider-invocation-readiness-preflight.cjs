const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 24.0 Provider Invocation Readiness Preflight Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-invocation-readiness-preflight-store.ts",["createProviderInvocationReadinessPreflight","provider_invocation_readiness_preflight_no_provider_call","networkCallPerformed:false","providerExecutionAllowed:false","realLlmCallAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-invocation-readiness-preflight/route.ts",["createProviderInvocationReadinessPreflight","GET","POST"])&&ok;
ok=check("frontend/app/provider-invocation-readiness-preflight/page.tsx",["Provider Invocation Readiness Preflight","Provider Invocation Readiness Preflight vorbereiten","networkCallPerformed","providerExecutionAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-invocation-readiness-preflight","Provider Readiness","provider-invocation-readiness-preflight"])&&ok;
ok=check("phase24-0-provider-invocation-readiness-preflight.md",["Phase 24.0","Provider Invocation Readiness Preflight","Phase 24.1","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase24-provider-invocation-readiness-preflight-runbook.md",["phase24:0:patch","phase24:0:verify","/provider-invocation-readiness-preflight"])&&ok;
ok=check("package.json",["phase24:0:patch","phase24:0:verify","llm:provider-readiness:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 24.0 Provider Invocation Readiness Preflight ist vorbereitet.");
