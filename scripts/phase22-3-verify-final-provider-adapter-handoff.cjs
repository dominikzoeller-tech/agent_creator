const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 22.3 Final Provider Adapter Handoff Verify"); console.log("======================================");
let ok=true;
ok=check("phase22-3-final-provider-adapter-handoff-release-summary.md",["Phase 22.3","Phase 22.0","Phase 22.2","Phase 23.0","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase22-final-provider-adapter-handoff-runbook.md",["phase22:3:patch","phase22:3:verify","llm:provider-stub:final:check","phase22:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase23.md",["Phase 23.0","Provider Configuration & Secret Boundary","keine Secrets","Startprompt"])&&ok;
ok=check("package.json",["phase22:3:patch","phase22:3:verify","llm:provider-stub:final:check"])&&ok;
const required=["frontend/app/provider-llm-adapter-stub/page.tsx","frontend/app/provider-llm-adapter-policy/page.tsx","frontend/app/provider-llm-adapter-dashboard/page.tsx","frontend/app/api/provider-llm-adapter-stub/route.ts","frontend/app/api/provider-llm-adapter-policy/route.ts","frontend/lib/provider-agnostic-llm-invocation-adapter-stub-store.ts","frontend/lib/provider-agnostic-llm-adapter-policy-store.ts"];
for(const file of required){ const found=exists(file); console.log((found?"OK  ":"MISS")+" required: "+file); if(!found) ok=false; }
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 22.3 Final Provider Adapter Handoff ist vorbereitet.");
