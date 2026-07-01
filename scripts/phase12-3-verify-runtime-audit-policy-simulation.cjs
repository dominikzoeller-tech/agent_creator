const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 12.3 Runtime Policy Simulation Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/agent-runtime-policy-simulation-store.ts", ["simulateRuntimePolicy", "appendGovernanceAuditEvent", "toolExecutionAllowed: false", "dryRunOnly: true"]) && ok;
ok = check("frontend/app/api/agent-runtime-policy/route.ts", ["simulateRuntimePolicy", "GET", "POST"]) && ok;
ok = check("frontend/app/agent-runtime-policy/page.tsx", ["Runtime Policy Simulation", "Runtime Policy simulieren", "toolExecutionAllowed", "dryRunOnly"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/agent-runtime-policy", "Runtime Policy", "agent-runtime-policy"]) && ok;
ok = check("phase12-3-runtime-audit-policy-simulation.md", ["Phase 12.3", "Policy Simulation", "Phase 12.4"]) && ok;
ok = check("docs/phase12-runtime-audit-policy-simulation-runbook.md", ["phase12:3:patch", "phase12:3:verify", "/agent-runtime-policy"]) && ok;
ok = check("package.json", ["phase12:3:patch", "phase12:3:verify", "agents:runtime:policy:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 12.3 Runtime Audit Integration & Policy Simulation ist vorbereitet.");
