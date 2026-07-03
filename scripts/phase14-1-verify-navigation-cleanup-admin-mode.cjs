const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 14.1 Navigation Cleanup Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/components/UnifiedNavigation.tsx", ["Phase 14.1", "PRIMARY_NAV_ITEMS", "ADMIN_GROUPS", "Admin / Developer", "Master Cockpit", "Tool Adapter", "System & Knowledge"]) && ok;
ok = check("frontend/app/globals.css", ["Phase 14.1", "phase14-admin-nav", "phase14-admin-grid", "phase14-mini-link"]) && ok;
ok = check("scripts/phase14-1-navigation-cleanup-smoke.cjs", ["Phase 14.1 Navigation Cleanup Smoke", "UI Master Cockpit", "UI Runtime Dashboard"]) && ok;
ok = check("phase14-1-navigation-cleanup-admin-mode.md", ["Phase 14.1", "Admin / Developer", "Phase 14.2", "toolExecutionAllowed=false"]) && ok;
ok = check("docs/phase14-navigation-cleanup-admin-mode-runbook.md", ["phase14:1:patch", "phase14:1:verify", "phase14:1:smoke", "/master-cockpit"]) && ok;
ok = check("package.json", ["phase14:1:patch", "phase14:1:verify", "phase14:1:smoke", "navigation:cleanup:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 14.1 Navigation Cleanup / Admin Mode Grouping ist vorbereitet.");
