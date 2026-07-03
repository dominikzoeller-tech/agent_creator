const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 18.3 Final LLM Stub Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase18-3-final-llm-stub-handoff-release-summary.md",["Phase 18.3","Phase 18.0","Phase 18.0a","Phase 18.2","Phase 19.0","llmCallPerformed=false","stubOnly=true","executionAllowed=false"])&&ok;
ok=check("docs/phase18-final-llm-stub-handoff-runbook.md",["phase18:3:patch","phase18:3:verify","llm:stub:final:check","phase18:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase19.md",["Phase 19.0","Controlled Real LLM Call Gate","kein produktiver LLM-Aufruf","Startprompt"])&&ok;
ok=check("package.json",["phase18:3:patch","phase18:3:verify","llm:stub:final:check"])&&ok;
const required=["frontend/app/llm-stub-response/page.tsx","frontend/app/llm-stub-policy/page.tsx","frontend/app/llm-stub-dashboard/page.tsx","frontend/app/api/llm-stub-response/route.ts","frontend/app/api/llm-stub-policy/route.ts","frontend/lib/controlled-llm-stub-response-store.ts","frontend/lib/controlled-llm-stub-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 18.3 Final LLM Stub Handoff ist vorbereitet.");
