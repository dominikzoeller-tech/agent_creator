const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 24.3 Final Provider Readiness Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase24-3-final-provider-readiness-handoff-release-summary.md",["Phase 24.3","Phase 24.0","Phase 24.2","Phase 25.0","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase24-final-provider-readiness-handoff-runbook.md",["phase24:3:patch","phase24:3:verify","llm:provider-readiness:final:check","phase24:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase25.md",["Phase 25.0","Controlled Provider Invocation Simulation Envelope","keine echten Provider Calls","Startprompt"])&&ok;
ok=check("package.json",["phase24:3:patch","phase24:3:verify","llm:provider-readiness:final:check"])&&ok;
const required=["frontend/app/provider-invocation-readiness-preflight/page.tsx","frontend/app/provider-readiness-policy/page.tsx","frontend/app/provider-readiness-dashboard/page.tsx","frontend/app/api/provider-invocation-readiness-preflight/route.ts","frontend/app/api/provider-readiness-policy/route.ts","frontend/lib/provider-invocation-readiness-preflight-store.ts","frontend/lib/provider-readiness-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 24.3 Final Provider Readiness Handoff ist vorbereitet.");
