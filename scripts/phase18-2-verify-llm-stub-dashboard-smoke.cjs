const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 18.2 LLM Stub Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/llm-stub-dashboard/page.tsx",["LLM Stub Dashboard","Stub Übersicht","llmCallPerformed=false","stubOnly=true"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/llm-stub-dashboard","Stub Dashboard","llm-stub-dashboard"])&&ok;
ok=check("scripts/phase18-2-llm-stub-dashboard-smoke.cjs",["Phase 18.2 LLM Stub Dashboard Smoke","UI LLM Stub Dashboard","API LLM Stub Policy"])&&ok;
ok=check("phase18-2-llm-stub-dashboard-smoke.md",["Phase 18.2","LLM Stub Dashboard","Phase 18.3","llmCallPerformed=false","stubOnly=true"])&&ok;
ok=check("docs/phase18-llm-stub-dashboard-smoke-runbook.md",["phase18:2:patch","phase18:2:verify","phase18:2:smoke"])&&ok;
ok=check("package.json",["phase18:2:patch","phase18:2:verify","phase18:2:smoke","llm:stub:release:check"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 18.2 LLM Stub Dashboard & Smoke ist vorbereitet.");
