const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 26.2 Real Provider Gate Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/real-provider-gate-dashboard/page.tsx",["Real Provider Gate Dashboard","Real Provider Gate Übersicht","humanApprovalRequired=true","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/real-provider-gate-dashboard","Real Gate Dashboard","real-provider-gate-dashboard"])&&ok;
ok=check("scripts/phase26-2-real-provider-gate-dashboard-smoke.cjs",["Phase 26.2 Real Provider Gate Dashboard Smoke","UI Real Provider Gate Dashboard","API Real Provider Gate Policy"])&&ok;
ok=check("phase26-2-real-provider-gate-dashboard-smoke.md",["Phase 26.2","Real Provider Gate Dashboard","Phase 26.3","humanApprovalRequired=true","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase26-real-provider-gate-dashboard-smoke-runbook.md",["phase26:2:patch","phase26:2:verify","phase26:2:smoke"])&&ok;
ok=check("package.json",["phase26:2:patch","phase26:2:verify","phase26:2:smoke","llm:real-provider-gate:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 26.2 Real Provider Gate Dashboard & Smoke ist vorbereitet.");
