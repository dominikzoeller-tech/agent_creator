const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 23.2 Provider Config Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/provider-config-dashboard/page.tsx",["Provider Config Dashboard","Provider Config Übersicht","noSecretValuesStored=true","networkCallPerformed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-config-dashboard","Provider Config Dashboard","provider-config-dashboard"])&&ok;
ok=check("scripts/phase23-2-provider-config-dashboard-smoke.cjs",["Phase 23.2 Provider Config Dashboard Smoke","UI Provider Config Dashboard","API Provider Config Policy"])&&ok;
ok=check("phase23-2-provider-config-dashboard-smoke.md",["Phase 23.2","Provider Config Dashboard","Phase 23.3","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase23-provider-config-dashboard-smoke-runbook.md",["phase23:2:patch","phase23:2:verify","phase23:2:smoke"])&&ok;
ok=check("package.json",["phase23:2:patch","phase23:2:verify","phase23:2:smoke","llm:provider-config:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 23.2 Provider Config Dashboard & Smoke ist vorbereitet.");
