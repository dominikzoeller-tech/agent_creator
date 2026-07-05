import { appendFileSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulation = {
  id: string;
  sourceReceiptId: string;
  createdAt: string;
  policyMode: "human_approval_token_issuance_receipt_policy_audit_only";
  decision: "simulation_allowed_receipt_review_only_no_provider_call" | "simulation_blocked_missing_receipt_reference";
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
  checks: Array<{ key: string; passed: boolean; detail: string }>;
};

function dataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data");
}
function receiptPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-receipts.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-receipt-policy-simulations.jsonl"); }
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
function appendSimulation(simulation: ProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulation): void {
  ensureStore();
  appendFileSync(simulationPath(), JSON.stringify(simulation) + "\n", "utf8");
}

export function listProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulations(limit = 50): ProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulation[] {
  ensureStore();
  return readJsonl(simulationPath()).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function simulateProviderDispatchHumanApprovalTokenIssuanceReceiptPolicy(sourceReceiptId?: string): ProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulation {
  ensureStore();
  const receipts = readJsonl(receiptPath());
  const source = sourceReceiptId ? receipts.find((entry: any) => entry.id === sourceReceiptId) : receipts[0];
  const found = Boolean(source);
  const now = new Date().toISOString();
  const simulation: ProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulation = {
    id: makeId("provider-dispatch-human-approval-token-issuance-receipt-policy"),
    sourceReceiptId: source?.id || sourceReceiptId || "none",
    createdAt: now,
    policyMode: "human_approval_token_issuance_receipt_policy_audit_only",
    decision: found ? "simulation_allowed_receipt_review_only_no_provider_call" : "simulation_blocked_missing_receipt_reference",
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
    checks: [
      { key: "receipt_recorded", passed: true, detail: "Receipt state is simulated as recorded, prepared and persisted." },
      { key: "token_not_issued", passed: true, detail: "Human Approval Token remains not issued." },
      { key: "token_not_activated", passed: true, detail: "Human Approval Token remains not activated." },
      { key: "token_not_consumed", passed: true, detail: "Human Approval Token remains not consumed." },
      { key: "no_provider_call", passed: true, detail: "Provider dispatch and network calls remain blocked." },
      { key: "dry_run_only", passed: true, detail: "Receipt policy simulation is dry-run-only." }
    ]
  };
  appendSimulation(simulation);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: simulation.sourceReceiptId,
    status: simulation.decision,
    riskLevel: "critical",
    summary: "Provider Dispatch Human Approval Token Issuance Receipt Policy simulated: " + simulation.decision,
    metadata: { source: "phase47.1-provider-dispatch-human-approval-token-issuance-receipt-policy", simulationId: simulation.id, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false }
  });
  return simulation;
}

export function summarizeProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulations(simulations: ProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulation[]) {
  const byDecision: Record<string, number> = {};
  for (const item of simulations) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1;
  return { total: simulations.length, byDecision };
}
