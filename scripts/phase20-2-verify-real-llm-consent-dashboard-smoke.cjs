const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 20.2 Real LLM Consent Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/real-llm-consent-dashboard/page.tsx",["Real LLM Consent Dashboard","Real LLM Consent Übersicht","consentRequired=true","humanApprovalRequired=true","realLlmCallAllowed=false"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/real-llm-consent-dashboard","Consent Dashboard","real-llm-consent-dashboard"])&&ok;
ok=check("scripts/phase20-2-real-llm-consent-dashboard-smoke.cjs",["Phase 20.2 Real LLM Consent Dashboard Smoke","UI Real LLM Consent Dashboard","API Real LLM Consent Decision"])&&ok;
ok=check("phase20-2-real-llm-consent-dashboard-smoke.md",["Phase 20.2","Real LLM Consent Dashboard","Phase 20.3","humanApprovalRequired=true","simulatedDecision=pending_review_only"])&&ok;
ok=check("docs/phase20-real-llm-consent-dashboard-smoke-runbook.md",["phase20:2:patch","phase20:2:verify","phase20:2:smoke"])&&ok;
ok=check("package.json",["phase20:2:patch","phase20:2:verify","phase20:2:smoke","llm:real-consent:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 20.2 Real LLM Consent Dashboard & Smoke ist vorbereitet.");
