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
  pkg.scripts["phase11:7:patch"]="node scripts/phase11-7-patch-registry-ui-polish-unified-navigation.cjs";
  pkg.scripts["phase11:7:verify"]="node scripts/phase11-7-verify-registry-ui-polish-unified-navigation.cjs";
  pkg.scripts["ui:navigation:verify"]="node scripts/phase11-7-verify-registry-ui-polish-unified-navigation.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 11.7 Scripts eingetragen.");
}
const navComponent = `"use client";

type NavItem = {
  href: string;
  label: string;
  key: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Chat", key: "chat" },
  { href: "/tool-consent", label: "Tool Consent", key: "tool-consent" },
  { href: "/capability-requests", label: "Capability Requests", key: "capability-requests" },
  { href: "/agent-blueprints", label: "Agent Blueprints", key: "agent-blueprints" },
  { href: "/agent-registry", label: "Agent Registry", key: "agent-registry" },
  { href: "/analytics", label: "Analytics", key: "analytics" },
  { href: "/logs", label: "Logs", key: "logs" },
  { href: "/system", label: "System", key: "system" },
];

export function UnifiedNavigation({ active }: { active?: string }) {
  return (
    <nav className="unified-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.key;
        return (
          <a
            key={item.key}
            className={isActive ? "unified-nav-link active" : "unified-nav-link"}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
`;
const cssAppend = `

/* Phase 11.7 – Unified Navigation Polish */
.unified-nav {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 0 0 22px;
  padding: 10px 0;
  align-items: center;
}
.unified-nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 7px 13px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: #ffffff;
  color: #0f172a;
  text-decoration: none;
  font-weight: 650;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}
.unified-nav-link:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}
.unified-nav-link.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}
.phase11-card-grid {
  display: grid;
  gap: 18px;
}
.phase11-form-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.phase11-form-row input,
.phase11-form-row textarea {
  min-width: 220px;
}
`;
function patchGlobalCss(){
  const candidates=["frontend/app/globals.css", "frontend/app/global.css"];
  const file=candidates.find(exists);
  if(!file){ console.log("SKIP CSS: keine globals.css gefunden."); return; }
  let content=read(file);
  if(!content.includes("Phase 11.7 – Unified Navigation Polish")){
    content += cssAppend;
    write(file, content);
    console.log("OK " + file + ": Unified Navigation CSS ergänzt.");
  } else console.log("SKIP " + file + ": Unified Navigation CSS bereits vorhanden.");
}
function ensureImport(content, importLine){
  if(content.includes(importLine)) return content;
  const lines=content.split(/\r?\n/);
  let last=-1;
  for(let i=0;i<lines.length;i++) if(lines[i].startsWith("import ")) last=i;
  if(last>=0){ lines.splice(last+1,0,importLine); return lines.join("\n"); }
  return importLine + "\n" + content;
}
function removeInlineNavs(content){
  // Entfernt einfache inline nav-Blöcke, die in den Phasen 11.1-11.6 mehrfach entstanden sind.
  let next=content;
  let prev="";
  const navRegex=/<nav\s+style=\{\{[\s\S]*?\}\}>[\s\S]*?<\/nav>\s*/g;
  while(prev!==next){ prev=next; next=next.replace(navRegex, ""); }
  return next;
}
function patchPage(file, importLine, activeKey){
  if(!exists(file)){ console.log("SKIP " + file + ": nicht gefunden."); return; }
  let content=read(file);
  const original=content;
  content=ensureImport(content, importLine);
  content=removeInlineNavs(content);
  if(!content.includes("<UnifiedNavigation active=\"" + activeKey + "\" />")){
    content=content.replace(/<main className="page-wrap">\s*/, '<main className="page-wrap">\n      <UnifiedNavigation active="' + activeKey + '" />\n      ');
  }
  if(content!==original){ write(file, content); console.log("OK " + file + ": UnifiedNavigation eingesetzt."); }
  else console.log("SKIP " + file + ": bereits vorbereitet.");
}
function patchGitignoreSafe(){
  const file=".gitignore";
  let content=exists(file) ? read(file) : "";
  const lines=content.split(/\r?\n/);
  if(!lines.includes("data/")){
    content = content.replace(/\s*$/, "\n") + "# Runtime stores for consent/capability/agent registry data\ndata/\n";
    write(file, content);
    console.log("OK .gitignore: data/ ergänzt.");
  } else console.log("SKIP .gitignore: data/ bereits ignoriert.");
}
function patchDocs(){
  ensureFile("phase11-7-registry-ui-polish-unified-navigation.md", `# Phase 11.7 – Registry UI Polish & Unified Navigation

## Ziel
Die neuen Governance-Seiten aus Phase 11.4 bis 11.6 nutzen eine einheitliche Navigation. Doppelte Inline-Navigationen werden entfernt und durch eine zentrale \`UnifiedNavigation\` Komponente ersetzt.

## Änderungen
- Neue Komponente: \`frontend/components/UnifiedNavigation.tsx\`
- Einheitliche Navigation auf Chat, Tool Consent, Capability Requests, Agent Blueprints, Agent Registry, Analytics, Logs und System
- CSS-Polish für Navigation Pills
- \`data/\` wird als Runtime Store in \`.gitignore\` ignoriert

## Hinweis
Diese Phase erweitert keine Agent Runtime. Es ist eine UI-/Navigation-/Polish-Phase.
`);
  ensureFile("docs/phase11-registry-ui-polish-unified-navigation-runbook.md", `# Runbook – Phase 11.7 Registry UI Polish & Unified Navigation

## Patch
\`\`\`powershell
npm run phase11:7:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase11-7-patch-registry-ui-polish-unified-navigation.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase11:7:verify
npm run build
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. http://localhost:3000 öffnen.
2. Prüfen, dass nur eine einheitliche Navigation sichtbar ist.
3. Links prüfen: Tool Consent, Capability Requests, Agent Blueprints, Agent Registry, Analytics, Logs, System.
4. Prüfen, dass aktive Seite optisch markiert ist.
`);
}
patchPackage();
ensureFile("frontend/components/UnifiedNavigation.tsx", navComponent);
patchGlobalCss();
patchPage("frontend/app/page.tsx", 'import { UnifiedNavigation } from "../components/UnifiedNavigation";', "chat");
patchPage("frontend/app/tool-consent/page.tsx", 'import { UnifiedNavigation } from "../../components/UnifiedNavigation";', "tool-consent");
patchPage("frontend/app/capability-requests/page.tsx", 'import { UnifiedNavigation } from "../../components/UnifiedNavigation";', "capability-requests");
patchPage("frontend/app/agent-blueprints/page.tsx", 'import { UnifiedNavigation } from "../../components/UnifiedNavigation";', "agent-blueprints");
patchPage("frontend/app/agent-registry/page.tsx", 'import { UnifiedNavigation } from "../../components/UnifiedNavigation";', "agent-registry");
patchPage("frontend/app/analytics/page.tsx", 'import { UnifiedNavigation } from "../../components/UnifiedNavigation";', "analytics");
patchPage("frontend/app/logs/page.tsx", 'import { UnifiedNavigation } from "../../components/UnifiedNavigation";', "logs");
patchPage("frontend/app/system/page.tsx", 'import { UnifiedNavigation } from "../../components/UnifiedNavigation";', "system");
patchGitignoreSafe();
patchDocs();
console.log("Phase 11.7 Patch abgeschlossen.");
