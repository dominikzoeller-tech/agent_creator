const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 14.0 Master Cockpit Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/app/master-cockpit/page.tsx", ["Master Agent Cockpit", "Unified Control Center", "Next Actions", "Safety Invariants", "toolExecutionAllowed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/master-cockpit", "Master Cockpit", "master-cockpit"]) && ok;
ok = check("scripts/phase14-0-master-cockpit-smoke.cjs", ["Phase 14.0 Master Cockpit Smoke", "UI Master Cockpit", "API Tool Adapters"]) && ok;
ok = check("phase14-0-master-agent-cockpit.md", ["Phase 14.0", "Master Agent Cockpit", "Phase 14.1", "keine echte Tool-Ausführung"]) && ok;
ok = check("docs/phase14-master-agent-cockpit-runbook.md", ["phase14:0:patch", "phase14:0:verify", "phase14:0:smoke", "/master-cockpit"]) && ok;
ok = check("package.json", ["phase14:0:patch", "phase14:0:verify", "phase14:0:smoke", "cockpit:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 14.0 Master Agent Cockpit ist vorbereitet.");
