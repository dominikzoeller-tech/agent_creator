const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 19.2 Real LLM Gate Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/real-llm-gate-dashboard/page.tsx",["Real LLM Gate Dashboard","Real LLM Gate Übersicht","realLlmCallAllowed=false","policyGateRequired=true"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/real-llm-gate-dashboard","Real LLM Dashboard","real-llm-gate-dashboard"])&&ok;
ok=check("scripts/phase19-2-real-llm-gate-dashboard-smoke.cjs",["Phase 19.2 Real LLM Gate Dashboard Smoke","UI Real LLM Gate Dashboard","API Real LLM Gate Policy"])&&ok;
ok=check("phase19-2-real-llm-gate-dashboard-smoke.md",["Phase 19.2","Real LLM Gate Dashboard","Phase 19.3","realLlmCallAllowed=false","policyGateRequired=true"])&&ok;
ok=check("docs/phase19-real-llm-gate-dashboard-smoke-runbook.md",["phase19:2:patch","phase19:2:verify","phase19:2:smoke"])&&ok;
ok=check("package.json",["phase19:2:patch","phase19:2:verify","phase19:2:smoke","llm:real-gate:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 19.2 Real LLM Gate Dashboard & Smoke ist vorbereitet.");
