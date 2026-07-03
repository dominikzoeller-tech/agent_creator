const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 19.3 Final Real LLM Gate Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase19-3-final-real-llm-gate-handoff-release-summary.md",["Phase 19.3","Phase 19.0","Phase 19.2","Phase 20.0","realLlmCallAllowed=false","policyGateRequired=true","executionAllowed=false"])&&ok;
ok=check("docs/phase19-final-real-llm-gate-handoff-runbook.md",["phase19:3:patch","phase19:3:verify","llm:real-gate:final:check","phase19:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase20.md",["Phase 20.0","Real LLM Invocation Consent Gate","explizite Nutzerfreigabe","Startprompt"])&&ok;
ok=check("package.json",["phase19:3:patch","phase19:3:verify","llm:real-gate:final:check"])&&ok;
const required=["frontend/app/real-llm-call-gate/page.tsx","frontend/app/real-llm-gate-policy/page.tsx","frontend/app/real-llm-gate-dashboard/page.tsx","frontend/app/api/real-llm-call-gate/route.ts","frontend/app/api/real-llm-gate-policy/route.ts","frontend/lib/controlled-real-llm-call-gate-store.ts","frontend/lib/controlled-real-llm-gate-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 19.3 Final Real LLM Gate Handoff ist vorbereitet.");
