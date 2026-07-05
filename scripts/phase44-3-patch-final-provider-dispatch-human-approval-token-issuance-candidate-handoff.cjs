const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); console.log("OK " + file); }
function ensure(file, content){ if(!exists(file)) write(file, content); else console.log("SKIP " + file); }

function patchPackage(){
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["phase44:3:patch"] = "node scripts/phase44-3-patch-final-provider-dispatch-human-approval-token-issuance-candidate-handoff.cjs";
  pkg.scripts["phase44:3:verify"] = "node scripts/phase44-3-verify-final-provider-dispatch-human-approval-token-issuance-candidate-handoff.cjs";
  pkg.scripts["llm:provider-dispatch-human-approval-token-issuance-candidate:final:check"] = "npm run phase44:0:verify && npm run phase44:1:verify && npm run phase44:2:verify && npm run build";
  write(file, JSON.stringify(pkg, null, 2) + "\n");
}

const summary = `# Phase 44.3 – Final Provider Dispatch Human Approval Token Issuance Candidate Handoff / Release Summary

## Ziel
Phase 44 schließt den Provider Dispatch Human Approval Token Issuance Candidate Block ab.

## Abgeschlossen
- Phase 44.0 – Controlled Provider Dispatch Human Approval Token Issuance Candidate / Still No Provider Call
- Phase 44.1 – Provider Dispatch Human Approval Token Issuance Candidate Policy & Audit
- Phase 44.2 – Provider Dispatch Human Approval Token Issuance Candidate Dashboard & Smoke
- Phase 44.3 – Final Provider Dispatch Human Approval Token Issuance Candidate Handoff / Release Summary

## Wichtigste Routen
- /provider-dispatch-human-approval-token-issuance-candidate
- /provider-dispatch-human-approval-token-issuance-candidate-policy
- /provider-dispatch-human-approval-token-issuance-candidate-dashboard
- /api/provider-dispatch-human-approval-token-issuance-candidate
- /api/provider-dispatch-human-approval-token-issuance-candidate-policy

## Sicherheitsinvarianten
- providerDispatchHumanApprovalTokenIssuanceCandidatePrepared=true
- humanApprovalTokenIssuanceCandidatePrepared=true
- humanApprovalTokenIssuanceCandidatePersisted=true
- humanApprovalTokenReadyForIssuanceReview=true
- humanApprovalTokenReadyForHumanApproval=true
- humanApprovalTokenIssued=false
- humanApprovalTokenActivated=false
- humanApprovalTokenConsumed=false
- approvalPolicyConfirmedForHumanApprovalOnly=true
- approvalCandidateReadyForHumanApproval=true
- approvalCandidateApproved=false
- approvalCandidateExecuted=false
- approvalCandidateContainsProviderResponse=false
- approvalCandidateContainsPromptPayload=false
- approvalCandidateContainsSecrets=false
- releaseCandidateReadyForHumanReview=true
- releaseCandidateApproved=false
- releaseCandidateExecuted=false
- releaseCandidateContainsProviderResponse=false
- releaseCandidateContainsPromptPayload=false
- releaseCandidateContainsSecrets=false
- finalDispatchAllowed=false
- providerDispatchPerformed=false
- commandEnvelopeExecuted=false
- executionGateOpen=false
- metadataOnly=true
- provider=none
- modelSelected=none
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
Provider Dispatch Human Approval Token Issuance Candidate ist vorbereitet, persistiert, per Policy prüfbar, auditierbar und im Dashboard sichtbar. Der Candidate ist ausschließlich Issuance-Review-ready. Der Human Approval Token bleibt Human-Approval-ready, aber nicht issued, nicht aktiviert und nicht konsumiert. Kein Approval, keine Execution, kein Provider Dispatch und kein externer Provider-/Netzwerk-Aufruf.

## Cleanup-Hinweis
In Phase 40 und 41 wurden temporäre Rescue-/Hotfix-Skripte für beschädigte Patch-/Line-Ending-Folgen erstellt. Diese können später in einem separaten Cleanup konsolidiert oder entfernt werden. Nicht während des laufenden Provider-Dispatch-Gates ohne Verify/Build/Smoke anfassen.

## Nächster Schritt
Phase 45.0 – Controlled Provider Dispatch Human Approval Token Issuance Confirmation / Still No Provider Call
`;

const runbook = `# Runbook – Phase 44 Final Provider Dispatch Human Approval Token Issuance Candidate Handoff

## Verify
\`\`\`powershell
npm run phase44:3:verify
npm run llm:provider-dispatch-human-approval-token-issuance-candidate:final:check
npm run build
\`\`\`

## Optional Smoke
\`\`\`powershell
npm run stack:health
npm run phase44:2:smoke
\`\`\`

## Sicherheit
Phase 44 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte, keinen sensiblen Request Body und keine Provider Response. Der Issuance Candidate bleibt nur review-ready. Der Human Approval Token bleibt nicht issued, nicht aktiviert und nicht konsumiert.
`;

const handoff = `# Next Chat Handoff – Phase 45

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Zusammenarbeit
Direkt, phasenweise und pragmatisch. Erst Patch, Verify, Build. Docker/Smoke nur für Browser-/API-Erreichbarkeit. Bei Fehlern reicht der relevante Fehlerblock. Dominik bevorzugt klare, ehrliche Kommunikation über technische Zwischenschritte, zusätzlichen Aufwand, Zweck der Maßnahmen und späteres Aufräumen.

## Aktueller Stand
Phase 44 ist abgeschlossen, sobald Phase 44.3 committed ist.

## Letzte abgeschlossene Kette
- Provider Dispatch Release Candidate Envelope
- Provider Dispatch Release Candidate Envelope Policy & Audit
- Provider Dispatch Release Candidate Envelope Dashboard & Smoke
- Provider Dispatch Approval Candidate Envelope
- Provider Dispatch Approval Candidate Envelope Policy & Audit
- Provider Dispatch Approval Candidate Envelope Dashboard & Smoke
- Provider Dispatch Approval Policy Confirmation Envelope
- Provider Dispatch Approval Policy Confirmation Policy & Audit
- Provider Dispatch Approval Policy Confirmation Dashboard & Smoke
- Provider Dispatch Human Approval Token Envelope
- Provider Dispatch Human Approval Token Policy & Audit
- Provider Dispatch Human Approval Token Dashboard & Smoke
- Provider Dispatch Human Approval Token Issuance Candidate
- Provider Dispatch Human Approval Token Issuance Candidate Policy & Audit
- Provider Dispatch Human Approval Token Issuance Candidate Dashboard & Smoke

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
- Approval Candidate ist Human-Approval-ready
- Approval Candidate ist nicht approved
- Approval Candidate ist nicht ausgeführt
- Approval Policy Confirmation bestätigt nur Human-Approval-only
- Human Approval Token ist Human-Approval-ready
- Human Approval Token Issuance Candidate ist review-ready
- Human Approval Token ist nicht issued
- Human Approval Token ist nicht aktiviert
- Human Approval Token ist nicht konsumiert
- keine Secret-Werte im UI/Storage
- provider=none
- modelSelected=none
- dryRunOnly=true

## Bekannte technische Notiz
Während Phase 40.2 und 41.2 gab es beschädigte Patch-/Line-Ending-Folgen. Diese wurden repariert und Build/Smoke wurden grün. Temporäre Rescue-Skripte sind noch im Repo. Cleanup separat planen, nicht in einer Feature-Phase nebenbei.

## Nächster Block
Phase 45.0 – Controlled Provider Dispatch Human Approval Token Issuance Confirmation / Still No Provider Call

Vorgeschlagener Start:
\`\`\`powershell
cd C:\\Users\\User\\ai-assistant\\agent_creator
git status --short
npm run build
\`\`\`
Dann mit Phase 45.0 fortfahren.
`;

patchPackage();
ensure("phase44-3-final-provider-dispatch-human-approval-token-issuance-candidate-handoff-release-summary.md", summary);
ensure("docs/phase44-final-provider-dispatch-human-approval-token-issuance-candidate-handoff-runbook.md", runbook);
ensure("next-chat-handoff-phase45.md", handoff);
console.log("Phase 44.3 Patch abgeschlossen.");
