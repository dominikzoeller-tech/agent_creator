const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 22.2 Provider Adapter Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/provider-llm-adapter-dashboard/page.tsx",["Provider Adapter Dashboard","Provider Adapter Übersicht","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-llm-adapter-dashboard","Provider Dashboard","provider-llm-adapter-dashboard"])&&ok;
ok=check("scripts/phase22-2-provider-adapter-dashboard-smoke.cjs",["Phase 22.2 Provider Adapter Dashboard Smoke","UI Provider Adapter Dashboard","API Provider Adapter Policy"])&&ok;
ok=check("phase22-2-provider-adapter-dashboard-smoke.md",["Phase 22.2","Provider Adapter Dashboard","Phase 22.3","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase22-provider-adapter-dashboard-smoke-runbook.md",["phase22:2:patch","phase22:2:verify","phase22:2:smoke"])&&ok;
ok=check("package.json",["phase22:2:patch","phase22:2:verify","phase22:2:smoke","llm:provider-stub:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 22.2 Provider Adapter Dashboard & Smoke ist vorbereitet.");
