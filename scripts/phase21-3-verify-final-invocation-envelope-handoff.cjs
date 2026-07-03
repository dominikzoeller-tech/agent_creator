const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 21.3 Final Invocation Envelope Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase21-3-final-invocation-envelope-handoff-release-summary.md",["Phase 21.3","Phase 21.0","Phase 21.2","Phase 22.0","realLlmCallAllowed=false","llmCallPerformed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase21-final-invocation-envelope-handoff-runbook.md",["phase21:3:patch","phase21:3:verify","llm:approved-envelope:final:check","phase21:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase22.md",["Phase 22.0","Provider-Agnostic LLM Invocation Adapter Stub","kein externer Netzwerk-/Provider-Aufruf","Startprompt"])&&ok;
ok=check("package.json",["phase21:3:patch","phase21:3:verify","llm:approved-envelope:final:check"])&&ok;
const required=["frontend/app/approved-real-llm-invocation-envelope/page.tsx","frontend/app/approved-real-llm-invocation-envelope-policy/page.tsx","frontend/app/approved-real-llm-invocation-envelope-dashboard/page.tsx","frontend/app/api/approved-real-llm-invocation-envelope/route.ts","frontend/app/api/approved-real-llm-invocation-envelope-policy/route.ts","frontend/lib/approved-real-llm-invocation-envelope-store.ts","frontend/lib/approved-real-llm-invocation-envelope-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 21.3 Final Invocation Envelope Handoff ist vorbereitet.");
