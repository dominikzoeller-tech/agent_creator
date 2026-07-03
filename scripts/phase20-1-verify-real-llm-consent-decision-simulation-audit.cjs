const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 20.1 Consent Decision Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/real-llm-consent-decision-store.ts",["simulateRealLlmConsentDecision","appendGovernanceAuditEvent","simulatedDecision:\"pending_review_only\"","realLlmCallAllowed:false","humanApprovalRequired:true","executionAllowed:false"])&&ok;
ok=check("frontend/app/api/real-llm-consent-decision/route.ts",["simulateRealLlmConsentDecision","GET","POST"])&&ok;
ok=check("frontend/app/real-llm-consent-decision/page.tsx",["Real LLM Consent Decision","Consent Decision simulieren","humanApprovalRequired","realLlmCallAllowed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/real-llm-consent-decision","Consent Decision","real-llm-consent-decision"])&&ok;
ok=check("phase20-1-consent-decision-simulation-audit.md",["Phase 20.1","Consent Decision Simulation","Phase 20.2","simulatedDecision=pending_review_only","humanApprovalRequired=true"])&&ok;
ok=check("docs/phase20-consent-decision-simulation-audit-runbook.md",["phase20:1:patch","phase20:1:verify"])&&ok;
ok=check("package.json",["phase20:1:patch","phase20:1:verify","llm:real-consent:decision:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 20.1 Consent Decision Simulation & Audit ist vorbereitet.");
