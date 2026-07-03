const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 15.0 Master Agent Orchestrator Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/master-agent-orchestrator-store.ts", ["createMasterAgentOrchestrationPlan", "executionAllowed:false", "toolExecutionAllowed:false", "agentExecutionAllowed:false", "dryRunOnly:true", "master-agent-orchestration-plans.jsonl"]) && ok;
ok = check("frontend/app/api/master-orchestrator/route.ts", ["createMasterAgentOrchestrationPlan", "GET", "POST"]) && ok;
ok = check("frontend/app/master-orchestrator/page.tsx", ["Master Agent Orchestrator", "Orchestration Plan erzeugen", "agentExecutionAllowed", "dryRunOnly"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/master-orchestrator", "Orchestrator", "master-orchestrator"]) && ok;
ok = check("phase15-0-master-agent-orchestrator-planning.md", ["Phase 15.0", "Orchestration Plans", "Phase 15.1", "agentExecutionAllowed=false"]) && ok;
ok = check("docs/phase15-master-agent-orchestrator-planning-runbook.md", ["phase15:0:patch", "phase15:0:verify", "/master-orchestrator"]) && ok;
ok = check("package.json", ["phase15:0:patch", "phase15:0:verify", "orchestrator:planning:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 15.0 Master Agent Orchestrator Planning Layer ist vorbereitet.");
