const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 13.3 Tool Adapter Policy Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/tool-adapter-policy-simulation-store.ts", ["simulateToolAdapterPolicy", "appendGovernanceAuditEvent", "toolExecutionAllowed: false", "dryRunOnly: true"]) && ok;
ok = check("frontend/app/api/tool-adapter-policy/route.ts", ["simulateToolAdapterPolicy", "GET", "POST"]) && ok;
ok = check("frontend/app/tool-adapter-policy/page.tsx", ["Tool Adapter Policy Simulation", "Tool Adapter Policy simulieren", "toolExecutionAllowed", "dryRunOnly"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/tool-adapter-policy", "Tool Policy", "tool-adapter-policy"]) && ok;
ok = check("phase13-3-tool-adapter-policy-simulation-audit.md", ["Phase 13.3", "Policy Simulation", "Phase 13.4"]) && ok;
ok = check("docs/phase13-tool-adapter-policy-simulation-audit-runbook.md", ["phase13:3:patch", "phase13:3:verify", "/tool-adapter-policy"]) && ok;
ok = check("package.json", ["phase13:3:patch", "phase13:3:verify", "tools:adapter:policy:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 13.3 Tool Adapter Policy Simulation & Audit ist vorbereitet.");
