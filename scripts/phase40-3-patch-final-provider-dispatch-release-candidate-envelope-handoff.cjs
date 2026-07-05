const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensure(file, content){ if(!exists(file)){ write(file, content); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase40:3:patch"]="node scripts/phase40-3-patch-final-provider-dispatch-release-candidate-envelope-handoff.cjs";
  pkg.scripts["phase40:3:verify"]="node scripts/phase40-3-verify-final-provider-dispatch-release-candidate-envelope-handoff.cjs";
  pkg.scripts["llm:provider-dispatch-release-candidate-envelope:final:check"]="npm run phase40:0:verify && npm run phase40:1:verify && npm run phase40:2:verify && npm run build";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 40.3 Scripts eingetragen.");
}
const summary=`# Phase 40.3 – Final Provider Dispatch Release Candidate Envelope Handoff / Release Summary

## Ziel
Phase 40 schließt den Provider-Dispatch-Release-Candidate-Envelope-Block ab.

## Abgeschlossen
- Phase 40.0 – Controlled Provider Dispatch Release Candidate Envelope / Still No Provider Call
- Phase 40.1 – Provider Dispatch Release Candidate Envelope Policy & Audit
- Phase 40.2 – Provider Dispatch Release Candidate Envelope Dashboard & Smoke
- Phase 40.3 – Final Provider Dispatch Release Candidate Envelope Handoff / Release Summary

## Wichtigste Routen
- /provider-dispatch-release-candidate-envelope
- /provider-dispatch-release-candidate-envelope-policy
- /provider-dispatch-release-candidate-envelope-dashboard
- /api/provider-dispatch-release-candidate-envelope
- /api/provider-dispatch-release-candidate-envelope-policy

## Sicherheitsinvarianten
- providerDispatchReleaseCandidateEnvelopePrepared=true
- releaseCandidateEnvelopePrepared=true
- releaseCandidateEnvelopePersisted=true
- releaseCandidateReadyForHumanReview=true
- releaseCandidateApproved=false
- releaseCandidateExecuted=false
- releaseCandidateContainsProviderResponse=false
- releaseCandidateContainsPromptPayload=false
- releaseCandidateContainsSecrets=false
- transcriptEnvelopeContainsProviderResponse=false
- transcriptEnvelopeContainsPromptPayload=false
- transcriptEnvelopeContainsSecrets=false
- resultEnvelopeContainsProviderResponse=false
- commandEnvelopePrepared=true
- commandEnvelopeExecuted=false
- executionGateOpen=false
- finalDispatchAllowed=false
- providerDispatchPerformed=false
- metadataOnly=true
- provider=none
- modelSelected=none
- dispatchPayloadIncluded=false
- commandPayloadIncluded=false
- promptPayloadIncluded=false
- promptIncluded=false
- providerResponseIncluded=false
- providerResultIncluded=false
- secretValuesIncluded=false
- requestBodyIncluded=false
- sensitiveRequestBodyIncluded=false
- networkCallAllowed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Ergebnis
Provider Dispatch Release Candidate Envelope ist vorbereitet, persistiert, per Policy prüfbar, auditierbar und im Dashboard sichtbar. Der Release Candidate ist ausschließlich für Human Review bereit, aber nicht approved und nicht ausgeführt. Kein Provider Dispatch und kein externer Provider-/Netzwerk-Aufruf.

## Nächster Schritt
Phase 41.0 – Controlled Provider Dispatch Approval Candidate Envelope / Still No Provider Call
`;
const runbook=`# Runbook – Phase 40 Final Provider Dispatch Release Candidate Envelope Handoff

## Verify
\`\`\`powershell
npm run phase40:3:verify
npm run llm:provider-dispatch-release-candidate-envelope:final:check
npm run build
\`\`\`

## Optional Smoke
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase40:2:smoke
\`\`\`

## Sicherheit
Phase 40 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte, keinen sensiblen Request Body und keine Provider Response im Release Candidate Envelope. Der Release Candidate bleibt Human-Review-ready, aber nicht approved und nicht ausgeführt.
`;
const handoff=`# Next Chat Handoff – Phase 41

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Zusammenarbeit
Direkt, phasenweise und pragmatisch. Erst Patch, Verify, Build. Docker/Smoke nur für Browser-/API-Erreichbarkeit. Bei Fehlern reicht der relevante Fehlerblock. Dominik bevorzugt klare, ehrliche Kommunikation über technische Zwischenschritte, zusätzlichen Aufwand, Zweck der Maßnahmen und späteres Aufräumen.

## Aktueller Stand
Phase 40 ist abgeschlossen, sobald Phase 40.3 committed ist.

## Letzte abgeschlossene Kette
- Provider Dispatch Transcript Envelope
- Provider Dispatch Transcript Envelope Policy & Audit
- Provider Dispatch Transcript Envelope Dashboard & Smoke
- Provider Dispatch Release Candidate Envelope
- Provider Dispatch Release Candidate Envelope Policy & Audit
- Provider Dispatch Release Candidate Envelope Dashboard & Smoke

## Unveränderte Sicherheitsinvarianten
- kein realer Provider Call
- kein Netzwerkaufruf
- keine aktive Token-Bindung
- kein Provider Dispatch
- Final Dispatch bleibt blockiert
- Execution Gate bleibt geschlossen
- Dry-Run Command Envelope bleibt nicht ausgeführt
- Dry-Run Result Envelope enthält keine Provider Response
- Transcript Envelope enthält keine Provider Response, keinen Prompt Payload und keine Secrets
- Release Candidate ist Human-Review-ready
- Release Candidate ist nicht approved
- Release Candidate ist nicht ausgeführt
- keine Secret-Werte im UI/Storage
- provider=none
- modelSelected=none
- dryRunOnly=true

## Nächster Block
Phase 41.0 – Controlled Provider Dispatch Approval Candidate Envelope / Still No Provider Call

Vorgeschlagener Start:
\`\`\`powershell
cd C:\\Users\\User\\ai-assistant\\agent_creator
git status --short
npm run build
\`\`\`
Dann mit Phase 41.0 fortfahren.
`;
patchPackage();
ensure("phase40-3-final-provider-dispatch-release-candidate-envelope-handoff-release-summary.md", summary);
ensure("docs/phase40-final-provider-dispatch-release-candidate-envelope-handoff-runbook.md", runbook);
ensure("next-chat-handoff-phase41.md", handoff);
console.log("Phase 40.3 Patch abgeschlossen.");
