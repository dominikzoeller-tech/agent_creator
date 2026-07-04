const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 25.3 Final Provider Simulation Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase25-3-final-provider-simulation-handoff-release-summary.md",["Phase 25.3","Phase 25.0","Phase 25.2","Phase 26.0","provider=none","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase25-final-provider-simulation-handoff-runbook.md",["phase25:3:patch","phase25:3:verify","llm:provider-simulation:final:check","phase25:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase26.md",["Phase 26.0","Controlled Real Provider Invocation Gate","Human Approval","Startprompt"])&&ok;
ok=check("package.json",["phase25:3:patch","phase25:3:verify","llm:provider-simulation:final:check"])&&ok;
const required=["frontend/app/controlled-provider-invocation-simulation-envelope/page.tsx","frontend/app/controlled-provider-invocation-simulation-policy/page.tsx","frontend/app/provider-simulation-dashboard/page.tsx","frontend/app/api/controlled-provider-invocation-simulation-envelope/route.ts","frontend/app/api/controlled-provider-invocation-simulation-policy/route.ts","frontend/lib/controlled-provider-invocation-simulation-envelope-store.ts","frontend/lib/controlled-provider-invocation-simulation-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 25.3 Final Provider Simulation Handoff ist vorbereitet.");
