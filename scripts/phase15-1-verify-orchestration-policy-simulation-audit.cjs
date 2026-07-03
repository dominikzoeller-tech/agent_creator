const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 15.1 Orchestration Policy Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/master-agent-orchestration-policy-store.ts", ["simulateMasterAgentOrchestrationPolicy", "appendGovernanceAuditEvent", "executionAllowed:false", "toolExecutionAllowed:false", "agentExecutionAllowed:false", "dryRunOnly:true"]) && ok;
ok = check("frontend/app/api/master-orchestrator-policy/route.ts", ["simulateMasterAgentOrchestrationPolicy", "GET", "POST"]) && ok;
ok = check("frontend/app/master-orchestrator-policy/page.tsx", ["Master Orchestrator Policy", "Orchestration Policy simulieren", "agentExecutionAllowed", "dryRunOnly"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/master-orchestrator-policy", "Orch Policy", "master-orchestrator-policy"]) && ok;
ok = check("phase15-1-orchestration-policy-simulation-audit.md", ["Phase 15.1", "Policy Simulation", "Phase 15.2", "agentExecutionAllowed=false"]) && ok;
ok = check("docs/phase15-orchestration-policy-simulation-audit-runbook.md", ["phase15:1:patch", "phase15:1:verify"]) && ok;
ok = check("package.json", ["phase15:1:patch", "phase15:1:verify", "orchestrator:policy:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 15.1 Orchestration Policy Simulation & Audit ist vorbereitet.");
