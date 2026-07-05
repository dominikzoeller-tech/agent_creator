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
  pkg.scripts["phase46:3:patch"] = "node scripts/phase46-3-patch-final-provider-dispatch-human-approval-token-issuance-ledger-handoff.cjs";
  pkg.scripts["phase46:3:verify"] = "node scripts/phase46-3-verify-final-provider-dispatch-human-approval-token-issuance-ledger-handoff.cjs";
  pkg.scripts["llm:provider-dispatch-human-approval-token-issuance-ledger:final:check"] = "npm run phase46:0:verify && npm run phase46:1:verify && npm run phase46:2:verify && npm run build";
  write(file, JSON.stringify(pkg, null, 2) + "\n");
}

const summary = `# Phase 46.3 – Final Provider Dispatch Human Approval Token Issuance Ledger Handoff / Release Summary

## Ziel
Phase 46 schließt den Provider Dispatch Human Approval Token Issuance Ledger Block ab.

## Abgeschlossen
- Phase 46.0 – Controlled Provider Dispatch Human Approval Token Issuance Ledger / Still No Provider Call
- Phase 46.0a – Hotfix Issuance Ledger Store Newlines
- Phase 46.1 – Provider Dispatch Human Approval Token Issuance Ledger Policy & Audit
- Phase 46.2 – Provider Dispatch Human Approval Token Issuance Ledger Dashboard & Smoke
- Phase 46.3 – Final Provider Dispatch Human Approval Token Issuance Ledger Handoff / Release Summary

## Wichtigste Routen
- /provider-dispatch-human-approval-token-issuance-ledger
- /provider-dispatch-human-approval-token-issuance-ledger-policy
- /provider-dispatch-human-approval-token-issuance-ledger-dashboard
- /api/provider-dispatch-human-approval-token-issuance-ledger
- /api/provider-dispatch-human-approval-token-issuance-ledger-policy

## Sicherheitsinvarianten
- providerDispatchHumanApprovalTokenIssuanceLedgerRecorded=true
- humanApprovalTokenIssuanceLedgerEntryPrepared=true
- humanApprovalTokenIssuanceLedgerEntryPersisted=true
- humanApprovalTokenIssuanceConfirmedForReviewOnly=true
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
Provider Dispatch Human Approval Token Issuance Ledger ist vorbereitet, persistiert, per Policy prüfbar, auditierbar und im Dashboard sichtbar. Der Ledger dokumentiert ausschließlich Review-only Confirmation und bleibt metadata-only. Der Human Approval Token bleibt nicht issued, nicht aktiviert und nicht konsumiert. Kein Approval, keine Execution, kein Provider Dispatch und kein externer Provider-/Netzwerk-Aufruf.

## Technische Notiz
Phase 45.2a und Phase 46.0a reparierten beschädigte generierte Newline-/Regex-Ausgaben in Policy-/Ledger-Stores. Ursache war nicht Docker, sondern kaputte TS-Ausgabe in generierten Patch-Dateien. Docker zeigte den Next.js-Build-Fehler korrekt an.

## Cleanup-Hinweis
In Phase 40/41 sowie Phase 45.2a/46.0a wurden Rescue-/Hotfix-Skripte angelegt. Diese später separat konsolidieren oder entfernen. Nicht während eines laufenden Provider-Dispatch-Gates ohne Verify/Build/Smoke anfassen.

## Nächster Schritt
Phase 47.0 – Controlled Provider Dispatch Human Approval Token Issuance Receipt / Still No Provider Call
`;

const runbook = `# Runbook – Phase 46 Final Provider Dispatch Human Approval Token Issuance Ledger Handoff

## Verify
\`\`\`powershell
npm run phase46:3:verify
npm run llm:provider-dispatch-human-approval-token-issuance-ledger:final:check
npm run build
\`\`\`

## Optional Smoke
\`\`\`powershell
npm run stack:health
npm run phase46:2:smoke
\`\`\`

## Sicherheit
Phase 46 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte, keinen sensiblen Request Body und keine Provider Response. Der Issuance Ledger bleibt ledger-only, review-only und metadata-only. Der Human Approval Token bleibt nicht issued, nicht aktiviert und nicht konsumiert.
`;

const handoff = `# Next Chat Handoff – Phase 47

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Zusammenarbeit
Direkt, phasenweise und pragmatisch. Erst Patch, Verify, Build. Docker/Smoke nur für Browser-/API-Erreichbarkeit. Bei Fehlern reicht der relevante Fehlerblock. Dominik bevorzugt klare, ehrliche Kommunikation über technische Zwischenschritte, zusätzlichen Aufwand, Zweck der Maßnahmen und späteres Aufräumen.

## Aktueller Stand
Phase 46 ist abgeschlossen, sobald Phase 46.3 committed ist.

## Letzte abgeschlossene Kette
- Provider Dispatch Human Approval Token Issuance Candidate
- Provider Dispatch Human Approval Token Issuance Candidate Policy & Audit
- Provider Dispatch Human Approval Token Issuance Candidate Dashboard & Smoke
- Provider Dispatch Human Approval Token Issuance Confirmation
- Provider Dispatch Human Approval Token Issuance Confirmation Policy & Audit
- Provider Dispatch Human Approval Token Issuance Confirmation Dashboard & Smoke
- Provider Dispatch Human Approval Token Issuance Ledger
- Provider Dispatch Human Approval Token Issuance Ledger Policy & Audit
- Provider Dispatch Human Approval Token Issuance Ledger Dashboard & Smoke

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
- Human Approval Token Issuance Confirmation ist review-only
- Human Approval Token Issuance Ledger ist ledger-only und review-only
- Human Approval Token ist nicht issued
- Human Approval Token ist nicht aktiviert
- Human Approval Token ist nicht konsumiert
- keine Secret-Werte im UI/Storage
- provider=none
- modelSelected=none
- dryRunOnly=true

## Bekannte technische Notiz
Während Phase 40/41 sowie Phase 45.2a/46.0a gab es beschädigte Patch-/Line-Ending-/Newline-Folgen. Diese wurden repariert. Temporäre Rescue-/Hotfix-Skripte sind noch im Repo. Cleanup separat planen, nicht in einer Feature-Phase nebenbei.

## Nächster Block
Phase 47.0 – Controlled Provider Dispatch Human Approval Token Issuance Receipt / Still No Provider Call

Vorgeschlagener Start:
\`\`\`powershell
cd C:\\Users\\User\\ai-assistant\\agent_creator
git status --short
npm run build
\`\`\`
Dann mit Phase 47.0 fortfahren.
`;

patchPackage();
ensure("phase46-3-final-provider-dispatch-human-approval-token-issuance-ledger-handoff-release-summary.md", summary);
ensure("docs/phase46-final-provider-dispatch-human-approval-token-issuance-ledger-handoff-runbook.md", runbook);
ensure("next-chat-handoff-phase47.md", handoff);
console.log("Phase 46.3 Patch abgeschlossen.");
