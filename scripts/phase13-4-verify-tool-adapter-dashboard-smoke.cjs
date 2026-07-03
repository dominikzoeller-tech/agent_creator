const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 13.4 Tool Adapter Dashboard Smoke Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/app/tool-adapter-dashboard/page.tsx", ["Tool Adapter Dashboard", "Tool Adapter Übersicht", "Safety Invariants", "toolExecutionAllowed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/tool-adapter-dashboard", "Tool Dashboard", "tool-adapter-dashboard"]) && ok;
ok = check("scripts/phase13-4-tool-adapter-smoke.cjs", ["Phase 13.4 Tool Adapter Dashboard Smoke", "UI Tool Adapter Dashboard", "API Tool Adapter Policy"]) && ok;
ok = check("phase13-4-tool-adapter-dashboard-smoke.md", ["Phase 13.4", "Tool Adapter Dashboard", "Phase 13.5"]) && ok;
ok = check("docs/phase13-tool-adapter-dashboard-smoke-runbook.md", ["phase13:4:patch", "phase13:4:verify", "phase13:4:smoke"]) && ok;
ok = check("package.json", ["phase13:4:patch", "phase13:4:verify", "phase13:4:smoke", "tool-adapter:release:check"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 13.4 Tool Adapter Dashboard & Smoke ist vorbereitet.");
