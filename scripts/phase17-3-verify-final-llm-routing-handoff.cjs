const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 17.3 Final LLM Routing Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase17-3-final-llm-routing-handoff-release-summary.md",["Phase 17.3","Phase 17.0","Phase 17.2","Phase 18.0","llmRoutingPrepOnly=true","executionAllowed=false"])&&ok;
ok=check("docs/phase17-final-llm-routing-handoff-runbook.md",["phase17:3:patch","phase17:3:verify","llm:routing:final:check"])&&ok;
ok=check("next-chat-handoff-phase18.md",["Phase 18.0","Controlled LLM Call Stub","keine echte Tool-Ausführung","Startprompt"])&&ok;
ok=check("package.json",["phase17:3:patch","phase17:3:verify","llm:routing:final:check"])&&ok;
const required=["frontend/app/llm-routing-envelope/page.tsx","frontend/app/llm-routing-policy/page.tsx","frontend/app/llm-routing-dashboard/page.tsx","frontend/app/api/llm-routing-envelope/route.ts","frontend/app/api/llm-routing-policy/route.ts","frontend/lib/controlled-llm-routing-envelope-store.ts","frontend/lib/llm-routing-policy-simulation-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 17.3 Final LLM Routing Handoff ist vorbereitet.");
