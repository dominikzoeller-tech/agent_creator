import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchApprovalPolicyConfirmationDecision =
  | "provider_dispatch_approval_policy_confirmation_envelope_prepared_no_provider_call"
  | "blocked_missing_approval_candidate_policy_simulation"
  | "blocked_policy_did_not_allow_human_approval_only"
  | "blocked_approval_candidate_not_human_approval_ready"
  | "blocked_approval_candidate_approved"
  | "blocked_approval_candidate_executed"
  | "blocked_approval_candidate_contains_provider_response"
  | "blocked_approval_candidate_contains_prompt_payload"
  | "blocked_approval_candidate_contains_secrets"
  | "blocked_execution_or_dispatch_enabled"
  | "blocked_network_or_provider_execution_attempt";

export interface ProviderDispatchApprovalPolicyConfirmationEnvelope {
  id: string;
  timestamp: string;
  providerDispatchApprovalCandidateEnvelopePolicySimulationId?: string;
  providerDispatchApprovalCandidateEnvelopeId?: string;
  providerDispatchReleaseCandidateEnvelopeId?: string;
  decision: ProviderDispatchApprovalPolicyConfirmationDecision;
  envelopeMode: "controlled_provider_dispatch_approval_policy_confirmation_envelope_no_provider_call";
  providerDispatchApprovalPolicyConfirmationEnvelopePrepared: true;
  approvalPolicyConfirmationEnvelopePrepared: true;
  approvalPolicyConfirmationEnvelopePersisted: true;
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
function policySimulationPath(): string {
  return path.join(dataDir(), "provider-dispatch-approval-candidate-envelope-policy-simulations.jsonl");
}
function confirmationPath(): string {
  return path.join(dataDir(), "provider-dispatch-approval-policy-confirmation-envelopes.jsonl");
}
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] {
  try {
    return readFileSync(file, "utf8").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}
function makeId(prefix: string): string {
  return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8);
}
function appendEnvelope(envelope: ProviderDispatchApprovalPolicyConfirmationEnvelope): void {
  ensureStore();
  appendFileSync(confirmationPath(), JSON.stringify(envelope) + "\n", "utf8");
}
function containsSecretValue(value: unknown): boolean {
  return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {}));
}

export function listProviderDispatchApprovalPolicyConfirmationEnvelopes(limit = 100): ProviderDispatchApprovalPolicyConfirmationEnvelope[] {
  ensureStore();
  return readJsonl(confirmationPath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function createProviderDispatchApprovalPolicyConfirmationEnvelope(input: { providerDispatchApprovalCandidateEnvelopePolicySimulationId?: string; metadata?: Record<string, unknown> }): ProviderDispatchApprovalPolicyConfirmationEnvelope {
  ensureStore();
  const simulations = readJsonl(policySimulationPath());
  const simulation = input.providerDispatchApprovalCandidateEnvelopePolicySimulationId
    ? simulations.find((entry: any) => entry.id === input.providerDispatchApprovalCandidateEnvelopePolicySimulationId)
    : simulations[0];

  let decision: ProviderDispatchApprovalPolicyConfirmationDecision = "provider_dispatch_approval_policy_confirmation_envelope_prepared_no_provider_call";
  let reason = "Approval Policy Confirmation Envelope wurde vorbereitet. Es bestätigt nur Human-Approval-only Policy, ohne Approval, ohne Execution, ohne Provider Dispatch und ohne Provider-/Netzwerk-Aufruf.";

  if (!simulation) {
    decision = "blocked_missing_approval_candidate_policy_simulation";
    reason = "Approval Candidate Policy Simulation fehlt.";
  } else if (simulation.decision !== "provider_dispatch_approval_candidate_envelope_policy_allowed_human_approval_only_no_provider_call") {
    decision = "blocked_policy_did_not_allow_human_approval_only";
    reason = "Policy Simulation erlaubt Human-Approval-only nicht.";
  } else if (simulation.approvalCandidateReadyForHumanApproval !== true) {
    decision = "blocked_approval_candidate_not_human_approval_ready";
    reason = "Approval Candidate ist nicht Human-Approval-ready.";
  } else if (simulation.approvalCandidateApproved !== false) {
    decision = "blocked_approval_candidate_approved";
    reason = "Approval Candidate wurde approved.";
  } else if (simulation.approvalCandidateExecuted !== false) {
    decision = "blocked_approval_candidate_executed";
    reason = "Approval Candidate wurde ausgeführt.";
  } else if (simulation.approvalCandidateContainsProviderResponse !== false || simulation.providerResponseIncluded !== false || simulation.providerResultIncluded !== false) {
    decision = "blocked_approval_candidate_contains_provider_response";
    reason = "Approval Candidate enthält Provider Response oder Provider Result.";
  } else if (simulation.approvalCandidateContainsPromptPayload !== false || simulation.promptPayloadIncluded !== false || simulation.promptIncluded !== false) {
    decision = "blocked_approval_candidate_contains_prompt_payload";
    reason = "Approval Candidate enthält Prompt Payload.";
  } else if (simulation.approvalCandidateContainsSecrets !== false || simulation.secretValuesIncluded !== false || simulation.noSecretsIncluded !== true || containsSecretValue(simulation)) {
    decision = "blocked_approval_candidate_contains_secrets";
    reason = "Approval Candidate enthält Secret-Werte.";
  } else if (simulation.finalDispatchAllowed !== false || simulation.providerDispatchPerformed !== false || simulation.commandEnvelopeExecuted !== false || simulation.executionGateOpen !== false || simulation.executionAllowed !== false || simulation.toolExecutionAllowed !== false || simulation.agentExecutionAllowed !== false || simulation.dryRunOnly !== true) {
    decision = "blocked_execution_or_dispatch_enabled";
    reason = "Dispatch oder Execution ist aktiv.";
  } else if (simulation.networkCallAllowed !== false || simulation.networkCallPerformed !== false || simulation.providerExecutionAllowed !== false || simulation.llmCallPerformed !== false) {
    decision = "blocked_network_or_provider_execution_attempt";
    reason = "Netzwerk-/Provider-Ausführung erkannt.";
  }

  const envelope: ProviderDispatchApprovalPolicyConfirmationEnvelope = {
    id: makeId("provider-dispatch-approval-policy-confirmation-envelope"),
    timestamp: new Date().toISOString(),
    providerDispatchApprovalCandidateEnvelopePolicySimulationId: simulation?.id || input.providerDispatchApprovalCandidateEnvelopePolicySimulationId,
    providerDispatchApprovalCandidateEnvelopeId: simulation?.providerDispatchApprovalCandidateEnvelopeId,
    providerDispatchReleaseCandidateEnvelopeId: simulation?.providerDispatchReleaseCandidateEnvelopeId,
    decision,
    envelopeMode: "controlled_provider_dispatch_approval_policy_confirmation_envelope_no_provider_call",
    providerDispatchApprovalPolicyConfirmationEnvelopePrepared: true,
    approvalPolicyConfirmationEnvelopePrepared: true,
    approvalPolicyConfirmationEnvelopePersisted: true,
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
    noSecretsIncluded: decision !== "blocked_approval_candidate_contains_secrets",
    reason,
    metadata: { ...(input.metadata || {}), phase: "42.0", noProviderCall: true, noNetworkCall: true, noDispatch: true, approvalPolicyConfirmedForHumanApprovalOnly: true, approvalCandidateApproved: false, approvalCandidateExecuted: false }
  };

  appendEnvelope(envelope);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: envelope.providerDispatchApprovalCandidateEnvelopePolicySimulationId,
    status: envelope.decision,
    riskLevel: "critical",
    summary: "Provider Dispatch Approval Policy Confirmation Envelope: " + envelope.decision,
    metadata: { source: "phase42.0-provider-dispatch-approval-policy-confirmation-envelope", envelopeId: envelope.id, approvalPolicyConfirmedForHumanApprovalOnly: true, approvalCandidateApproved: false, approvalCandidateExecuted: false, networkCallAllowed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false }
  });
  return envelope;
}

export function summarizeProviderDispatchApprovalPolicyConfirmationEnvelopes(envelopes: ProviderDispatchApprovalPolicyConfirmationEnvelope[]) {
  const byDecision: Record<string, number> = {};
  for (const item of envelopes) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1;
  return { total: envelopes.length, byDecision };
}
