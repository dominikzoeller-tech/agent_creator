const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 17.2 LLM Routing Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/llm-routing-dashboard/page.tsx",["LLM Routing Dashboard","LLM Routing Übersicht","Sanitized Context only","llmRoutingPrepOnly=true"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/llm-routing-dashboard","LLM Dashboard","llm-routing-dashboard"])&&ok;
ok=check("scripts/phase17-2-llm-routing-dashboard-smoke.cjs",["Phase 17.2 LLM Routing Dashboard Smoke","UI LLM Routing Dashboard","API LLM Routing Policy"])&&ok;
ok=check("phase17-2-llm-routing-dashboard-smoke.md",["Phase 17.2","LLM Routing Dashboard","Phase 17.3","llmRoutingPrepOnly=true"])&&ok;
ok=check("docs/phase17-llm-routing-dashboard-smoke-runbook.md",["phase17:2:patch","phase17:2:verify","phase17:2:smoke"])&&ok;
ok=check("package.json",["phase17:2:patch","phase17:2:verify","phase17:2:smoke","llm:routing:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 17.2 LLM Routing Dashboard & Smoke ist vorbereitet.");
