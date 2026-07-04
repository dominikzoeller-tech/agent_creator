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
  pkg.scripts["phase25:3:patch"]="node scripts/phase25-3-patch-final-provider-simulation-handoff.cjs";
  pkg.scripts["phase25:3:verify"]="node scripts/phase25-3-verify-final-provider-simulation-handoff.cjs";
  pkg.scripts["llm:provider-simulation:final:check"]="npm run phase25:0:verify && npm run phase25:1:verify && npm run phase25:2:verify && npm run phase25:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 25.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase25-3-final-provider-simulation-handoff-release-summary.md", `# Phase 25.3 – Final Provider Simulation Handoff / Release Summary

## Ziel
Phase 25.3 schließt den Controlled-Provider-Invocation-Simulation-Block ab und dokumentiert den Stand für Phase 26.

## Abgeschlossene Phase-25-Kette
- Phase 25.0 – Controlled Provider Invocation Simulation Envelope / Still No External Call
- Phase 25.1 – Provider Simulation Policy & Audit
- Phase 25.2 – Provider Simulation Dashboard & Smoke
- Phase 25.3 – Final Provider Simulation Handoff / Release Summary

## Was erreicht wurde
- Controlled Provider Invocation Simulation Envelopes können aus Provider Invocation Readiness Preflights vorbereitet werden.
- Die simulierte Provider Request bleibt provider=none und modelSelected=none.
- Prompt- und Secret-Werte werden nicht in die Simulation Envelope übernommen.
- Die simulierte Provider Response bleibt metadata-only.
- Provider Simulation Policy prüft External-Call-Risiko, Secret Boundary, Response Contract, Output Contract und Execution Safety Invariants.
- Provider Simulation Dashboard fasst Simulation Envelopes, Policy Simulationen, Readiness Preflights und Audit zusammen.
- Governance Audit protokolliert Simulation Envelope- und Policy-Ereignisse.
- Echte Provider-/Netzwerk-Aufrufe bleiben weiterhin blockiert.
- Der produktive LLM-Aufruf bleibt weiterhin blockiert.
- Tool- und Agent-Ausführung bleiben weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /provider-readiness-dashboard
- /controlled-provider-invocation-simulation-envelope
- /controlled-provider-invocation-simulation-policy
- /provider-simulation-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/provider-invocation-readiness-preflight
- /api/controlled-provider-invocation-simulation-envelope
- /api/controlled-provider-invocation-simulation-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/provider-invocation-readiness-preflights.jsonl
- data/controlled-provider-invocation-simulation-envelopes.jsonl
- data/controlled-provider-invocation-simulation-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- controlled_provider_invocation_simulation_envelope_no_external_call.
- Kein externer Netzwerk-/Provider-Aufruf.
- Kein produktiver LLM-Aufruf.
- provider=none.
- modelSelected=none.
- promptIncluded=false.
- secretValuesIncluded=false.
- Response nur metadata-only.
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
Wenn Phase 25.0, 25.1 oder 25.2 Verify nur an Doku-/Navigation-Strings scheitert, zuerst die fehlenden Verify-Strings oder Navigation-Links nachziehen. Build und Smoke bleiben die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 26.0 – Controlled Real Provider Invocation Gate / Explicit Human Approval Required

## Ziel Phase 26.0
Nach der Simulation wird ein echter Provider Invocation Gate vorbereitet, aber weiterhin ohne automatischen Provider Call:
- Simulation Envelope als Input
- Readiness Preflight als Input
- Human Approval für echten externen Call zwingend
- Secret Boundary erneut prüfen
- Cost/RateLimit/Timeout/Observability erneut prüfen
- kein automatischer Netzwerk-/Provider-Aufruf
- Audit vor Gate-Entscheidung
- weiterhin keine Tool- oder Agent-Ausführung
`);
 ensureFile("docs/phase25-final-provider-simulation-handoff-runbook.md", `# Runbook – Phase 25.3 Final Provider Simulation Handoff

## Patch
\`\`\`powershell
npm run phase25:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase25-3-patch-final-provider-simulation-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase25:3:verify
npm run llm:provider-simulation:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase25:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final provider simulation handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase26.md", `# Übergabe für nächsten Chat – Phase 26 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate, Phase 20 Real LLM Consent, Phase 21 Approved Invocation Envelope, Phase 22 Provider Adapter Stub, Phase 23 Provider Config Secret Boundary, Phase 24 Provider Readiness und Phase 25 Controlled Provider Simulation sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/provider-readiness-dashboard
- http://localhost:3000/controlled-provider-invocation-simulation-envelope
- http://localhost:3000/controlled-provider-invocation-simulation-policy
- http://localhost:3000/provider-simulation-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:provider-simulation:final:check
npm run build
npm run stack:health
npm run phase25:2:smoke
\`\`\`

## Nächster Schritt
Phase 26.0 – Controlled Real Provider Invocation Gate / Explicit Human Approval Required

## Leitplanken
- kein automatischer Netzwerk-/Provider-Aufruf
- echter externer Call nur nach expliziter Human Approval
- Simulation Envelope als Input
- Readiness Preflight als Input
- Secret Boundary erneut prüfen
- Cost/RateLimit/Timeout/Observability erneut prüfen
- Audit vor Gate-Entscheidung
- keine Tool- oder Agent-Ausführung
- realLlmCallAllowed=false bis explizit sicher geändert
- llmCallPerformed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 25 sind abgeschlossen. Ziel jetzt: Phase 26.0 – Controlled Real Provider Invocation Gate / Explicit Human Approval Required. Bitte ein Gate für echte Provider Invocation vorbereiten. Kein automatischer Netzwerk-/Provider-Aufruf, Human Approval zwingend, Secret Boundary und Operational Controls erneut prüfen, Audit vor Gate-Entscheidung.
`);
}
patchPackage();
patchDocs();
console.log("Phase 25.3 Patch abgeschlossen.");
