const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 11.9 Governance Release Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/components/UnifiedNavigation.tsx", ["Phase 11.9", "/tool-consent", "/capability-requests", "/agent-blueprints", "/agent-registry", "/governance-audit"]) && ok;
ok = check("frontend/app/globals.css", ["Phase 11.9", "focus-visible", "governance-release-note"]) && ok;
ok = check("scripts/phase11-9-governance-release-smoke.cjs", ["Governance Release Smoke", "UI Governance Audit", "API Governance Audit"]) && ok;
ok = check("phase11-9-governance-release-polish.md", ["Phase 11.9", "Legacy Nav Cleanup", "End-to-End Smoke"]) && ok;
ok = check("docs/phase11-governance-release-polish-runbook.md", ["phase11:9:patch", "phase11:9:verify", "phase11:9:smoke"]) && ok;
ok = check("package.json", ["phase11:9:patch", "phase11:9:verify", "phase11:9:smoke", "governance:release:check"]) && ok;
const layout = read("frontend/app/layout.tsx");
if(layout){
  const legacyStillObvious = layout.includes('href="/logs"') && layout.includes('href="/analytics"') && layout.includes('href="/system"') && !layout.includes("PHASE 11.9 LEGACY_TOP_NAV_REMOVED");
  console.log((legacyStillObvious ? "WARN" : "OK  ") + " frontend/app/layout.tsx: Legacy TopNav Cleanup geprüft");
}
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.9 Governance Release Polish ist vorbereitet.");
