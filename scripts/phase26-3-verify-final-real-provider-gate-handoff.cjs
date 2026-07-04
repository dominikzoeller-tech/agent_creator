const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 26.3 Final Real Provider Gate Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase26-3-final-real-provider-gate-handoff-release-summary.md",["Phase 26.3","Phase 26.0","Phase 26.2","Phase 27.0","humanApprovalRequired=true","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase26-final-real-provider-gate-handoff-runbook.md",["phase26:3:patch","phase26:3:verify","llm:real-provider-gate:final:check","phase26:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase27.md",["Phase 27.0","Explicit Human Approval Token Request","Approval Token","Startprompt"])&&ok;
ok=check("package.json",["phase26:3:patch","phase26:3:verify","llm:real-provider-gate:final:check"])&&ok;
const required=["frontend/app/controlled-real-provider-invocation-gate/page.tsx","frontend/app/real-provider-gate-policy/page.tsx","frontend/app/real-provider-gate-dashboard/page.tsx","frontend/app/api/controlled-real-provider-invocation-gate/route.ts","frontend/app/api/real-provider-gate-policy/route.ts","frontend/lib/controlled-real-provider-invocation-gate-store.ts","frontend/lib/real-provider-gate-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 26.3 Final Real Provider Gate Handoff ist vorbereitet.");
