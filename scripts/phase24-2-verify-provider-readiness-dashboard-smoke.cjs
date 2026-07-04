const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 24.2 Provider Readiness Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/provider-readiness-dashboard/page.tsx",["Provider Readiness Dashboard","Provider Readiness Übersicht","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-readiness-dashboard","Readiness Dashboard","provider-readiness-dashboard"])&&ok;
ok=check("scripts/phase24-2-provider-readiness-dashboard-smoke.cjs",["Phase 24.2 Provider Readiness Dashboard Smoke","UI Provider Readiness Dashboard","API Provider Readiness Policy"])&&ok;
ok=check("phase24-2-provider-readiness-dashboard-smoke.md",["Phase 24.2","Provider Readiness Dashboard","Phase 24.3","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase24-provider-readiness-dashboard-smoke-runbook.md",["phase24:2:patch","phase24:2:verify","phase24:2:smoke"])&&ok;
ok=check("package.json",["phase24:2:patch","phase24:2:verify","phase24:2:smoke","llm:provider-readiness:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 24.2 Provider Readiness Dashboard & Smoke ist vorbereitet.");
