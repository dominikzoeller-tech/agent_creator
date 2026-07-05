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
  pkg.scripts["phase32:3:patch"]="node scripts/phase32-3-patch-final-provider-request-envelope-handoff.cjs";
  pkg.scripts["phase32:3:verify"]="node scripts/phase32-3-verify-final-provider-request-envelope-handoff.cjs";
  pkg.scripts["llm:provider-request-envelope:final:check"]="npm run phase32:0:verify && npm run phase32:1:verify && npm run phase32:2:verify && npm run phase32:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 32.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase32-3-final-provider-request-envelope-handoff-release-summary.md", `# Phase 32.3 – Final Provider Request Envelope Handoff / Release Summary

## Ziel
Phase 32.3 schließt den Controlled Provider Request Envelope Block ab und dokumentiert den Stand für Phase 33.

## Abgeschlossene Phase-32-Kette
- Phase 32.0 – Controlled Provider Request Envelope Assembly / Still No Provider Call
- Phase 32.1 – Provider Request Envelope Policy & Audit
- Phase 32.2 – Provider Request Envelope Dashboard & Smoke
- Phase 32.3 – Final Provider Request Envelope Handoff / Release Summary

## Was erreicht wurde
- Provider Request Envelopes können aus Provider Request Contracts assembliert werden.
- Envelope bleibt metadata-only.
- Provider bleibt none.
- Modell bleibt none.
- Envelope Payload wird nicht eingebettet.
- Prompt Payload wird nicht eingebettet.
- Prompt und redacted Prompt Preview werden nicht eingebettet.
- Secret-Werte werden nicht eingebettet.
- Request Body und sensitive Request Body werden nicht eingebettet.
- Netzwerk-/Provider-Aufrufe bleiben blockiert.
- Provider Request Envelope Policy prüft metadata-only, no envelope payload, no prompt payload, no prompt, no redacted preview, no secrets, no request body, provider none, model none, no network call und execution safety.
- Provider Request Envelope Dashboard fasst Envelopes, Policy Simulationen, Provider Request Contracts und Audit zusammen.
- Governance Audit protokolliert Envelope- und Policy-Ereignisse mit critical risk level.
- Tool- und Agent-Ausführung bleiben weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /provider-request-contract-dashboard
- /provider-request-envelope
- /provider-request-envelope-policy
- /provider-request-envelope-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/provider-request-contract
- /api/provider-request-envelope
- /api/provider-request-envelope-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/provider-request-contracts.jsonl
- data/provider-request-envelopes.jsonl
- data/provider-request-envelope-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- controlled_provider_request_envelope_metadata_only_no_provider_call.
- providerRequestEnvelopeAssembled=true.
- metadataOnly=true.
- provider=none.
- modelSelected=none.
- envelopePayloadIncluded=false.
- promptPayloadIncluded=false.
- promptIncluded=false.
- promptRedactedPreviewIncluded=false.
- secretValuesIncluded=false.
- requestBodyIncluded=false.
- sensitiveRequestBodyIncluded=false.
- Kein Provider-/Netzwerk-Aufruf.
- networkCallPerformed=false.
- providerExecutionAllowed=false.
- realLlmCallAllowed=false.
- llmCallPerformed=false.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Bekannter Hinweis
Wenn Phase 32.0, 32.1 oder 32.2 Verify nur an Doku-/Navigation-Strings scheitert, zuerst die fehlenden Verify-Strings oder Navigation-Links nachziehen. Build und Smoke bleiben die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 33.0 – Controlled Provider Dispatch Readiness / Still No Provider Call

## Ziel Phase 33.0
Nach dem Provider Request Envelope wird eine explizite Provider Dispatch Readiness vorbereitet:
- Provider Request Envelope als Input
- Dispatch nur readiness/preflight
- Kein Provider Dispatch
- Kein Netzwerk-/Provider-Aufruf
- Kein Prompt Payload
- Keine Secret-Werte
- Kein sensibler Request Body
- Provider weiterhin none
- Modell weiterhin none
- Operational Controls erneut prüfen
- Audit für Provider Dispatch Readiness
- weiterhin keine Tool- oder Agent-Ausführung
`);
 ensureFile("docs/phase32-final-provider-request-envelope-handoff-runbook.md", `# Runbook – Phase 32.3 Final Provider Request Envelope Handoff

## Patch
\`\`\`powershell
npm run phase32:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase32-3-patch-final-provider-request-envelope-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase32:3:verify
npm run llm:provider-request-envelope:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase32:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final provider request envelope handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase33.md", `# Übergabe für nächsten Chat – Phase 33 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate, Phase 20 Real LLM Consent, Phase 21 Approved Invocation Envelope, Phase 22 Provider Adapter Stub, Phase 23 Provider Config Secret Boundary, Phase 24 Provider Readiness, Phase 25 Controlled Provider Simulation, Phase 26 Real Provider Gate, Phase 27 Approval Token Request, Phase 28 Approval Token Issuance, Phase 29 Approval Token Activation, Phase 30 Token-Backed Provider Preflight, Phase 31 Provider Request Contract und Phase 32 Provider Request Envelope sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/provider-request-envelope
- http://localhost:3000/provider-request-envelope-policy
- http://localhost:3000/provider-request-envelope-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:provider-request-envelope:final:check
npm run build
npm run stack:health
npm run phase32:2:smoke
\`\`\`

## Nächster Schritt
Phase 33.0 – Controlled Provider Dispatch Readiness / Still No Provider Call

## Leitplanken
- Provider Request Envelope als Input
- Dispatch Readiness nur metadata-only/preflight
- providerDispatchPrepared=true
- providerDispatchPerformed=false
- provider=none
- modelSelected=none
- envelopePayloadIncluded=false
- promptPayloadIncluded=false
- secretValuesIncluded=false
- requestBodyIncluded=false
- sensitiveRequestBodyIncluded=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 32 sind abgeschlossen. Ziel jetzt: Phase 33.0 – Controlled Provider Dispatch Readiness / Still No Provider Call. Bitte eine separate Provider Dispatch Readiness vorbereiten. Input ist Provider Request Envelope. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf, keine Secret-Werte, kein Prompt Payload, kein sensibler Request Body, Audit Event schreiben, keine Tool- oder Agent-Ausführung.
`);
}
patchPackage();
patchDocs();
console.log("Phase 32.3 Patch abgeschlossen.");
