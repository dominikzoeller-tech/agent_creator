const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!exists(file)){ console.log("MISS " + file); return false; }
  const content=read(file); let ok=true;
  for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; }
  return ok;
}
console.log("======================================");
console.log(" Phase 11.7 Unified Navigation Verify");
console.log("======================================");
let ok=true;
ok = check("frontend/components/UnifiedNavigation.tsx", ["UnifiedNavigation", "Agent Registry", "Agent Blueprints", "Capability Requests", "aria-current"]) && ok;
ok = check("frontend/app/globals.css", ["Phase 11.7", "unified-nav", "unified-nav-link", "active"]) && ok;
const pages = [
  ["frontend/app/page.tsx", "chat"],
  ["frontend/app/tool-consent/page.tsx", "tool-consent"],
  ["frontend/app/capability-requests/page.tsx", "capability-requests"],
  ["frontend/app/agent-blueprints/page.tsx", "agent-blueprints"],
  ["frontend/app/agent-registry/page.tsx", "agent-registry"],
  ["frontend/app/analytics/page.tsx", "analytics"],
  ["frontend/app/logs/page.tsx", "logs"],
  ["frontend/app/system/page.tsx", "system"],
];
for(const [file, active] of pages){
  ok = check(file, ["UnifiedNavigation", `<UnifiedNavigation active=\"${active}\" />`]) && ok;
}
ok = check(".gitignore", ["data/"]) && ok;
ok = check("phase11-7-registry-ui-polish-unified-navigation.md", ["Phase 11.7", "UnifiedNavigation", "data/"]) && ok;
ok = check("docs/phase11-registry-ui-polish-unified-navigation-runbook.md", ["phase11:7:patch", "phase11:7:verify", "Agent Registry"]) && ok;
ok = check("package.json", ["phase11:7:patch", "phase11:7:verify", "ui:navigation:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.7 Registry UI Polish & Unified Navigation ist vorbereitet.");
