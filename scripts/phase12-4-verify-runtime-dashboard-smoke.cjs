const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 12.4 Runtime Dashboard Smoke Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/app/agent-runtime-dashboard/page.tsx", ["Runtime Dashboard", "Runtime Übersicht", "Safety Invariants", "toolExecutionAllowed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/agent-runtime-dashboard", "Runtime Dashboard", "agent-runtime-dashboard"]) && ok;
ok = check("scripts/phase12-4-runtime-dashboard-smoke.cjs", ["Phase 12.4 Runtime Dashboard Smoke", "UI Runtime Dashboard", "API Runtime Policy"]) && ok;
ok = check("phase12-4-runtime-dashboard-smoke.md", ["Phase 12.4", "Runtime Dashboard", "Phase 12.5"]) && ok;
ok = check("docs/phase12-runtime-dashboard-smoke-runbook.md", ["phase12:4:patch", "phase12:4:verify", "phase12:4:smoke"]) && ok;
ok = check("package.json", ["phase12:4:patch", "phase12:4:verify", "phase12:4:smoke", "runtime:release:check"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 12.4 Runtime Dashboard & Smoke ist vorbereitet.");
