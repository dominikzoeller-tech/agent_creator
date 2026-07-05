import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementDecision =
  | "provider_dispatch_human_approval_token_issuance_receipt_acknowledgement_recorded_no_provider_call"
  | "blocked_missing_human_approval_token_issuance_receipt"
  | "blocked_receipt_not_recorded"
  | "blocked_receipt_not_review_only"
  | "blocked_token_issued"
  | "blocked_token_activated"
  | "blocked_token_consumed"
  | "blocked_approval_candidate_approved"
  | "blocked_approval_candidate_executed"
  | "blocked_execution_or_dispatch_enabled"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_secret_values_included";

export interface ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgement {
  id: string;
  timestamp: string;
  providerDispatchHumanApprovalTokenIssuanceReceiptId?: string;
  providerDispatchHumanApprovalTokenIssuanceLedgerEntryId?: string;
  providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId?: string;
  providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId?: string;
  providerDispatchHumanApprovalTokenEnvelopeId?: string;
  decision: ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementDecision;
  acknowledgementMode: "controlled_provider_dispatch_human_approval_token_issuance_receipt_acknowledgement_no_provider_call";
  providerDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementRecorded: true;
  humanApprovalTokenIssuanceReceiptAcknowledgementPrepared: true;
  humanApprovalTokenIssuanceReceiptAcknowledgementPersisted: true;
  providerDispatchHumanApprovalTokenIssuanceReceiptRecorded: true;
  humanApprovalTokenIssuanceReceiptPrepared: true;
  humanApprovalTokenIssuanceReceiptPersisted: true;
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

function dataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data");
}
function receiptPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-receipts.jsonl"); }
function acknowledgementPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-receipt-acknowledgements.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] {
  try {
    return readFileSync(file, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}
function makeId(prefix: string): string { return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function containsSecretValue(value: unknown): boolean {
  return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {}));
}
function appendAcknowledgement(value: ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgement): void {
  ensureStore();
  appendFileSync(acknowledgementPath(), JSON.stringify(value) + "\n", "utf8");
}

export function listProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgements(limit = 100): ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgement[] {
  ensureStore();
  return readJsonl(acknowledgementPath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function createProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgement(input: { providerDispatchHumanApprovalTokenIssuanceReceiptId?: string; metadata?: Record<string, unknown> }): ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgement {
  ensureStore();
  const receipts = readJsonl(receiptPath());
  const receipt = input.providerDispatchHumanApprovalTokenIssuanceReceiptId ? receipts.find((entry: any) => entry.id === input.providerDispatchHumanApprovalTokenIssuanceReceiptId) : receipts[0];
  let decision: ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementDecision = "provider_dispatch_human_approval_token_issuance_receipt_acknowledgement_recorded_no_provider_call";
  let reason = "Human Approval Token Issuance Receipt Acknowledgement wurde metadata-only geschrieben. Acknowledgement bestätigt nur den receipt-only/review-only Nachweis. Token bleibt nicht issued, nicht aktiviert und nicht konsumiert. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.";

  if (!receipt) { decision = "blocked_missing_human_approval_token_issuance_receipt"; reason = "Issuance Receipt fehlt."; }
  else if (receipt.providerDispatchHumanApprovalTokenIssuanceReceiptRecorded !== true || receipt.humanApprovalTokenIssuanceReceiptPrepared !== true || receipt.humanApprovalTokenIssuanceReceiptPersisted !== true) { decision = "blocked_receipt_not_recorded"; reason = "Receipt ist nicht vollständig recorded/prepared/persisted."; }
  else if (receipt.providerDispatchHumanApprovalTokenIssuanceLedgerRecorded !== true || receipt.humanApprovalTokenIssuanceConfirmedForReviewOnly !== true) { decision = "blocked_receipt_not_review_only"; reason = "Receipt dokumentiert keine ledger-only/review-only Chain."; }
  else if (receipt.humanApprovalTokenIssued !== false) { decision = "blocked_token_issued"; reason = "Human Approval Token wurde issued."; }
  else if (receipt.humanApprovalTokenActivated !== false) { decision = "blocked_token_activated"; reason = "Human Approval Token wurde aktiviert."; }
  else if (receipt.humanApprovalTokenConsumed !== false) { decision = "blocked_token_consumed"; reason = "Human Approval Token wurde konsumiert."; }
  else if (receipt.approvalCandidateApproved !== false) { decision = "blocked_approval_candidate_approved"; reason = "Approval Candidate ist approved."; }
  else if (receipt.approvalCandidateExecuted !== false) { decision = "blocked_approval_candidate_executed"; reason = "Approval Candidate ist ausgeführt."; }
  else if (receipt.finalDispatchAllowed !== false || receipt.providerDispatchPerformed !== false || receipt.commandEnvelopeExecuted !== false || receipt.executionGateOpen !== false || receipt.executionAllowed !== false || receipt.toolExecutionAllowed !== false || receipt.agentExecutionAllowed !== false || receipt.dryRunOnly !== true) { decision = "blocked_execution_or_dispatch_enabled"; reason = "Dispatch oder Execution ist aktiv."; }
  else if (receipt.networkCallAllowed !== false || receipt.networkCallPerformed !== false || receipt.providerExecutionAllowed !== false || receipt.llmCallPerformed !== false) { decision = "blocked_network_or_provider_execution_attempt"; reason = "Netzwerk-/Provider-Ausführung erkannt."; }
  else if (receipt.secretValuesIncluded !== false || receipt.noSecretsIncluded !== true || containsSecretValue(receipt)) { decision = "blocked_secret_values_included"; reason = "Secret Boundary verletzt."; }

  const acknowledgement: ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgement = {
    id: makeId("provider-dispatch-human-approval-token-issuance-receipt-acknowledgement"),
    timestamp: new Date().toISOString(),
    providerDispatchHumanApprovalTokenIssuanceReceiptId: receipt?.id || input.providerDispatchHumanApprovalTokenIssuanceReceiptId,
    providerDispatchHumanApprovalTokenIssuanceLedgerEntryId: receipt?.providerDispatchHumanApprovalTokenIssuanceLedgerEntryId,
    providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId: receipt?.providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId,
    providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId: receipt?.providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId,
    providerDispatchHumanApprovalTokenEnvelopeId: receipt?.providerDispatchHumanApprovalTokenEnvelopeId,
    decision,
    acknowledgementMode: "controlled_provider_dispatch_human_approval_token_issuance_receipt_acknowledgement_no_provider_call",
    providerDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementRecorded: true,
    humanApprovalTokenIssuanceReceiptAcknowledgementPrepared: true,
    humanApprovalTokenIssuanceReceiptAcknowledgementPersisted: true,
    providerDispatchHumanApprovalTokenIssuanceReceiptRecorded: true,
    humanApprovalTokenIssuanceReceiptPrepared: true,
    humanApprovalTokenIssuanceReceiptPersisted: true,
    providerDispatchHumanApprovalTokenIssuanceLedgerRecorded: true,
    humanApprovalTokenIssuanceLedgerEntryPrepared: true,
    humanApprovalTokenIssuanceLedgerEntryPersisted: true,
    humanApprovalTokenIssuanceConfirmedForReviewOnly: true,
    humanApprovalTokenReadyForIssuanceReview: true,
    humanApprovalTokenReadyForHumanApproval: true,
    humanApprovalTokenIssued: false,
    humanApprovalTokenActivated: false,
    humanApprovalTokenConsumed: false,
    approvalPolicyConfirmedForHumanApprovalOnly: true,
    approvalCandidateReadyForHumanApproval: true,
    approvalCandidateApproved: false,
    approvalCandidateExecuted: false,
    approvalCandidateContainsProviderResponse: false,
    approvalCandidateContainsPromptPayload: false,
    approvalCandidateContainsSecrets: false,
    releaseCandidateReadyForHumanReview: true,
    releaseCandidateApproved: false,
    releaseCandidateExecuted: false,
    finalDispatchAllowed: false,
    providerDispatchPerformed: false,
    commandEnvelopeExecuted: false,
    executionGateOpen: false,
    metadataOnly: true,
    provider: "none",
    modelSelected: "none",
    promptPayloadIncluded: false,
    promptIncluded: false,
    providerResponseIncluded: false,
    providerResultIncluded: false,
    secretValuesIncluded: false,
    requestBodyIncluded: false,
    sensitiveRequestBodyIncluded: false,
    networkCallAllowed: false,
    networkCallPerformed: false,
    providerExecutionAllowed: false,
    realLlmCallAllowed: false,
    llmCallPerformed: false,
    executionAllowed: false,
    toolExecutionAllowed: false,
    agentExecutionAllowed: false,
    dryRunOnly: true,
    noSecretsIncluded: decision !== "blocked_secret_values_included",
    reason,
    metadata: { ...(input.metadata || {}), phase: "48.0", noProviderCall: true, noNetworkCall: true, noDispatch: true, acknowledgementOnly: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false }
  };
  appendAcknowledgement(acknowledgement);
  appendGovernanceAuditEvent({ type: "agent_registry_status_changed", actor: "api", entityType: "agent-registry", entityId: acknowledgement.providerDispatchHumanApprovalTokenIssuanceReceiptId, status: acknowledgement.decision, riskLevel: "critical", summary: "Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement: " + acknowledgement.decision, metadata: { source: "phase48.0-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement", acknowledgementId: acknowledgement.id, acknowledgementOnly: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false } });
  return acknowledgement;
}

export function summarizeProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgements(items: ProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgement[]) {
  const byDecision: Record<string, number> = {};
  for (const item of items) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1;
  return { total: items.length, byDecision };
}
