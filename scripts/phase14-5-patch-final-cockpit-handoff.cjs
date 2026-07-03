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
  pkg.scripts["phase14:5:patch"]="node scripts/phase14-5-patch-final-cockpit-handoff.cjs";
  pkg.scripts["phase14:5:verify"]="node scripts/phase14-5-verify-final-cockpit-handoff.cjs";
  pkg.scripts["cockpit:final:check"]="npm run phase14:0:verify && npm run phase14:1:verify && npm run phase14:2:verify && npm run phase14:3:verify && npm run phase14:4:verify && npm run phase14:5:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 14.5 Scripts eingetragen.");
}
function patchDocs(){
  ensureFile("phase14-5-final-cockpit-handoff-release-summary.md", `# Phase 14.5 – Final Cockpit Handoff / Release Summary

## Ziel
Phase 14.5 schließt den Cockpit-Block ab und dokumentiert den Stand für Phase 15.

## Abgeschlossene Phase-14-Kette
- Phase 14.0 – Master Agent Cockpit / Unified Control Center Foundation
- Phase 14.1 – Navigation Cleanup / Admin Mode Grouping
- Phase 14.2 – Cockpit Next Actions / Guided Flow
- Phase 14.3 – Cockpit Actions / Master-Agent Orchestration Prep
- Phase 14.4 – Cockpit Action Dashboard / Action History
- Phase 14.5 – Final Cockpit Handoff / Release Summary

## Was erreicht wurde
- Die vielen technischen Seiten wurden über /master-cockpit zusammengeführt.
- Die Hauptnavigation wurde reduziert.
- Admin-/Developer-Seiten bleiben erreichbar, aber gruppiert.
- Guided Next Actions zeigen den nächsten sinnvollen Schritt.
- Cockpit Action Plans bereiten Master-Agent-Orchestrierung vor.
- Action History macht geplante Orchestrierungs-Schritte nachvollziehbar.

## Wichtige UI-Routen
- /master-cockpit
- /cockpit-actions
- /tool-consent
- /governance-audit
- /agent-runtime-dashboard
- /tool-adapter-dashboard

## Wichtige API-Routen
- /api/cockpit-actions
- /api/agent-registry
- /api/agent-runtime
- /api/tool-adapters
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/cockpit-action-plans.jsonl
- data/governance-audit.jsonl
- data/tool-consent-requests.json
- data/controlled-agent-registry.json
- data/tool-adapter-registry.json

## Sicherheitsstand
- Keine echte Tool-Ausführung.
- Keine automatische Agent-Ausführung.
- Cockpit Actions sind nur Planungsobjekte.
- executionAllowed=false.
- toolExecutionAllowed=false.
- dryRunOnly=true.
- Consent Approval startet weiterhin keine automatische Ausführung.

## Bedienkonzept
Die technischen Zwischenseiten bleiben als Admin-/Developer-Konsolen bestehen. Der Hauptweg läuft zunehmend über:
- Master Cockpit
- Guided Next Actions
- Cockpit Action History
- Approval Center
- Audit Trail

## Nächster sinnvoller Schritt
Phase 15.0 – Master Agent Orchestrator Planning Layer

## Ziel Phase 15.0
Der Master Agent soll Cockpit Action Plans lesen und daraus sichere Orchestration Plans ableiten:
- keine echte Execution
- nur Planungs-/Routing-/Policy-Vorschläge
- klare nächste Aktion
- Audit-Fähigkeit
- Vorbereitung für spätere kontrollierte Ausführung
`);

  ensureFile("docs/phase14-final-cockpit-handoff-runbook.md", `# Runbook – Phase 14.5 Final Cockpit Handoff

## Patch
\`\`\`powershell
npm run phase14:5:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase14-5-patch-final-cockpit-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase14:5:verify
npm run cockpit:final:check
npm run build
npm run stack:health
\`\`\`

## Optional Smoke
Wenn Docker-Frontend bereits läuft:
\`\`\`powershell
npm run phase14:0:smoke
npm run phase14:1:smoke
npm run phase14:4:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final cockpit handoff"
git push origin main
git status --short
\`\`\`
`);

  ensureFile("next-chat-handoff-phase15.md", `# Übergabe für nächsten Chat – Phase 15 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance abgeschlossen. Phase 12 Runtime Foundation abgeschlossen. Phase 13 Tool Adapter Sandbox abgeschlossen. Phase 14 Cockpit / Navigation / Guided Flow abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/cockpit-actions
- http://localhost:3000/tool-consent
- http://localhost:3000/governance-audit
- http://localhost:3000/agent-runtime-dashboard
- http://localhost:3000/tool-adapter-dashboard

## Wichtige Checks
\`\`\`powershell
npm run cockpit:final:check
npm run build
npm run stack:health
\`\`\`

## Nächster Schritt
Phase 15.0 – Master Agent Orchestrator Planning Layer

## Ziel Phase 15.0
Cockpit Action Plans sollen vom Master Agent Orchestrator gelesen und in sichere Orchestration Plans überführt werden.

## Leitplanken
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- nur Planungsobjekte
- executionAllowed=false
- toolExecutionAllowed=false
- dryRunOnly=true
- klare Audit-/Policy-Vorbereitung

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11, 12, 13 und 14 sind abgeschlossen. Ziel jetzt: Phase 15.0 – Master Agent Orchestrator Planning Layer. Bitte Cockpit Action Plans einlesen und sichere Orchestration Plans vorbereiten. Keine echte Ausführung, keine automatische Tool- oder Agent-Ausführung.
`);
}
patchPackage();
patchDocs();
console.log("Phase 14.5 Patch abgeschlossen.");
