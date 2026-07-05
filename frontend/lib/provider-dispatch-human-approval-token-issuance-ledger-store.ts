import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchHumanApprovalTokenIssuanceLedgerDecision =
  | "provider_dispatch_human_approval_token_issuance_ledger_recorded_no_provider_call"
  | "blocked_missing_human_approval_token_issuance_confirmation"
  | "blocked_issuance_confirmation_not_review_only"
  | "blocked_token_issued"
  | "blocked_token_activated"
  | "blocked_token_consumed"
  | "blocked_approval_candidate_approved"
  | "blocked_approval_candidate_executed"
  | "blocked_execution_or_dispatch_enabled"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_secret_values_included";

export interface ProviderDispatchHumanApprovalTokenIssuanceLedgerEntry {
  id: string;
  timestamp: string;
  providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId?: string;
  providerDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulationId?: string;
  providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId?: string;
  providerDispatchHumanApprovalTokenEnvelopeId?: string;
  decision: ProviderDispatchHumanApprovalTokenIssuanceLedgerDecision;
  ledgerMode: "controlled_provider_dispatch_human_approval_token_issuance_ledger_no_provider_call";
  providerDispatchHumanApprovalTokenIssuanceLedgerRecorded: true;
  humanApprovalTokenIssuanceLedgerEntryPrepared: true;
  humanApprovalTokenIssuanceLedgerEntryPersisted: true;
  humanApprovalTokenIssuanceConfirmedForReviewOnly: true;
  humanApprovalTokenReadyForIssuanceReview: true;
  humanApprovalTokenReadyForHumanApproval: true;
  humanApprovalTokenIssued: false;
  humanApprovalTokenActivated: false;
  humanApprovalTokenConsumed: false;
  approvalPolicyConfirmedForHumanApprovalOnly: true;
  approvalCandidateReadyForHumanApproval: true;
  approvalCandidateApproved: false;
  approvalCandidateExecuted: false;
  approvalCandidateContainsProviderResponse: false;
  approvalCandidateContainsPromptPayload: false;
  approvalCandidateContainsSecrets: false;
  releaseCandidateReadyForHumanReview: true;
  releaseCandidateApproved: false;
  releaseCandidateExecuted: false;
  finalDispatchAllowed: false;
  providerDispatchPerformed: false;
  commandEnvelopeExecuted: false;
  executionGateOpen: false;
  metadataOnly: true;
  provider: "none";
  modelSelected: "none";
  promptPayloadIncluded: false;
  promptIncluded: false;
  providerResponseIncluded: false;
  providerResultIncluded: false;
  secretValuesIncluded: false;
  requestBodyIncluded: false;
  sensitiveRequestBodyIncluded: false;
  networkCallAllowed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function confirmationPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-confirmation-envelopes.jsonl"); }
function ledgerPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-ledger.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split("
").map((line) => line.trim()).filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
function appendEntry(entry: ProviderDispatchHumanApprovalTokenIssuanceLedgerEntry): void { ensureStore(); appendFileSync(ledgerPath(), JSON.stringify(entry) + "
", "utf8"); }

export function listProviderDispatchHumanApprovalTokenIssuanceLedgerEntries(limit = 100): ProviderDispatchHumanApprovalTokenIssuanceLedgerEntry[] {
  ensureStore();
  return readJsonl(ledgerPath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function createProviderDispatchHumanApprovalTokenIssuanceLedgerEntry(input: { providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchHumanApprovalTokenIssuanceLedgerEntry {
  ensureStore();
  const confirmations = readJsonl(confirmationPath());
  const confirmation = input.providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId ? confirmations.find((entry: any) => entry.id === input.providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId) : confirmations[0];
  let decision: ProviderDispatchHumanApprovalTokenIssuanceLedgerDecision = "provider_dispatch_human_approval_token_issuance_ledger_recorded_no_provider_call";
  let reason = "Human Approval Token Issuance Ledger wurde metadata-only geschrieben. Ledger dokumentiert nur Review-only Confirmation. Token bleibt nicht issued, nicht aktiviert und nicht konsumiert. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.";
  if (!confirmation) { decision = "blocked_missing_human_approval_token_issuance_confirmation"; reason = "Issuance Confirmation fehlt."; }
  else if (confirmation.humanApprovalTokenIssuanceConfirmedForReviewOnly !== true) { decision = "blocked_issuance_confirmation_not_review_only"; reason = "Issuance Confirmation ist nicht review-only."; }
  else if (confirmation.humanApprovalTokenIssued !== false) { decision = "blocked_token_issued"; reason = "Human Approval Token wurde issued."; }
  else if (confirmation.humanApprovalTokenActivated !== false) { decision = "blocked_token_activated"; reason = "Human Approval Token wurde aktiviert."; }
  else if (confirmation.humanApprovalTokenConsumed !== false) { decision = "blocked_token_consumed"; reason = "Human Approval Token wurde konsumiert."; }
  else if (confirmation.approvalCandidateApproved !== false) { decision = "blocked_approval_candidate_approved"; reason = "Approval Candidate ist approved."; }
  else if (confirmation.approvalCandidateExecuted !== false) { decision = "blocked_approval_candidate_executed"; reason = "Approval Candidate ist ausgeführt."; }
  else if (confirmation.finalDispatchAllowed !== false || confirmation.providerDispatchPerformed !== false || confirmation.commandEnvelopeExecuted !== false || confirmation.executionGateOpen !== false || confirmation.executionAllowed !== false || confirmation.toolExecutionAllowed !== false || confirmation.agentExecutionAllowed !== false || confirmation.dryRunOnly !== true) { decision = "blocked_execution_or_dispatch_enabled"; reason = "Dispatch oder Execution ist aktiv."; }
  else if (confirmation.networkCallAllowed !== false || confirmation.networkCallPerformed !== false || confirmation.providerExecutionAllowed !== false || confirmation.llmCallPerformed !== false) { decision = "blocked_network_or_provider_execution_attempt"; reason = "Netzwerk-/Provider-Ausführung erkannt."; }
  else if (confirmation.secretValuesIncluded !== false || confirmation.noSecretsIncluded !== true || containsSecretValue(confirmation)) { decision = "blocked_secret_values_included"; reason = "Secret Boundary verletzt."; }

  const entry: ProviderDispatchHumanApprovalTokenIssuanceLedgerEntry = {
    id: makeId("provider-dispatch-human-approval-token-issuance-ledger"), timestamp: new Date().toISOString(),
    providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId: confirmation?.id || input.providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId,
    providerDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulationId: confirmation?.providerDispatchHumanApprovalTokenIssuanceCandidatePolicySimulationId,
    providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId: confirmation?.providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId,
    providerDispatchHumanApprovalTokenEnvelopeId: confirmation?.providerDispatchHumanApprovalTokenEnvelopeId,
    decision, ledgerMode: "controlled_provider_dispatch_human_approval_token_issuance_ledger_no_provider_call",
    providerDispatchHumanApprovalTokenIssuanceLedgerRecorded: true, humanApprovalTokenIssuanceLedgerEntryPrepared: true, humanApprovalTokenIssuanceLedgerEntryPersisted: true,
    humanApprovalTokenIssuanceConfirmedForReviewOnly: true, humanApprovalTokenReadyForIssuanceReview: true, humanApprovalTokenReadyForHumanApproval: true,
    humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false,
    approvalPolicyConfirmedForHumanApprovalOnly: true, approvalCandidateReadyForHumanApproval: true, approvalCandidateApproved: false, approvalCandidateExecuted: false,
    approvalCandidateContainsProviderResponse: false, approvalCandidateContainsPromptPayload: false, approvalCandidateContainsSecrets: false,
    releaseCandidateReadyForHumanReview: true, releaseCandidateApproved: false, releaseCandidateExecuted: false,
    finalDispatchAllowed: false, providerDispatchPerformed: false, commandEnvelopeExecuted: false, executionGateOpen: false,
    metadataOnly: true, provider: "none", modelSelected: "none", promptPayloadIncluded: false, promptIncluded: false, providerResponseIncluded: false, providerResultIncluded: false,
    secretValuesIncluded: false, requestBodyIncluded: false, sensitiveRequestBodyIncluded: false,
    networkCallAllowed: false, networkCallPerformed: false, providerExecutionAllowed: false, realLlmCallAllowed: false, llmCallPerformed: false,
    executionAllowed: false, toolExecutionAllowed: false, agentExecutionAllowed: false, dryRunOnly: true,
    noSecretsIncluded: decision !== "blocked_secret_values_included", reason,
    metadata: { ...(input.metadata || {}), phase: "46.0", noProviderCall: true, noNetworkCall: true, noDispatch: true, ledgerOnly: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false }
  };
  appendEntry(entry);
  appendGovernanceAuditEvent({ type: "agent_registry_status_changed", actor: "api", entityType: "agent-registry", entityId: entry.providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId, status: entry.decision, riskLevel: "critical", summary: "Provider Dispatch Human Approval Token Issuance Ledger: " + entry.decision, metadata: { source: "phase46.0-provider-dispatch-human-approval-token-issuance-ledger", ledgerEntryId: entry.id, ledgerOnly: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false } });
  return entry;
}

export function summarizeProviderDispatchHumanApprovalTokenIssuanceLedgerEntries(entries: ProviderDispatchHumanApprovalTokenIssuanceLedgerEntry[]) { const byDecision: Record<string, number> = {}; for (const item of entries) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1; return { total: entries.length, byDecision }; }
