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
  pkg.scripts["phase26:3:patch"]="node scripts/phase26-3-patch-final-real-provider-gate-handoff.cjs";
  pkg.scripts["phase26:3:verify"]="node scripts/phase26-3-verify-final-real-provider-gate-handoff.cjs";
  pkg.scripts["llm:real-provider-gate:final:check"]="npm run phase26:0:verify && npm run phase26:1:verify && npm run phase26:2:verify && npm run phase26:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 26.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase26-3-final-real-provider-gate-handoff-release-summary.md", `# Phase 26.3 – Final Real Provider Gate Handoff / Release Summary

## Ziel
Phase 26.3 schließt den Controlled-Real-Provider-Invocation-Gate-Block ab und dokumentiert den Stand für Phase 27.

## Abgeschlossene Phase-26-Kette
- Phase 26.0 – Controlled Real Provider Invocation Gate / Explicit Human Approval Required
- Phase 26.1 – Real Provider Gate Policy & Audit
- Phase 26.2 – Real Provider Gate Dashboard & Smoke
- Phase 26.3 – Final Real Provider Gate Handoff / Release Summary

## Was erreicht wurde
- Ein Gate für echte Provider Invocation kann aus einer Controlled Provider Invocation Simulation Envelope vorbereitet werden.
- Human Approval ist vor jedem echten externen Provider Call zwingend.
- Das Gate erteilt noch keine Approval und stellt keinen Approval Token aus.
- Provider-Auswahl bleibt blockiert.
- Provider und Modell bleiben none.
- Automatische Invocation bleibt blockiert.
- Netzwerk-/Provider-Aufrufe bleiben blockiert.
- Real Provider Gate Policy prüft Human Approval Required, No Auto Call, Secret Boundary, Output Contract und Operational Controls.
- Real Provider Gate Dashboard fasst Gates, Gate Policy Simulationen, Simulation Envelopes und Audit zusammen.
- Governance Audit protokolliert Gate- und Policy-Ereignisse mit critical risk level.
- Tool- und Agent-Ausführung bleiben weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /provider-simulation-dashboard
- /controlled-real-provider-invocation-gate
- /real-provider-gate-policy
- /real-provider-gate-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/controlled-provider-invocation-simulation-envelope
- /api/controlled-real-provider-invocation-gate
- /api/real-provider-gate-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/controlled-provider-invocation-simulation-envelopes.jsonl
- data/controlled-real-provider-invocation-gates.jsonl
- data/controlled-real-provider-gate-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- controlled_real_provider_invocation_gate_human_approval_required.
- Human Approval zwingend.
- humanApprovalRequired=true.
- humanApproved=false.
- approvalTokenIssued=false.
- providerSelectionAllowed=false.
- provider=none.
- modelSelected=none.
- automaticInvocationAllowed=false.
- networkCallAllowed=false.
- networkCallPerformed=false.
- providerExecutionAllowed=false.
- realLlmCallAllowed=false.
- llmCallPerformed=false.
- Keine Tool-Ausführung.
- Keine Agent-Ausführung.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Bekannter Hinweis
Wenn Phase 26.0, 26.1 oder 26.2 Verify nur an Doku-/Navigation-Strings scheitert, zuerst die fehlenden Verify-Strings oder Navigation-Links nachziehen. Build und Smoke bleiben die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 27.0 – Explicit Human Approval Token Request / Still No Provider Call

## Ziel Phase 27.0
Vor echter Provider Invocation wird ein kontrollierter Approval Token Request vorbereitet:
- Real Provider Gate als Input
- Human Approval Request erfassen
- Approval Token noch nicht automatisch erteilen
- kein automatischer Provider-/Netzwerk-Aufruf
- Secret Boundary erneut prüfen
- Operational Controls erneut prüfen
- Audit für Approval Request
- weiterhin keine Tool- oder Agent-Ausführung
`);
 ensureFile("docs/phase26-final-real-provider-gate-handoff-runbook.md", `# Runbook – Phase 26.3 Final Real Provider Gate Handoff

## Patch
\`\`\`powershell
npm run phase26:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase26-3-patch-final-real-provider-gate-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase26:3:verify
npm run llm:real-provider-gate:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase26:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final real provider gate handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase27.md", `# Übergabe für nächsten Chat – Phase 27 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate, Phase 20 Real LLM Consent, Phase 21 Approved Invocation Envelope, Phase 22 Provider Adapter Stub, Phase 23 Provider Config Secret Boundary, Phase 24 Provider Readiness, Phase 25 Controlled Provider Simulation und Phase 26 Real Provider Gate sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/provider-simulation-dashboard
- http://localhost:3000/controlled-real-provider-invocation-gate
- http://localhost:3000/real-provider-gate-policy
- http://localhost:3000/real-provider-gate-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:real-provider-gate:final:check
npm run build
npm run stack:health
npm run phase26:2:smoke
\`\`\`

## Nächster Schritt
Phase 27.0 – Explicit Human Approval Token Request / Still No Provider Call

## Leitplanken
- Real Provider Gate als Input
- Human Approval Request erfassen
- Approval Token noch nicht automatisch erteilen
- kein automatischer Provider-/Netzwerk-Aufruf
- Secret Boundary erneut prüfen
- Operational Controls erneut prüfen
- Audit für Approval Request
- keine Tool- oder Agent-Ausführung
- humanApprovalRequired=true
- humanApproved=false bis explizit sicher geändert
- approvalTokenIssued=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- llmCallPerformed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 26 sind abgeschlossen. Ziel jetzt: Phase 27.0 – Explicit Human Approval Token Request / Still No Provider Call. Bitte einen kontrollierten Human Approval Token Request vorbereiten. Kein automatischer Provider-/Netzwerk-Aufruf, Approval Token noch nicht automatisch erteilen, Secret Boundary und Operational Controls erneut prüfen, Audit für Approval Request.
`);
}
patchPackage();
patchDocs();
console.log("Phase 26.3 Patch abgeschlossen.");
