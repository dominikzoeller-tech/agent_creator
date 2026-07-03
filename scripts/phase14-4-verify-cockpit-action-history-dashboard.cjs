const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 14.4 Cockpit Action History Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/app/cockpit-actions/page.tsx", ["Cockpit Action History", "Action Plans", "executionAllowed", "toolExecutionAllowed", "dryRunOnly"]) && ok;
ok = check("frontend/app/master-cockpit/page.tsx", ["/cockpit-actions", "Cockpit Action History öffnen"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/cockpit-actions", "Actions", "cockpit-actions"]) && ok;
ok = check("scripts/phase14-4-cockpit-action-history-smoke.cjs", ["Phase 14.4 Cockpit Action History Smoke", "UI Cockpit Actions", "API Cockpit Actions"]) && ok;
ok = check("phase14-4-cockpit-action-history-dashboard.md", ["Phase 14.4", "Action History", "Phase 14.5", "toolExecutionAllowed=false"]) && ok;
ok = check("docs/phase14-cockpit-action-history-dashboard-runbook.md", ["phase14:4:patch", "phase14:4:verify", "phase14:4:smoke", "/cockpit-actions"]) && ok;
ok = check("package.json", ["phase14:4:patch", "phase14:4:verify", "phase14:4:smoke", "cockpit:history:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 14.4 Cockpit Action Dashboard / Action History ist vorbereitet.");
