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
  pkg.scripts["phase12:5:patch"]="node scripts/phase12-5-patch-final-runtime-handoff.cjs";
  pkg.scripts["phase12:5:verify"]="node scripts/phase12-5-verify-final-runtime-handoff.cjs";
  pkg.scripts["runtime:final:check"]="npm run phase12:0:verify && npm run phase12:1:verify && npm run phase12:2:verify && npm run phase12:3:verify && npm run phase12:4:verify && npm run phase12:4:smoke && npm run phase12:5:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.5 Scripts eingetragen.");
}
function patchDocs(){
  ensureFile("phase12-5-final-runtime-handoff-release-summary.md", `# Phase 12.5 – Final Runtime Handoff / Release Summary

## Ziel
Phase 12.5 schließt den Phase-12-Runtime-Foundation-Block ab und dokumentiert den aktuellen Übergabestand für den nächsten Arbeitsabschnitt.

## Abgeschlossene Phase-12-Kette
- Phase 12.0 – Controlled Agent Runtime Foundation
- Phase 12.1 – Runtime Consent Binding
- Phase 12.2 – Approved Runtime Resume Envelope
- Phase 12.3 – Runtime Audit Integration & Policy Simulation
- Phase 12.4 – Runtime Dashboard & Phase-12 Smoke
- Phase 12.5 – Final Runtime Handoff / Release Summary

## Wichtige UI-Routen
- /agent-runtime
- /agent-runtime-consent
- /agent-runtime-resume
- /agent-runtime-policy
- /agent-runtime-dashboard
- /governance-audit
- /agent-registry
- /tool-consent

## Wichtige API-Routen
- /api/agent-runtime
- /api/agent-runtime-consent
- /api/agent-runtime-resume
- /api/agent-runtime-policy
- /api/governance-audit
- /api/agent-registry
- /api/tool-consent
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und sind durch \`.gitignore\` bewusst nicht für den Commit vorgesehen.

Typische Runtime-Dateien:
- data/controlled-agent-runtime-envelopes.jsonl
- data/agent-runtime-consent-bindings.json
- data/approved-runtime-resume-envelopes.jsonl
- data/agent-runtime-policy-simulations.jsonl
- data/governance-audit.jsonl
- data/tool-consent-requests.json
- data/controlled-agent-registry.json

## Aktueller Sicherheitsstand
- Registrierte Agents werden nicht frei ausgeführt.
- Runtime erzeugt nur Dry-run Envelopes.
- Runtime Consent Binding erzeugt Consent Requests, aber keine Ausführung.
- Approved Resume erzeugt nur Resume Envelopes.
- Policy Simulation bleibt simuliert.
- toolExecutionAllowed bleibt false.
- dryRunOnly bleibt true.
- Governance Audit protokolliert Runtime/Policy Events.

## Bekannte Grenzen
- Keine echte Tool-Ausführung.
- Keine automatische Agent-Code-Erzeugung.
- Keine automatische Aktivierung aus Blueprints.
- Keine produktive Agent Runtime Execution.
- Kein Tool Installer.

## Abschlusskriterien
- npm run phase12:0:verify
- npm run phase12:1:verify
- npm run phase12:2:verify
- npm run phase12:3:verify
- npm run phase12:4:verify
- npm run phase12:4:smoke
- npm run phase12:5:verify
- npm run runtime:final:check
- npm run build
- npm run stack:health
`);

  ensureFile("docs/phase12-final-runtime-handoff-runbook.md", `# Runbook – Phase 12.5 Final Runtime Handoff

## Patch
\`\`\`powershell
npm run phase12:5:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase12-5-patch-final-runtime-handoff.cjs
\`\`\`

## Final Verify
\`\`\`powershell
npm run phase12:5:verify
npm run runtime:final:check
npm run build
npm run stack:health
\`\`\`

## Manuelle UI-Prüfung
Diese URLs öffnen:
- http://localhost:3000/agent-runtime
- http://localhost:3000/agent-runtime-consent
- http://localhost:3000/agent-runtime-resume
- http://localhost:3000/agent-runtime-policy
- http://localhost:3000/agent-runtime-dashboard
- http://localhost:3000/governance-audit

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final runtime handoff"
git push origin main
git status --short
\`\`\`

## Hinweis zu data/
\`data/\` enthält Runtime-/Testdaten und sollte durch \`.gitignore\` ignoriert bleiben.
`);

  ensureFile("next-chat-handoff-phase13.md", `# Übergabe für nächsten Chat – Phase 13 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Aktueller Stand
Phase 10 abgeschlossen. Phase 11 Governance-Block abgeschlossen. Phase 12 Runtime Foundation abgeschlossen bis Phase 12.5.

## Abgeschlossene Phase-12-Kette
- 12.0 Controlled Agent Runtime Foundation
- 12.1 Runtime Consent Binding
- 12.2 Approved Runtime Resume Envelope
- 12.3 Runtime Audit Integration & Policy Simulation
- 12.4 Runtime Dashboard & Phase-12 Smoke
- 12.5 Final Runtime Handoff / Release Summary

## Wichtige Routen
- http://localhost:3000/agent-runtime
- http://localhost:3000/agent-runtime-consent
- http://localhost:3000/agent-runtime-resume
- http://localhost:3000/agent-runtime-policy
- http://localhost:3000/agent-runtime-dashboard
- http://localhost:3000/governance-audit
- http://localhost:7071/health

## Wichtige Checks
\`\`\`powershell
npm run runtime:final:check
npm run build
npm run stack:health
\`\`\`

## Nächster sinnvoller Schritt
Phase 13.0 – Controlled Tool Execution Sandbox oder Phase 13.0 – Tool Adapter Registry Foundation

## Empfehlung
Nicht direkt echte Tool-Ausführung freischalten. Zuerst eine Tool Adapter Registry / Sandbox vorbereiten:
- Tool Adapter registrieren
- erlaubte Inputs/Outputs definieren
- Dry-run Tool Execution Plan erzeugen
- Secrets weiterhin blockieren
- echte Execution weiterhin hinter Consent + Policy + Admin Approval halten

## Startprompt für nächsten Chat
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 Governance und Phase 12 Runtime Foundation sind abgeschlossen. Stack war healthy. Bitte mit Phase 13.0 weitermachen. Empfehlung: Controlled Tool Execution Sandbox / Tool Adapter Registry Foundation. Wichtig: keine echte Tool-Ausführung ohne neue Sandbox-, Consent-, Policy- und Admin-Approval-Schicht.
`);
}
patchPackage();
patchDocs();
console.log("Phase 12.5 Patch abgeschlossen.");
