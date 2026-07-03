const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 14.2 Cockpit Guided Flow Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/app/master-cockpit/page.tsx", ["Guided Next Actions", "phase14-guided-flow", "Weiter:", "Capability Requests", "toolExecutionAllowed", "dryRunOnly"]) && ok;
ok = check("frontend/app/globals.css", ["Phase 14.2", "phase14-guided-flow", "phase14-guided-step"]) && ok;
ok = check("phase14-2-cockpit-next-actions-guided-flow.md", ["Phase 14.2", "Guided Next Actions", "Phase 14.3", "toolExecutionAllowed=false"]) && ok;
ok = check("docs/phase14-cockpit-next-actions-guided-flow-runbook.md", ["phase14:2:patch", "phase14:2:verify", "Schneller Check ohne Docker-Neustart", "/master-cockpit"]) && ok;
ok = check("package.json", ["phase14:2:patch", "phase14:2:verify", "cockpit:guided:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 14.2 Cockpit Next Actions / Guided Flow ist vorbereitet.");
