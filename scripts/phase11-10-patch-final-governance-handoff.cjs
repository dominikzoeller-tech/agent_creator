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
  pkg.scripts["phase11:10:patch"]="node scripts/phase11-10-patch-final-governance-handoff.cjs";
  pkg.scripts["phase11:10:verify"]="node scripts/phase11-10-verify-final-governance-handoff.cjs";
  pkg.scripts["governance:final:check"]="npm run phase11:7:verify && npm run phase11:8:verify && npm run phase11:9:verify && npm run phase11:9:smoke && npm run phase11:10:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 11.10 Scripts eingetragen.");
}
function patchDocs(){
  ensureFile("phase11-10-final-governance-handoff-release-summary.md", `# Phase 11.10 – Final Governance Handoff / Release Summary

## Ziel
Phase 11.10 schließt den Phase-11-Governance-Block ab und dokumentiert den aktuellen Übergabestand für den nächsten Arbeitsabschnitt.

## Abgeschlossene Governance-Kette
- Phase 11.2 – Consent Request Integration in Agent Flow
- Phase 11.3 – Consent Resume / Approved Tool Execution
- Phase 11.4 – Missing Tool / Capability Request Flow
- Phase 11.5 – Agent Blueprint Proposal
- Phase 11.6 – Controlled Agent Registry Activation
- Phase 11.7 – Registry UI Polish & Unified Navigation
- Phase 11.8 – Agent Registry Analytics & Audit Trail
- Phase 11.9 – Governance Release Polish / Legacy Nav Cleanup / End-to-End Smoke

## Wichtige UI-Routen
- /tool-consent
- /capability-requests
- /agent-blueprints
- /agent-registry
- /governance-audit
- /analytics
- /system

## Wichtige API-Routen
- /api/tool-consent
- /api/capability-requests
- /api/agent-blueprints
- /api/agent-registry
- /api/governance-audit
- /v1/ask
- /health

## Wichtige Store-Dateien / Runtime-Daten
Runtime-Daten liegen unter \`data/\` und sind durch \`.gitignore\` bewusst nicht für den Commit vorgesehen.

Typische Runtime-Dateien:
- data/tool-consent-requests.json
- data/tool-capability-requests.json
- data/agent-blueprint-proposals.json
- data/controlled-agent-registry.json
- data/governance-audit.jsonl

## Aktueller Sicherheitsstand
- hardBlocked bleibt hart blockierend.
- consentRequired erzeugt kontrollierte Consent Requests.
- Approved Consent kann den Agent Flow wieder aufnehmen.
- Fehlende Fähigkeiten erzeugen nur Capability Requests.
- Agent Blueprints sind nur Vorschläge.
- Agent Registry startet kontrolliert im Test Mode.
- Governance Audit protokolliert relevante Create/Decision/Registry Events.

## Bekannte Grenzen
- Keine automatische Agent-Code-Erzeugung.
- Keine freie Agent-Runtime-Aktivierung.
- Keine automatische Tool-Installation.
- Runtime-Ausführung registrierter Agenten ist noch nicht implementiert.
- Phase 12 sollte Controlled Agent Runtime Foundation vorbereiten.

## Abschlusskriterien
- npm run phase11:7:verify
- npm run phase11:8:verify
- npm run phase11:9:verify
- npm run phase11:9:smoke
- npm run phase11:10:verify
- npm run build
- npm run stack:health
`);

  ensureFile("docs/phase11-final-governance-handoff-runbook.md", `# Runbook – Phase 11.10 Final Governance Handoff

## Patch
\`\`\`powershell
npm run phase11:10:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase11-10-patch-final-governance-handoff.cjs
\`\`\`

## Final Verify
\`\`\`powershell
npm run phase11:10:verify
npm run governance:final:check
npm run build
npm run stack:health
\`\`\`

## Manuelle UI-Prüfung
Diese URLs öffnen:
- http://localhost:3000/tool-consent
- http://localhost:3000/capability-requests
- http://localhost:3000/agent-blueprints
- http://localhost:3000/agent-registry
- http://localhost:3000/governance-audit

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final governance handoff"
git push origin main
git status --short
\`\`\`

## Hinweis zu data/
\`data/\` enthält Runtime-/Testdaten und sollte durch \`.gitignore\` ignoriert bleiben.
`);

  ensureFile("next-chat-handoff-phase12.md", `# Übergabe für nächsten Chat – Phase 12 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Aktueller Stand
Phase 10 abgeschlossen. Phase 11 Governance-Block abgeschlossen bis Phase 11.10.

## Abgeschlossene Phase-11-Kette
- 11.2 Consent Request Integration in Agent Flow
- 11.3 Consent Resume / Approved Tool Execution
- 11.4 Missing Tool / Capability Request Flow
- 11.5 Agent Blueprint Proposal
- 11.6 Controlled Agent Registry Activation
- 11.7 Registry UI Polish & Unified Navigation
- 11.8 Agent Registry Analytics & Audit Trail
- 11.9 Governance Release Polish / Legacy Nav Cleanup / End-to-End Smoke
- 11.10 Final Governance Handoff / Release Summary

## Wichtige Routen
- http://localhost:3000/tool-consent
- http://localhost:3000/capability-requests
- http://localhost:3000/agent-blueprints
- http://localhost:3000/agent-registry
- http://localhost:3000/governance-audit
- http://localhost:7071/health

## Wichtige Checks
\`\`\`powershell
npm run governance:final:check
npm run build
npm run stack:health
\`\`\`

## Nächster sinnvoller Schritt
Phase 12.0 – Controlled Agent Runtime Foundation

## Ziel Phase 12.0
Registrierte Agents aus der Controlled Agent Registry sollen weiterhin nicht frei ausgeführt werden, aber es soll eine sichere Runtime-Grundlage entstehen:
- Registry Entry laden
- Status prüfen: active/test_mode/disabled
- Permissions prüfen
- Consent prüfen
- Dry-run Execution Envelope erzeugen
- Kein echter Tool-Run ohne weitere Approval-Schicht

## Startprompt für nächsten Chat
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 10 ist abgeschlossen, Phase 11 Governance ist bis 11.10 abgeschlossen. Stack war healthy. Bitte mit Phase 12.0 – Controlled Agent Runtime Foundation weitermachen. Wichtig: keine freie Agent-Ausführung, sondern zunächst sichere Runtime Envelope / Dry-run / Permission & Consent Gate.
`);
}
patchPackage();
patchDocs();
console.log("Phase 11.10 Patch abgeschlossen.");
