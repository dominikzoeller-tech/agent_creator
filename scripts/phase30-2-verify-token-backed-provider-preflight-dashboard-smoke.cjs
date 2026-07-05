const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 30.2 Token-Backed Provider Preflight Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/token-backed-provider-preflight-dashboard/page.tsx",["Token-Backed Provider Preflight Dashboard","Token-Backed Provider Preflight Übersicht","tokenBackedPreflightPrepared=true","tokenActive=false","promptIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/token-backed-provider-preflight-dashboard","Token Provider Dashboard","token-backed-provider-preflight-dashboard"])&&ok;
ok=check("scripts/phase30-2-token-backed-provider-preflight-dashboard-smoke.cjs",["Phase 30.2 Token-Backed Provider Preflight Dashboard Smoke","UI Token Provider Dashboard","API Token Provider Policy"])&&ok;
ok=check("phase30-2-token-backed-provider-preflight-dashboard-smoke.md",["Phase 30.2","Token-Backed Provider Preflight Dashboard","Phase 30.3","tokenBackedPreflightPrepared=true","tokenActive=false","promptIncluded=false","secretValuesIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase30-token-backed-provider-preflight-dashboard-smoke-runbook.md",["phase30:2:patch","phase30:2:verify","phase30:2:smoke"])&&ok;
ok=check("package.json",["phase30:2:patch","phase30:2:verify","phase30:2:smoke","llm:token-backed-provider:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 30.2 Token-Backed Provider Preflight Dashboard & Smoke ist vorbereitet.");
