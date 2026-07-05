const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 29.2 Approval Token Activation Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/approval-token-activation-dashboard/page.tsx",["Approval Token Activation Dashboard","Approval Token Activation Übersicht","tokenActivationPrepared=true","tokenActive=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approval-token-activation-dashboard","Token Activation Dashboard","approval-token-activation-dashboard"])&&ok;
ok=check("scripts/phase29-2-approval-token-activation-dashboard-smoke.cjs",["Phase 29.2 Approval Token Activation Dashboard Smoke","UI Approval Token Activation Dashboard","API Approval Token Activation Policy"])&&ok;
ok=check("phase29-2-approval-token-activation-dashboard-smoke.md",["Phase 29.2","Approval Token Activation Dashboard","Phase 29.3","tokenActivationPrepared=true","tokenActive=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase29-approval-token-activation-dashboard-smoke-runbook.md",["phase29:2:patch","phase29:2:verify","phase29:2:smoke"])&&ok;
ok=check("package.json",["phase29:2:patch","phase29:2:verify","phase29:2:smoke","llm:approval-token-activation:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 29.2 Approval Token Activation Dashboard & Smoke ist vorbereitet.");
