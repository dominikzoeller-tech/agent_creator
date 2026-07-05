const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 30.3 Final Token-Backed Provider Preflight Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase30-3-final-token-backed-provider-preflight-handoff-release-summary.md",["Phase 30.3","Phase 30.0","Phase 30.2","Phase 31.0","tokenBackedPreflightPrepared=true","tokenActive=false","promptIncluded=false","secretValuesIncluded=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase30-final-token-backed-provider-preflight-handoff-runbook.md",["phase30:3:patch","phase30:3:verify","llm:token-backed-provider:final:check","phase30:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase31.md",["Phase 31.0","Controlled Provider Request Contract Preparation","Startprompt"])&&ok;
ok=check("package.json",["phase30:3:patch","phase30:3:verify","llm:token-backed-provider:final:check"])&&ok;
const required=["frontend/app/token-backed-provider-invocation-preflight/page.tsx","frontend/app/token-backed-provider-preflight-policy/page.tsx","frontend/app/token-backed-provider-preflight-dashboard/page.tsx","frontend/app/api/token-backed-provider-invocation-preflight/route.ts","frontend/app/api/token-backed-provider-preflight-policy/route.ts","frontend/lib/token-backed-provider-invocation-preflight-store.ts","frontend/lib/token-backed-provider-preflight-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 30.3 Final Token-Backed Provider Preflight Handoff ist vorbereitet.");
