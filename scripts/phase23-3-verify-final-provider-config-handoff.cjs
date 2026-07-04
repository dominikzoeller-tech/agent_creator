const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 23.3 Final Provider Config Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase23-3-final-provider-config-handoff-release-summary.md",["Phase 23.3","Phase 23.0","Phase 23.2","Phase 24.0","noSecretValuesStored=true","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase23-final-provider-config-handoff-runbook.md",["phase23:3:patch","phase23:3:verify","llm:provider-config:final:check","phase23:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase24.md",["Phase 24.0","Provider Invocation Readiness Preflight","kein externer Netzwerk-/Provider-Aufruf","Startprompt"])&&ok;
ok=check("package.json",["phase23:3:patch","phase23:3:verify","llm:provider-config:final:check"])&&ok;
const required=["frontend/app/provider-config-secret-boundary/page.tsx","frontend/app/provider-config-policy/page.tsx","frontend/app/provider-config-dashboard/page.tsx","frontend/app/api/provider-config-secret-boundary/route.ts","frontend/app/api/provider-config-policy/route.ts","frontend/lib/provider-config-secret-boundary-store.ts","frontend/lib/provider-config-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 23.3 Final Provider Config Handoff ist vorbereitet.");
