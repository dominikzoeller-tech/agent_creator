const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 20.3 Final Real LLM Consent Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase20-3-final-real-llm-consent-handoff-release-summary.md",["Phase 20.3","Phase 20.0","Phase 20.2","Phase 21.0","humanApprovalRequired=true","simulatedDecision=pending_review_only","realLlmCallAllowed=false"])&&ok;
ok=check("docs/phase20-final-real-llm-consent-handoff-runbook.md",["phase20:3:patch","phase20:3:verify","llm:real-consent:final:check","phase20:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase21.md",["Phase 21.0","Approved Real LLM Invocation Envelope","keine Tool- oder Agent-Ausführung","Startprompt"])&&ok;
ok=check("package.json",["phase20:3:patch","phase20:3:verify","llm:real-consent:final:check"])&&ok;
const required=["frontend/app/real-llm-consent/page.tsx","frontend/app/real-llm-consent-decision/page.tsx","frontend/app/real-llm-consent-dashboard/page.tsx","frontend/app/api/real-llm-consent/route.ts","frontend/app/api/real-llm-consent-decision/route.ts","frontend/lib/real-llm-invocation-consent-store.ts","frontend/lib/real-llm-consent-decision-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 20.3 Final Real LLM Consent Handoff ist vorbereitet.");
