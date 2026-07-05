import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchHumanApprovalTokenIssuanceReceiptDecision =
  | "provider_dispatch_human_approval_token_issuance_receipt_recorded_no_provider_call"
  | "blocked_missing_human_approval_token_issuance_ledger_entry"
  | "blocked_ledger_not_recorded"
  | "blocked_ledger_not_review_only"
  | "blocked_token_issued"
  | "blocked_token_activated"
  | "blocked_token_consumed"
  | "blocked_approval_candidate_approved"
  | "blocked_approval_candidate_executed"
  | "blocked_execution_or_dispatch_enabled"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_secret_values_included";

export interface ProviderDispatchHumanApprovalTokenIssuanceReceipt {
  id: string;
  timestamp: string;
  providerDispatchHumanApprovalTokenIssuanceLedgerEntryId?: string;
  providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId?: string;
  providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId?: string;
  providerDispatchHumanApprovalTokenEnvelopeId?: string;
  decision: ProviderDispatchHumanApprovalTokenIssuanceReceiptDecision;
  receiptMode: "controlled_provider_dispatch_human_approval_token_issuance_receipt_no_provider_call";
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
function ledgerPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-ledger.jsonl"); }
function receiptPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-receipts.jsonl"); }
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
function appendReceipt(receipt: ProviderDispatchHumanApprovalTokenIssuanceReceipt): void {
  ensureStore();
  appendFileSync(receiptPath(), JSON.stringify(receipt) + "\n", "utf8");
}

export function listProviderDispatchHumanApprovalTokenIssuanceReceipts(limit = 100): ProviderDispatchHumanApprovalTokenIssuanceReceipt[] {
  ensureStore();
  return readJsonl(receiptPath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function createProviderDispatchHumanApprovalTokenIssuanceReceipt(input: { providerDispatchHumanApprovalTokenIssuanceLedgerEntryId?: string; metadata?: Record<string, unknown> }): ProviderDispatchHumanApprovalTokenIssuanceReceipt {
  ensureStore();
  const ledgers = readJsonl(ledgerPath());
  const ledger = input.providerDispatchHumanApprovalTokenIssuanceLedgerEntryId ? ledgers.find((entry: any) => entry.id === input.providerDispatchHumanApprovalTokenIssuanceLedgerEntryId) : ledgers[0];
  let decision: ProviderDispatchHumanApprovalTokenIssuanceReceiptDecision = "provider_dispatch_human_approval_token_issuance_receipt_recorded_no_provider_call";
  let reason = "Human Approval Token Issuance Receipt wurde metadata-only geschrieben. Receipt bestätigt nur den ledger-only/review-only Nachweis. Token bleibt nicht issued, nicht aktiviert und nicht konsumiert. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.";

  if (!ledger) { decision = "blocked_missing_human_approval_token_issuance_ledger_entry"; reason = "Issuance Ledger Entry fehlt."; }
  else if (ledger.providerDispatchHumanApprovalTokenIssuanceLedgerRecorded !== true || ledger.humanApprovalTokenIssuanceLedgerEntryPrepared !== true || ledger.humanApprovalTokenIssuanceLedgerEntryPersisted !== true) { decision = "blocked_ledger_not_recorded"; reason = "Ledger Entry ist nicht vollständig recorded/prepared/persisted."; }
  else if (ledger.humanApprovalTokenIssuanceConfirmedForReviewOnly !== true) { decision = "blocked_ledger_not_review_only"; reason = "Ledger dokumentiert keine review-only Confirmation."; }
  else if (ledger.humanApprovalTokenIssued !== false) { decision = "blocked_token_issued"; reason = "Human Approval Token wurde issued."; }
  else if (ledger.humanApprovalTokenActivated !== false) { decision = "blocked_token_activated"; reason = "Human Approval Token wurde aktiviert."; }
  else if (ledger.humanApprovalTokenConsumed !== false) { decision = "blocked_token_consumed"; reason = "Human Approval Token wurde konsumiert."; }
  else if (ledger.approvalCandidateApproved !== false) { decision = "blocked_approval_candidate_approved"; reason = "Approval Candidate ist approved."; }
  else if (ledger.approvalCandidateExecuted !== false) { decision = "blocked_approval_candidate_executed"; reason = "Approval Candidate ist ausgeführt."; }
  else if (ledger.finalDispatchAllowed !== false || ledger.providerDispatchPerformed !== false || ledger.commandEnvelopeExecuted !== false || ledger.executionGateOpen !== false || ledger.executionAllowed !== false || ledger.toolExecutionAllowed !== false || ledger.agentExecutionAllowed !== false || ledger.dryRunOnly !== true) { decision = "blocked_execution_or_dispatch_enabled"; reason = "Dispatch oder Execution ist aktiv."; }
  else if (ledger.networkCallAllowed !== false || ledger.networkCallPerformed !== false || ledger.providerExecutionAllowed !== false || ledger.llmCallPerformed !== false) { decision = "blocked_network_or_provider_execution_attempt"; reason = "Netzwerk-/Provider-Ausführung erkannt."; }
  else if (ledger.secretValuesIncluded !== false || ledger.noSecretsIncluded !== true || containsSecretValue(ledger)) { decision = "blocked_secret_values_included"; reason = "Secret Boundary verletzt."; }

  const receipt: ProviderDispatchHumanApprovalTokenIssuanceReceipt = {
    id: makeId("provider-dispatch-human-approval-token-issuance-receipt"),
    timestamp: new Date().toISOString(),
    providerDispatchHumanApprovalTokenIssuanceLedgerEntryId: ledger?.id || input.providerDispatchHumanApprovalTokenIssuanceLedgerEntryId,
    providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId: ledger?.providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId,
    providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId: ledger?.providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId,
    providerDispatchHumanApprovalTokenEnvelopeId: ledger?.providerDispatchHumanApprovalTokenEnvelopeId,
    decision,
    receiptMode: "controlled_provider_dispatch_human_approval_token_issuance_receipt_no_provider_call",
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
    metadata: { ...(input.metadata || {}), phase: "47.0", noProviderCall: true, noNetworkCall: true, noDispatch: true, receiptOnly: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false }
  };
  appendReceipt(receipt);
  appendGovernanceAuditEvent({ type: "agent_registry_status_changed", actor: "api", entityType: "agent-registry", entityId: receipt.providerDispatchHumanApprovalTokenIssuanceLedgerEntryId, status: receipt.decision, riskLevel: "critical", summary: "Provider Dispatch Human Approval Token Issuance Receipt: " + receipt.decision, metadata: { source: "phase47.0-provider-dispatch-human-approval-token-issuance-receipt", receiptId: receipt.id, receiptOnly: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false } });
  return receipt;
}

export function summarizeProviderDispatchHumanApprovalTokenIssuanceReceipts(receipts: ProviderDispatchHumanApprovalTokenIssuanceReceipt[]) {
  const byDecision: Record<string, number> = {};
  for (const item of receipts) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1;
  return { total: receipts.length, byDecision };
}
