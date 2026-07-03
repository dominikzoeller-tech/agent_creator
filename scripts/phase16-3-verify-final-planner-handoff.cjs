const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 16.3 Final Planner Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase16-3-final-planner-handoff-release-summary.md",["Phase 16.3","Phase 16.0","Phase 16.2","Phase 17.0","llmRoutingPrepOnly=true","executionAllowed=false"])&&ok;
ok=check("docs/phase16-final-planner-handoff-runbook.md",["phase16:3:patch","phase16:3:verify","planner:final:check"])&&ok;
ok=check("next-chat-handoff-phase17.md",["Phase 17.0","Controlled LLM Routing Envelope","keine echte Tool-Ausführung","Startprompt"])&&ok;
ok=check("package.json",["phase16:3:patch","phase16:3:verify","planner:final:check"])&&ok;
const required=["frontend/app/master-planner/page.tsx","frontend/app/master-planner-policy/page.tsx","frontend/app/master-planner-dashboard/page.tsx","frontend/app/api/master-planner/route.ts","frontend/app/api/master-planner-policy/route.ts","frontend/lib/master-agent-planner-store.ts","frontend/lib/master-agent-planner-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 16.3 Final Planner Handoff ist vorbereitet.");
