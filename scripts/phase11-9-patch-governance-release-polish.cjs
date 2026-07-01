const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensureFile(file, content){ if(!exists(file)){ write(file, content); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase11:9:patch"]="node scripts/phase11-9-patch-governance-release-polish.cjs";
  pkg.scripts["phase11:9:verify"]="node scripts/phase11-9-verify-governance-release-polish.cjs";
  pkg.scripts["phase11:9:smoke"]="node scripts/phase11-9-governance-release-smoke.cjs";
  pkg.scripts["governance:release:check"]="npm run phase11:9:verify && npm run phase11:9:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 11.9 Scripts eingetragen.");
}
function patchLayout(){
  const candidates=["frontend/app/layout.tsx", "frontend/app/layout.jsx"];
  const file=candidates.find(exists);
  if(!file){ console.log("SKIP layout: keine layout.tsx/jsx gefunden."); return; }
  let content=read(file); const original=content;
  // Entfernt eine einfache Legacy-Topnav mit nur Chat/Logs/Analytics/System, falls im Layout vorhanden.
  // Die neue UnifiedNavigation bleibt auf den Seiten selbst erhalten.
  const legacyNavRegex=/<nav[^>]*>[\s\S]*?href="\/"[\s\S]*?href="\/logs"[\s\S]*?href="\/analytics"[\s\S]*?href="\/system"[\s\S]*?<\/nav>\s*/m;
  if(legacyNavRegex.test(content) && !content.includes("PHASE 11.9 LEGACY_TOP_NAV_REMOVED")){
    content=content.replace(legacyNavRegex, "{/* PHASE 11.9 LEGACY_TOP_NAV_REMOVED: UnifiedNavigation is now rendered per page. */}\n");
  }
  if(content!==original){ write(file, content); console.log("OK " + file + ": Legacy Top Navigation entfernt."); }
  else console.log("SKIP " + file + ": keine entfernbare Legacy Top Navigation gefunden.");
}
function patchUnifiedNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)){ console.log("SKIP UnifiedNavigation fehlt; Phase 11.7 zuerst anwenden."); return; }
  let content=read(file); const original=content;
  if(!content.includes("Phase 11.9")){
    content=content.replace("const NAV_ITEMS: NavItem[] = [", "// Phase 11.9 release navigation: single source for governance routes.\nconst NAV_ITEMS: NavItem[] = [");
  }
  const required = [
    ['{ href: "/tool-consent", label: "Tool Consent", key: "tool-consent" },', '/tool-consent'],
    ['{ href: "/capability-requests", label: "Capability Requests", key: "capability-requests" },', '/capability-requests'],
    ['{ href: "/agent-blueprints", label: "Agent Blueprints", key: "agent-blueprints" },', '/agent-blueprints'],
    ['{ href: "/agent-registry", label: "Agent Registry", key: "agent-registry" },', '/agent-registry'],
    ['{ href: "/governance-audit", label: "Audit Trail", key: "governance-audit" },', '/governance-audit'],
  ];
  for(const [line, href] of required){
    if(!content.includes(href)){
      content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', '  '+line+'\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
    }
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Release-Kommentar/Links geprüft."); }
  else console.log("SKIP UnifiedNavigation: bereits release-ready.");
}
function patchCss(){
  const file="frontend/app/globals.css";
  if(!exists(file)){ console.log("SKIP globals.css nicht gefunden."); return; }
  let content=read(file); const original=content;
  if(!content.includes("Phase 11.9 – Governance Release Polish")){
    content += `\n\n/* Phase 11.9 – Governance Release Polish */\n.unified-nav {\n  max-width: 1180px;\n  margin-left: auto;\n  margin-right: auto;\n}\n.unified-nav-link:focus-visible {\n  outline: 3px solid rgba(37, 99, 235, 0.35);\n  outline-offset: 2px;\n}\n.governance-release-note {\n  font-size: 0.92rem;\n  color: #475569;\n}\n`;
  }
  if(content!==original){ write(file, content); console.log("OK globals.css: Release Polish ergänzt."); }
  else console.log("SKIP globals.css: Release Polish bereits vorhanden.");
}
const smokeScript = String.raw`const endpoints = [
  ["UI Chat", "http://localhost:3000/"],
  ["UI Tool Consent", "http://localhost:3000/tool-consent"],
  ["UI Capability Requests", "http://localhost:3000/capability-requests"],
  ["UI Agent Blueprints", "http://localhost:3000/agent-blueprints"],
  ["UI Agent Registry", "http://localhost:3000/agent-registry"],
  ["UI Governance Audit", "http://localhost:3000/governance-audit"],
  ["API Health", "http://localhost:7071/health"],
  ["API Tool Consent", "http://localhost:3000/api/tool-consent"],
  ["API Capability Requests", "http://localhost:3000/api/capability-requests"],
  ["API Agent Blueprints", "http://localhost:3000/api/agent-blueprints"],
  ["API Agent Registry", "http://localhost:3000/api/agent-registry"],
  ["API Governance Audit", "http://localhost:3000/api/governance-audit"],
];
async function main(){
  console.log("======================================");
  console.log(" Phase 11.9 Governance Release Smoke");
  console.log("======================================");
  let ok=true;
  for(const [label, url] of endpoints){
    try{
      const res = await fetch(url, { cache: "no-store" });
      const good = res.status >= 200 && res.status < 400;
      console.log((good ? "OK  " : "MISS") + " " + label + ": " + res.status + " " + url);
      if(!good) ok=false;
    } catch(error){
      console.log("MISS " + label + ": " + url);
      console.log(error instanceof Error ? error.message : String(error));
      ok=false;
    }
  }
  if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); }
  console.log("Smoke OK. Governance Release URLs sind erreichbar.");
}
main();
`;
function patchDocs(){
  ensureFile("phase11-9-governance-release-polish.md", `# Phase 11.9 – Governance Release Polish / Legacy Nav Cleanup / End-to-End Smoke

## Ziel
Phase 11.9 schließt den Governance-Block ab: Legacy-Top-Navigation wird bereinigt, UnifiedNavigation bleibt die zentrale Navigation, und ein End-to-End Smoke-Test prüft alle Governance-URLs.

## Enthalten
- Legacy Nav Cleanup im Layout, falls vorhanden
- UnifiedNavigation Release-Kommentar und Link-Sanity
- CSS Accessiblity/Focus Polish
- End-to-End Smoke Script für UI/API Routen
- Release Runbook

## Governance Routes
- /tool-consent
- /capability-requests
- /agent-blueprints
- /agent-registry
- /governance-audit

## Hinweis
Diese Phase aktiviert keine Agent Runtime. Es ist eine Release-Polish- und Smoke-Test-Phase.
`);
  ensureFile("docs/phase11-governance-release-polish-runbook.md", `# Runbook – Phase 11.9 Governance Release Polish

## Patch
\`\`\`powershell
npm run phase11:9:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase11-9-patch-governance-release-polish.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase11:9:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase11:9:smoke
\`\`\`

## Manuelle Prüfung
1. Browser öffnen: http://localhost:3000
2. Prüfen, dass keine doppelte Legacy-Navigation mehr sichtbar ist.
3. Diese Seiten öffnen:
   - /tool-consent
   - /capability-requests
   - /agent-blueprints
   - /agent-registry
   - /governance-audit
4. Smoke Script muss alle UI/API Routen mit OK melden.

## Commit
\`\`\`powershell
git add .
git commit -m "chore: polish governance release"
git push origin main
\`\`\`
`);
}
patchPackage();
patchLayout();
patchUnifiedNavigation();
patchCss();
ensureFile("scripts/phase11-9-governance-release-smoke.cjs", smokeScript);
patchDocs();
console.log("Phase 11.9 Patch abgeschlossen.");
