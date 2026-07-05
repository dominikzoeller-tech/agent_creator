const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 30.1 Token-Backed Provider Preflight Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/token-backed-provider-preflight-policy-store.ts",["simulateTokenBackedProviderPreflightPolicy","appendGovernanceAuditEvent","token_backed_provider_preflight_policy_allowed_no_provider_call","tokenActive:false","promptIncluded:false","secretValuesIncluded:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/token-backed-provider-preflight-policy/route.ts",["simulateTokenBackedProviderPreflightPolicy","GET","POST"])&&ok;
ok=check("frontend/app/token-backed-provider-preflight-policy/page.tsx",["Token-Backed Provider Preflight Policy","Token-backed Provider Preflight Policy simulieren","promptIncluded","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/token-backed-provider-preflight-policy","Token Provider Policy","token-backed-provider-preflight-policy"])&&ok;
ok=check("phase30-1-token-backed-provider-preflight-policy-audit.md",["Phase 30.1","Phase 30.2","tokenBackedPreflightPrepared=true","tokenActive=false","promptIncluded=false","secretValuesIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase30-token-backed-provider-preflight-policy-audit-runbook.md",["phase30:1:patch","phase30:1:verify"])&&ok;
ok=check("package.json",["phase30:1:patch","phase30:1:verify","llm:token-backed-provider:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 30.1 Token-Backed Provider Preflight Policy & Audit ist vorbereitet.");
