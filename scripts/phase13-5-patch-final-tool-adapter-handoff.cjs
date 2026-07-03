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
  pkg.scripts["phase13:5:patch"]="node scripts/phase13-5-patch-final-tool-adapter-handoff.cjs";
  pkg.scripts["phase13:5:verify"]="node scripts/phase13-5-verify-final-tool-adapter-handoff.cjs";
  pkg.scripts["tool-adapter:final:check"]="npm run phase13:0:verify && npm run phase13:1:verify && npm run phase13:2:verify && npm run phase13:3:verify && npm run phase13:4:verify && npm run phase13:4:smoke && npm run phase13:5:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 13.5 Scripts eingetragen.");
}
function patchDocs(){
  ensureFile("phase13-5-final-tool-adapter-handoff-release-summary.md", `# Phase 13.5 – Final Tool Adapter Handoff / Release Summary

## Ziel
Phase 13.5 schließt den Phase-13-Tool-Adapter-Block ab und dokumentiert den aktuellen Übergabestand für den nächsten Arbeitsabschnitt.

## Warum diese Phase wichtig ist
Phase 13 hat bewusst viele technische Zwischenstationen sichtbar gemacht. Diese Seiten sind Governance-/Developer-Konsolen, nicht das finale Endnutzer-Bedienkonzept. Der spätere Master Agent soll diese Schritte weitgehend orchestrieren und nur relevante Approvals/Dashboards sichtbar machen.

## Abgeschlossene Phase-13-Kette
- Phase 13.0 – Controlled Tool Execution Sandbox / Tool Adapter Registry Foundation
- Phase 13.1 – Tool Adapter Consent Binding
- Phase 13.2 – Approved Tool Adapter Resume Plan
- Phase 13.3 – Tool Adapter Policy Simulation & Audit
- Phase 13.4 – Tool Adapter Dashboard & Phase-13 Smoke
- Phase 13.5 – Final Tool Adapter Handoff / Release Summary

## Wichtige UI-Routen
- /tool-sandbox
- /tool-adapter-consent
- /tool-adapter-resume
- /tool-adapter-policy
- /tool-adapter-dashboard
- /tool-consent
- /governance-audit

## Wichtige API-Routen
- /api/tool-adapters
- /api/tool-adapter-consent
- /api/tool-adapter-resume
- /api/tool-adapter-policy
- /api/tool-consent
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und sind durch \`.gitignore\` bewusst nicht für den Commit vorgesehen.

Typische Runtime-Dateien:
- data/tool-adapter-registry.json
- data/tool-execution-sandbox-plans.jsonl
- data/tool-adapter-consent-bindings.json
- data/approved-tool-adapter-resume-plans.jsonl
- data/tool-adapter-policy-simulations.jsonl
- data/tool-consent-requests.json
- data/governance-audit.jsonl

## Aktueller Sicherheitsstand
- Tool Adapter werden nur registriert, nicht frei ausgeführt.
- Tool Execution Plans sind Dry-run Plans.
- Consent Bindings erzeugen Consent Requests, aber keine Ausführung.
- Approved Resume Plans bleiben Dry-run-only.
- Policy Simulation bleibt simuliert.
- toolExecutionAllowed bleibt false.
- dryRunOnly bleibt true.
- Secrets/Input-Sensitivität werden im Sandbox-Konzept berücksichtigt und redacted.
- Governance Audit protokolliert relevante Tool-Adapter-Simulationen.

## Bekannte Grenzen
- Keine echte Tool-Ausführung.
- Kein Tool Installer.
- Keine produktive Tool Runtime Execution.
- Keine automatische Freischaltung nach Consent.
- Kein Admin-Approval-Gate für echte Execution implementiert.

## Bedienkonzept-Zielbild
Die aktuellen Einzelseiten sind technische Kontrollpunkte. Später sollten diese zusammengeführt werden in:
- Master Agent Cockpit
- Approval Center
- Agent Factory
- Tool Factory
- Audit Center
- Admin/Developer Mode

## Abschlusskriterien
- npm run phase13:0:verify
- npm run phase13:1:verify
- npm run phase13:2:verify
- npm run phase13:3:verify
- npm run phase13:4:verify
- npm run phase13:4:smoke
- npm run phase13:5:verify
- npm run tool-adapter:final:check
- npm run build
- npm run stack:health
`);

  ensureFile("docs/phase13-final-tool-adapter-handoff-runbook.md", `# Runbook – Phase 13.5 Final Tool Adapter Handoff

## Patch
\`\`\`powershell
npm run phase13:5:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase13-5-patch-final-tool-adapter-handoff.cjs
\`\`\`

## Final Verify
\`\`\`powershell
npm run phase13:5:verify
npm run tool-adapter:final:check
npm run build
npm run stack:health
\`\`\`

## Manuelle UI-Prüfung
Diese URLs öffnen:
- http://localhost:3000/tool-sandbox
- http://localhost:3000/tool-adapter-consent
- http://localhost:3000/tool-adapter-resume
- http://localhost:3000/tool-adapter-policy
- http://localhost:3000/tool-adapter-dashboard
- http://localhost:3000/governance-audit

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final tool adapter handoff"
git push origin main
git status --short
\`\`\`

## Hinweis zu data/
\`data/\` enthält Runtime-/Testdaten und sollte durch \`.gitignore\` ignoriert bleiben.
`);

  ensureFile("next-chat-handoff-phase14.md", `# Übergabe für nächsten Chat – Phase 14 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Aktueller Stand
Phase 10 abgeschlossen. Phase 11 Governance abgeschlossen. Phase 12 Runtime Foundation abgeschlossen. Phase 13 Tool Adapter Sandbox abgeschlossen bis Phase 13.5.

## Abgeschlossene Phase-13-Kette
- 13.0 Controlled Tool Execution Sandbox / Tool Adapter Registry Foundation
- 13.1 Tool Adapter Consent Binding
- 13.2 Approved Tool Adapter Resume Plan
- 13.3 Tool Adapter Policy Simulation & Audit
- 13.4 Tool Adapter Dashboard & Phase-13 Smoke
- 13.5 Final Tool Adapter Handoff / Release Summary

## Wichtige Routen
- http://localhost:3000/tool-sandbox
- http://localhost:3000/tool-adapter-consent
- http://localhost:3000/tool-adapter-resume
- http://localhost:3000/tool-adapter-policy
- http://localhost:3000/tool-adapter-dashboard
- http://localhost:3000/agent-runtime-dashboard
- http://localhost:3000/governance-audit
- http://localhost:7071/health

## Wichtige Checks
\`\`\`powershell
npm run tool-adapter:final:check
npm run runtime:final:check
npm run build
npm run stack:health
\`\`\`

## Nächster sinnvoller Schritt
Phase 14.0 – Master Agent Cockpit / Unified Control Center Foundation

## Empfehlung
Nicht direkt echte Tool-Ausführung freischalten. Stattdessen die vielen Governance-/Runtime-/Tool-Adapter-Seiten in ein zentrales Cockpit konsolidieren:
- Master Agent Cockpit Landing Page
- Status-Kacheln für Governance, Runtime, Tool Adapter
- zentrale Next Actions
- Admin/Developer Mode Gruppierung
- alte Einzelseiten weiterhin erreichbar, aber weniger prominent

## Warum Phase 14.0 sinnvoll ist
Die Sicherheitsbausteine sind jetzt gelegt. Der nächste Schritt sollte Bedienbarkeit und Orchestrierung sein, damit der Master Agent später kontrolliert Agenten und Tools vorbereiten kann, ohne dass der Nutzer alle Debug-Seiten einzeln bedienen muss.

## Startprompt für nächsten Chat
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 Governance, Phase 12 Runtime Foundation und Phase 13 Tool Adapter Sandbox sind abgeschlossen. Stack war healthy. Bitte mit Phase 14.0 – Master Agent Cockpit / Unified Control Center Foundation weitermachen. Ziel: die vielen technischen Governance-/Runtime-/Tool-Seiten in ein übersichtliches Cockpit zusammenführen. Wichtig: weiterhin keine echte Tool-Ausführung ohne Sandbox-, Consent-, Policy- und Admin-Approval-Schicht.
`);
}
patchPackage();
patchDocs();
console.log("Phase 13.5 Patch abgeschlossen.");
