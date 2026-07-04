const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 28.2 Approval Token Issuance Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/approval-token-issuance-dashboard/page.tsx",["Approval Token Issuance Dashboard","Approval Token Issuance Übersicht","approvalTokenIssued=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approval-token-issuance-dashboard","Token Issuance Dashboard","approval-token-issuance-dashboard"])&&ok;
ok=check("scripts/phase28-2-approval-token-issuance-dashboard-smoke.cjs",["Phase 28.2 Approval Token Issuance Dashboard Smoke","UI Approval Token Issuance Dashboard","API Approval Token Issuance Policy"])&&ok;
ok=check("phase28-2-approval-token-issuance-dashboard-smoke.md",["Phase 28.2","Approval Token Issuance Dashboard","Phase 28.3","approvalTokenIssued=false","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase28-approval-token-issuance-dashboard-smoke-runbook.md",["phase28:2:patch","phase28:2:verify","phase28:2:smoke"])&&ok;
ok=check("package.json",["phase28:2:patch","phase28:2:verify","phase28:2:smoke","llm:approval-token-issuance:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 28.2 Approval Token Issuance Dashboard & Smoke ist vorbereitet.");
