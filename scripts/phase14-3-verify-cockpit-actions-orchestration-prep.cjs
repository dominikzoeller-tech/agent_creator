const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 14.3 Cockpit Actions Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/cockpit-action-store.ts", ["createCockpitActionPlan", "executionAllowed: false", "toolExecutionAllowed: false", "dryRunOnly: true", "cockpit-action-plans.jsonl"]) && ok;
ok = check("frontend/app/api/cockpit-actions/route.ts", ["createCockpitActionPlan", "GET", "POST", "Ungültiger actionType"]) && ok;
ok = check("frontend/app/master-cockpit/page.tsx", ["Cockpit Actions / Orchestration Prep", "createActionPlan", "Planen", "Cockpit Action geplant"]) && ok;
ok = check("phase14-3-cockpit-actions-orchestration-prep.md", ["Phase 14.3", "Cockpit Action Plans", "Phase 14.4", "toolExecutionAllowed=false"]) && ok;
ok = check("docs/phase14-cockpit-actions-orchestration-prep-runbook.md", ["phase14:3:patch", "phase14:3:verify", "/api/cockpit-actions"]) && ok;
ok = check("package.json", ["phase14:3:patch", "phase14:3:verify", "cockpit:actions:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 14.3 Cockpit Actions / Orchestration Prep ist vorbereitet.");
