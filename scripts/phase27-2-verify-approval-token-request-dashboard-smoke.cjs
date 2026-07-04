const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 27.2 Approval Token Request Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/approval-token-request-dashboard/page.tsx",["Approval Token Request Dashboard","Approval Token Request Übersicht","approvalTokenIssued=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approval-token-request-dashboard","Approval Token Dashboard","approval-token-request-dashboard"])&&ok;
ok=check("scripts/phase27-2-approval-token-request-dashboard-smoke.cjs",["Phase 27.2 Approval Token Request Dashboard Smoke","UI Approval Token Request Dashboard","API Approval Token Request Policy"])&&ok;
ok=check("phase27-2-approval-token-request-dashboard-smoke.md",["Phase 27.2","Approval Token Request Dashboard","Phase 27.3","approvalTokenIssued=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase27-approval-token-request-dashboard-smoke-runbook.md",["phase27:2:patch","phase27:2:verify","phase27:2:smoke"])&&ok;
ok=check("package.json",["phase27:2:patch","phase27:2:verify","phase27:2:smoke","llm:approval-token-request:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 27.2 Approval Token Request Dashboard & Smoke ist vorbereitet.");
