const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 21.2 Invocation Envelope Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/approved-real-llm-invocation-envelope-dashboard/page.tsx",["Invocation Envelope Dashboard","Invocation Envelope Übersicht","realLlmCallAllowed=false","dryRunOnly=true"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approved-real-llm-invocation-envelope-dashboard","Envelope Dashboard","approved-real-llm-invocation-envelope-dashboard"])&&ok;
ok=check("scripts/phase21-2-invocation-envelope-dashboard-smoke.cjs",["Phase 21.2 Invocation Envelope Dashboard Smoke","UI Invocation Envelope Dashboard","API Invocation Envelope Policy"])&&ok;
ok=check("phase21-2-invocation-envelope-dashboard-smoke.md",["Phase 21.2","Invocation Envelope Dashboard","Phase 21.3","realLlmCallAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase21-invocation-envelope-dashboard-smoke-runbook.md",["phase21:2:patch","phase21:2:verify","phase21:2:smoke"])&&ok;
ok=check("package.json",["phase21:2:patch","phase21:2:verify","phase21:2:smoke","llm:approved-envelope:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 21.2 Invocation Envelope Dashboard & Smoke ist vorbereitet.");
