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
  pkg.scripts["phase14:1:patch"]="node scripts/phase14-1-patch-navigation-cleanup-admin-mode.cjs";
  pkg.scripts["phase14:1:verify"]="node scripts/phase14-1-verify-navigation-cleanup-admin-mode.cjs";
  pkg.scripts["phase14:1:smoke"]="node scripts/phase14-1-navigation-cleanup-smoke.cjs";
  pkg.scripts["navigation:cleanup:verify"]="node scripts/phase14-1-verify-navigation-cleanup-admin-mode.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 14.1 Scripts eingetragen.");
}
const unifiedNavigation = String.raw`"use client";

type NavItem = {
  href: string;
  label: string;
  key: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// Phase 14.1 – Navigation Cleanup / Admin Mode Grouping
// Ziel: wenige primäre Links, technische Seiten gruppiert im Admin/Developer Bereich.
const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/master-cockpit", label: "Master Cockpit", key: "master-cockpit" },
  { href: "/", label: "Chat", key: "chat" },
  { href: "/tool-consent", label: "Approvals", key: "tool-consent" },
  { href: "/governance-audit", label: "Audit", key: "governance-audit" },
];

const ADMIN_GROUPS: NavGroup[] = [
  {
    title: "Governance",
    items: [
      { href: "/capability-requests", label: "Capability Requests", key: "capability-requests" },
      { href: "/agent-blueprints", label: "Agent Blueprints", key: "agent-blueprints" },
      { href: "/agent-registry", label: "Agent Registry", key: "agent-registry" },
      { href: "/tool-permissions", label: "Tool Permissions", key: "tool-permissions" },
      { href: "/tool-preflight", label: "Tool Preflight", key: "tool-preflight" },
    ],
  },
  {
    title: "Runtime",
    items: [
      { href: "/agent-runtime-dashboard", label: "Runtime Dashboard", key: "agent-runtime-dashboard" },
      { href: "/agent-runtime", label: "Agent Runtime", key: "agent-runtime" },
      { href: "/agent-runtime-consent", label: "Runtime Consent", key: "agent-runtime-consent" },
      { href: "/agent-runtime-resume", label: "Runtime Resume", key: "agent-runtime-resume" },
      { href: "/agent-runtime-policy", label: "Runtime Policy", key: "agent-runtime-policy" },
    ],
  },
  {
    title: "Tool Adapter",
    items: [
      { href: "/tool-adapter-dashboard", label: "Tool Dashboard", key: "tool-adapter-dashboard" },
      { href: "/tool-sandbox", label: "Tool Sandbox", key: "tool-sandbox" },
      { href: "/tool-adapter-consent", label: "Tool Consent Binding", key: "tool-adapter-consent" },
      { href: "/tool-adapter-resume", label: "Tool Resume", key: "tool-adapter-resume" },
      { href: "/tool-adapter-policy", label: "Tool Policy", key: "tool-adapter-policy" },
    ],
  },
  {
    title: "System & Knowledge",
    items: [
      { href: "/analytics", label: "Analytics", key: "analytics" },
      { href: "/logs", label: "Logs", key: "logs" },
      { href: "/system", label: "System", key: "system" },
      { href: "/knowledge", label: "Knowledge", key: "knowledge" },
      { href: "/knowledge-quality", label: "Knowledge Quality", key: "knowledge-quality" },
      { href: "/memory", label: "Memory", key: "memory" },
      { href: "/memory-quality", label: "Memory Quality", key: "memory-quality" },
      { href: "/memory-sessions", label: "Memory Sessions", key: "memory-sessions" },
    ],
  },
  {
    title: "Web Research",
    items: [
      { href: "/web-research", label: "Web Research", key: "web-research" },
      { href: "/web-research-governance", label: "Web Governance", key: "web-research-governance" },
      { href: "/web-research-save", label: "Web Save", key: "web-research-save" },
      { href: "/web-research-settings", label: "Web Settings", key: "web-research-settings" },
      { href: "/tools", label: "Tools", key: "tools" },
    ],
  },
];

function isGroupActive(group: NavGroup, active?: string): boolean {
  return group.items.some((item) => item.key === active);
}

export function UnifiedNavigation({ active }: { active?: string }) {
  const primaryActive = PRIMARY_NAV_ITEMS.some((item) => item.key === active);
  return (
    <nav className="unified-nav phase14-nav" aria-label="Main navigation">
      <div className="phase14-primary-nav" aria-label="Primary navigation">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const isActive = active === item.key || (!primaryActive && item.key === "master-cockpit" && !active);
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
      </div>
      <details className="phase14-admin-nav">
        <summary>Admin / Developer</summary>
        <div className="phase14-admin-grid">
          {ADMIN_GROUPS.map((group) => (
            <section className={isGroupActive(group, active) ? "phase14-nav-group active" : "phase14-nav-group"} key={group.title}>
              <h3>{group.title}</h3>
              <div className="phase14-nav-group-links">
                {group.items.map((item) => {
                  const isActive = active === item.key;
                  return (
                    <a
                      key={item.key}
                      className={isActive ? "phase14-mini-link active" : "phase14-mini-link"}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </details>
    </nav>
  );
}
`;
const cssAppend = String.raw`

/* Phase 14.1 – Navigation Cleanup / Admin Mode Grouping */
.phase14-nav {
  display: block;
  max-width: 1180px;
  margin-left: auto;
  margin-right: auto;
}
.phase14-primary-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.phase14-admin-nav {
  margin-top: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  padding: 8px 10px;
}
.phase14-admin-nav summary {
  cursor: pointer;
  font-weight: 750;
  color: #334155;
  user-select: none;
}
.phase14-admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
  margin-top: 12px;
}
.phase14-nav-group {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: white;
  padding: 10px;
}
.phase14-nav-group.active {
  border-color: #2563eb;
  background: #eff6ff;
}
.phase14-nav-group h3 {
  margin: 0 0 8px;
  font-size: 0.95rem;
}
.phase14-nav-group-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.phase14-mini-link {
  color: #334155;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 5px 7px;
  border-radius: 10px;
}
.phase14-mini-link:hover,
.phase14-mini-link.active {
  background: #dbeafe;
  color: #1d4ed8;
}
`;
function patchCss(){
  const file="frontend/app/globals.css";
  if(!exists(file)) return console.log("SKIP globals.css fehlt.");
  let content=read(file);
  if(!content.includes("Phase 14.1 – Navigation Cleanup")){
    content += cssAppend;
    write(file, content);
    console.log("OK globals.css: Phase 14.1 CSS ergänzt.");
  } else console.log("SKIP globals.css: Phase 14.1 CSS bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase14-1-navigation-cleanup-admin-mode.md", `# Phase 14.1 – Navigation Cleanup / Admin Mode Grouping

## Ziel
Die stark gewachsene Navigation wird auf wenige primäre Links reduziert. Technische Governance-, Runtime-, Tool-Adapter-, System- und Web-Research-Seiten werden im Bereich Admin / Developer gruppiert.

## Primäre Navigation
- Master Cockpit
- Chat
- Approvals
- Audit

## Admin / Developer Gruppen
- Governance
- Runtime
- Tool Adapter
- System & Knowledge
- Web Research

## Warum
Die vielen Seiten bleiben für Debugging, Audit und Admin-Aufgaben erreichbar, sind aber nicht mehr alle als gleichrangige Hauptnavigation sichtbar. Das ist der erste echte UI-Aufräumschritt Richtung Master Agent Cockpit.

## Sicherheitsprinzip
Diese Phase verändert keine Runtime- oder Tool-Execution-Logik. Weiterhin gilt: keine echte Tool-Ausführung, toolExecutionAllowed=false und dryRunOnly=true.

## Nächster Schritt
Phase 14.2 kann Cockpit Next Actions / Guided Flow ergänzen.
`);
  ensureFile("docs/phase14-navigation-cleanup-admin-mode-runbook.md", `# Runbook – Phase 14.1 Navigation Cleanup / Admin Mode Grouping

## Patch
\`\`\`powershell
npm run phase14:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase14-1-patch-navigation-cleanup-admin-mode.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase14:1:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase14:1:smoke
\`\`\`

## Manuelle Prüfung
1. /master-cockpit öffnen.
2. Prüfen, dass primär nur Master Cockpit, Chat, Approvals und Audit sichtbar sind.
3. Admin / Developer öffnen.
4. Gruppen Governance, Runtime, Tool Adapter, System & Knowledge und Web Research prüfen.
5. Prüfen, dass technische Seiten weiterhin erreichbar sind.
`);
}
const smoke = String.raw`const endpoints = [
  ["UI Master Cockpit", "http://localhost:3000/master-cockpit"],
  ["UI Chat", "http://localhost:3000/"],
  ["UI Approvals", "http://localhost:3000/tool-consent"],
  ["UI Audit", "http://localhost:3000/governance-audit"],
  ["UI Agent Registry", "http://localhost:3000/agent-registry"],
  ["UI Runtime Dashboard", "http://localhost:3000/agent-runtime-dashboard"],
  ["UI Tool Dashboard", "http://localhost:3000/tool-adapter-dashboard"],
  ["API Health", "http://localhost:7071/health"],
];
async function main(){
  console.log("======================================");
  console.log(" Phase 14.1 Navigation Cleanup Smoke");
  console.log("======================================");
  let ok=true;
  for(const [label,url] of endpoints){
    try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }
    catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; }
  }
  if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); }
  console.log("Smoke OK. Navigation Cleanup URLs sind erreichbar.");
}
main();
`;
patchPackage();
write("frontend/components/UnifiedNavigation.tsx", unifiedNavigation);
patchCss();
ensureFile("scripts/phase14-1-navigation-cleanup-smoke.cjs", smoke);
patchDocs();
console.log("Phase 14.1 Patch abgeschlossen.");
