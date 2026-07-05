const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 30.0 Token-Backed Provider Preflight Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/token-backed-provider-invocation-preflight-store.ts",["createTokenBackedProviderInvocationPreflight","controlled_token_backed_provider_invocation_preflight_no_provider_call","tokenBackedPreflightPrepared:true","tokenActive:false","promptIncluded:false","secretValuesIncluded:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/token-backed-provider-invocation-preflight/route.ts",["createTokenBackedProviderInvocationPreflight","GET","POST"])&&ok;
ok=check("frontend/app/token-backed-provider-invocation-preflight/page.tsx",["Token-Backed Provider Invocation Preflight","Token-backed Provider Preflight vorbereiten","promptIncluded","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/token-backed-provider-invocation-preflight","Token Provider Preflight","token-backed-provider-invocation-preflight"])&&ok;
ok=check("phase30-0-token-backed-provider-invocation-preflight.md",["Phase 30.0","Phase 30.1","tokenBackedPreflightPrepared=true","tokenActive=false","promptIncluded=false","secretValuesIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase30-token-backed-provider-invocation-preflight-runbook.md",["phase30:0:patch","phase30:0:verify","/token-backed-provider-invocation-preflight"])&&ok;
ok=check("package.json",["phase30:0:patch","phase30:0:verify","llm:token-backed-provider:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 30.0 Token-Backed Provider Invocation Preflight ist vorbereitet.");
