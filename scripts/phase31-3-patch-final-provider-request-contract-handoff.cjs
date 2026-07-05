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
  pkg.scripts["phase31:3:patch"]="node scripts/phase31-3-patch-final-provider-request-contract-handoff.cjs";
  pkg.scripts["phase31:3:verify"]="node scripts/phase31-3-verify-final-provider-request-contract-handoff.cjs";
  pkg.scripts["llm:provider-request-contract:final:check"]="npm run phase31:0:verify && npm run phase31:1:verify && npm run phase31:2:verify && npm run phase31:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 31.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase31-3-final-provider-request-contract-handoff-release-summary.md", `# Phase 31.3 – Final Provider Request Contract Handoff / Release Summary

## Ziel
Phase 31.3 schließt den Controlled Provider Request Contract Block ab und dokumentiert den Stand für Phase 32.

## Abgeschlossene Phase-31-Kette
- Phase 31.0 – Controlled Provider Request Contract Preparation / Still No Provider Call
- Phase 31.1 – Provider Request Contract Policy & Audit
- Phase 31.2 – Provider Request Contract Dashboard & Smoke
- Phase 31.3 – Final Provider Request Contract Handoff / Release Summary

## Was erreicht wurde
- Provider Request Contracts können aus Token-backed Provider Preflights vorbereitet werden.
- Contract bleibt metadata-only.
- Provider bleibt none.
- Modell bleibt none.
- Prompt wird nicht eingebettet.
- Redacted Prompt Preview wird ebenfalls nicht eingebettet.
- Secret-Werte werden nicht eingebettet.
- Request Body wird nicht eingebettet.
- Netzwerk-/Provider-Aufrufe bleiben blockiert.
- Provider Request Contract Policy prüft metadata-only, no prompt, no redacted preview, no secrets, no request body, provider none, model none, no network call und execution safety.
- Provider Request Contract Dashboard fasst Contracts, Policy Simulationen, Token-backed Provider Preflights und Audit zusammen.
- Governance Audit protokolliert Contract- und Policy-Ereignisse mit critical risk level.
- Tool- und Agent-Ausführung bleiben weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /token-backed-provider-preflight-dashboard
- /provider-request-contract
- /provider-request-contract-policy
- /provider-request-contract-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/token-backed-provider-invocation-preflight
- /api/provider-request-contract
- /api/provider-request-contract-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/token-backed-provider-invocation-preflights.jsonl
- data/provider-request-contracts.jsonl
- data/provider-request-contract-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- controlled_provider_request_contract_metadata_only_no_provider_call.
- providerRequestContractPrepared=true.
- metadataOnly=true.
- provider=none.
- modelSelected=none.
- promptIncluded=false.
- promptRedactedPreviewIncluded=false.
- secretValuesIncluded=false.
- requestBodyIncluded=false.
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
Wenn Phase 31.0, 31.1 oder 31.2 Verify nur an Doku-/Navigation-Strings scheitert, zuerst die fehlenden Verify-Strings oder Navigation-Links nachziehen. Build und Smoke bleiben die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 32.0 – Controlled Provider Request Envelope Assembly / Still No Provider Call

## Ziel Phase 32.0
Nach dem Provider Request Contract wird ein expliziter Provider Request Envelope vorbereitet:
- Provider Request Contract als Input
- Provider Request Envelope bleibt metadata-only
- Kein Prompt Payload
- Keine Secret-Werte
- Kein Request Body mit sensiblen Inhalten
- Provider weiterhin none
- Modell weiterhin none
- Kein Netzwerk-/Provider-Aufruf
- Operational Controls erneut prüfen
- Audit für Provider Request Envelope
- weiterhin keine Tool- oder Agent-Ausführung
`);
 ensureFile("docs/phase31-final-provider-request-contract-handoff-runbook.md", `# Runbook – Phase 31.3 Final Provider Request Contract Handoff

## Patch
\`\`\`powershell
npm run phase31:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase31-3-patch-final-provider-request-contract-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase31:3:verify
npm run llm:provider-request-contract:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase31:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final provider request contract handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase32.md", `# Übergabe für nächsten Chat – Phase 32 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate, Phase 20 Real LLM Consent, Phase 21 Approved Invocation Envelope, Phase 22 Provider Adapter Stub, Phase 23 Provider Config Secret Boundary, Phase 24 Provider Readiness, Phase 25 Controlled Provider Simulation, Phase 26 Real Provider Gate, Phase 27 Approval Token Request, Phase 28 Approval Token Issuance, Phase 29 Approval Token Activation, Phase 30 Token-Backed Provider Preflight und Phase 31 Provider Request Contract sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/provider-request-contract
- http://localhost:3000/provider-request-contract-policy
- http://localhost:3000/provider-request-contract-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:provider-request-contract:final:check
npm run build
npm run stack:health
npm run phase31:2:smoke
\`\`\`

## Nächster Schritt
Phase 32.0 – Controlled Provider Request Envelope Assembly / Still No Provider Call

## Leitplanken
- Provider Request Contract als Input
- Provider Request Envelope nur metadata-only
- promptIncluded=false
- promptRedactedPreviewIncluded=false
- secretValuesIncluded=false
- requestBodyIncluded=false oder nur metadata-only skeleton
- envelopePayloadIncluded=false
- Provider bleibt none
- modelSelected bleibt none
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 31 sind abgeschlossen. Ziel jetzt: Phase 32.0 – Controlled Provider Request Envelope Assembly / Still No Provider Call. Bitte einen separaten Provider Request Envelope vorbereiten. Input ist Provider Request Contract. Kein Provider-/Netzwerk-Aufruf, keine Secret-Werte, kein Prompt Payload, kein sensibler Request Body, Audit Event schreiben, keine Tool- oder Agent-Ausführung.
`);
}
patchPackage();
patchDocs();
console.log("Phase 31.3 Patch abgeschlossen.");
