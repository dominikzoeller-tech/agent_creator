import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchHumanApprovalTokenIssuanceConfirmationDecision =
  | "provider_dispatch_human_approval_token_issuance_confirmation_prepared_no_provider_call"
  | "blocked_missing_human_approval_token_issuance_candidate_policy_simulation"
  | "blocked_issuance_candidate_policy_not_allowed"
  | "blocked_issuance_candidate_not_ready_for_review"
  | "blocked_token_issued"
  | "blocked_token_activated"
  | "blocked_token_consumed"
  | "blocked_approval_candidate_approved"
  | "blocked_approval_candidate_executed"
  | "blocked_approval_candidate_contains_provider_response"
  | "blocked_approval_candidate_contains_prompt_payload"
  | "blocked_approval_candidate_contains_secrets"
  | "blocked_execution_or_dispatch_enabled"
  | "blocked_network_or_provider_execution_attempt";

export interface ProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelope {
  id: string;
  timestamp: string;
  providerDispatchHumanApprovalTokenIssuanceCandidatePolicySimulationId?: string;
  providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId?: string;
  providerDispatchHumanApprovalTokenPolicySimulationId?: string;
  providerDispatchHumanApprovalTokenEnvelopeId?: string;
  providerDispatchApprovalPolicyConfirmationEnvelopeId?: string;
  providerDispatchApprovalCandidateEnvelopeId?: string;
  providerDispatchReleaseCandidateEnvelopeId?: string;
  decision: ProviderDispatchHumanApprovalTokenIssuanceConfirmationDecision;
  envelopeMode: "controlled_provider_dispatch_human_approval_token_issuance_confirmation_no_provider_call";
  providerDispatchHumanApprovalTokenIssuanceConfirmationPrepared: true;
  humanApprovalTokenIssuanceConfirmationPrepared: true;
  humanApprovalTokenIssuanceConfirmationPersisted: true;
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
function srcPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-candidate-policy-simulations.jsonl"); }
function dstPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-confirmation-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
function appendEnvelope(envelope: ProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelope): void { ensureStore(); appendFileSync(dstPath(), JSON.stringify(envelope) + "\n", "utf8"); }

export function listProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelopes(limit = 100): ProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelope[] {
  ensureStore();
  return readJsonl(dstPath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function createProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelope(input: { providerDispatchHumanApprovalTokenIssuanceCandidatePolicySimulationId?: string; metadata?: Record<string, unknown> }): ProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelope {
  ensureStore();
  const simulations = readJsonl(srcPath());
  const simulation = input.providerDispatchHumanApprovalTokenIssuanceCandidatePolicySimulationId ? simulations.find((entry: any) => entry.id === input.providerDispatchHumanApprovalTokenIssuanceCandidatePolicySimulationId) : simulations[0];
  let decision: ProviderDispatchHumanApprovalTokenIssuanceConfirmationDecision = "provider_dispatch_human_approval_token_issuance_confirmation_prepared_no_provider_call";
  let reason = "Human Approval Token Issuance Confirmation wurde metadata-only vorbereitet. Confirmation bestätigt nur Review-only; Token bleibt nicht issued, nicht aktiviert und nicht konsumiert. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.";
  if (!simulation) { decision = "blocked_missing_human_approval_token_issuance_candidate_policy_simulation"; reason = "Issuance Candidate Policy Simulation fehlt."; }
  else if (simulation.decision !== "provider_dispatch_human_approval_token_issuance_candidate_policy_allowed_no_provider_call") { decision = "blocked_issuance_candidate_policy_not_allowed"; reason = "Issuance Candidate Policy erlaubt die Confirmation nicht."; }
  else if (simulation.humanApprovalTokenReadyForIssuanceReview !== true) { decision = "blocked_issuance_candidate_not_ready_for_review"; reason = "Issuance Candidate ist nicht review-ready."; }
  else if (simulation.humanApprovalTokenIssued !== false) { decision = "blocked_token_issued"; reason = "Human Approval Token wurde issued."; }
  else if (simulation.humanApprovalTokenActivated !== false) { decision = "blocked_token_activated"; reason = "Human Approval Token wurde aktiviert."; }
  else if (simulation.humanApprovalTokenConsumed !== false) { decision = "blocked_token_consumed"; reason = "Human Approval Token wurde konsumiert."; }
  else if (simulation.approvalCandidateApproved !== false) { decision = "blocked_approval_candidate_approved"; reason = "Approval Candidate ist approved."; }
  else if (simulation.approvalCandidateExecuted !== false) { decision = "blocked_approval_candidate_executed"; reason = "Approval Candidate ist ausgeführt."; }
  else if (simulation.approvalCandidateContainsProviderResponse !== false || simulation.providerResponseIncluded !== false || simulation.providerResultIncluded !== false) { decision = "blocked_approval_candidate_contains_provider_response"; reason = "Provider Response oder Provider Result enthalten."; }
  else if (simulation.approvalCandidateContainsPromptPayload !== false || simulation.promptPayloadIncluded !== false || simulation.promptIncluded !== false) { decision = "blocked_approval_candidate_contains_prompt_payload"; reason = "Prompt Payload enthalten."; }
  else if (simulation.approvalCandidateContainsSecrets !== false || simulation.secretValuesIncluded !== false || simulation.noSecretsIncluded !== true || containsSecretValue(simulation)) { decision = "blocked_approval_candidate_contains_secrets"; reason = "Secret-Werte enthalten."; }
  else if (simulation.finalDispatchAllowed !== false || simulation.providerDispatchPerformed !== false || simulation.commandEnvelopeExecuted !== false || simulation.executionGateOpen !== false || simulation.executionAllowed !== false || simulation.toolExecutionAllowed !== false || simulation.agentExecutionAllowed !== false || simulation.dryRunOnly !== true) { decision = "blocked_execution_or_dispatch_enabled"; reason = "Dispatch oder Execution ist aktiv."; }
  else if (simulation.networkCallAllowed !== false || simulation.networkCallPerformed !== false || simulation.providerExecutionAllowed !== false || simulation.llmCallPerformed !== false) { decision = "blocked_network_or_provider_execution_attempt"; reason = "Netzwerk-/Provider-Ausführung erkannt."; }

  const envelope: ProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelope = {
    id: makeId("provider-dispatch-human-approval-token-issuance-confirmation-envelope"), timestamp: new Date().toISOString(),
    providerDispatchHumanApprovalTokenIssuanceCandidatePolicySimulationId: simulation?.id || input.providerDispatchHumanApprovalTokenIssuanceCandidatePolicySimulationId,
    providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId: simulation?.providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId,
    providerDispatchHumanApprovalTokenPolicySimulationId: simulation?.providerDispatchHumanApprovalTokenPolicySimulationId,
    providerDispatchHumanApprovalTokenEnvelopeId: simulation?.providerDispatchHumanApprovalTokenEnvelopeId,
    providerDispatchApprovalPolicyConfirmationEnvelopeId: simulation?.providerDispatchApprovalPolicyConfirmationEnvelopeId,
    providerDispatchApprovalCandidateEnvelopeId: simulation?.providerDispatchApprovalCandidateEnvelopeId,
    providerDispatchReleaseCandidateEnvelopeId: simulation?.providerDispatchReleaseCandidateEnvelopeId,
    decision, envelopeMode: "controlled_provider_dispatch_human_approval_token_issuance_confirmation_no_provider_call",
    providerDispatchHumanApprovalTokenIssuanceConfirmationPrepared: true, humanApprovalTokenIssuanceConfirmationPrepared: true, humanApprovalTokenIssuanceConfirmationPersisted: true, humanApprovalTokenIssuanceConfirmedForReviewOnly: true,
    humanApprovalTokenReadyForIssuanceReview: true, humanApprovalTokenReadyForHumanApproval: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false,
    approvalPolicyConfirmedForHumanApprovalOnly: true, approvalCandidateReadyForHumanApproval: true, approvalCandidateApproved: false, approvalCandidateExecuted: false,
    approvalCandidateContainsProviderResponse: false, approvalCandidateContainsPromptPayload: false, approvalCandidateContainsSecrets: false,
    releaseCandidateReadyForHumanReview: true, releaseCandidateApproved: false, releaseCandidateExecuted: false,
    finalDispatchAllowed: false, providerDispatchPerformed: false, commandEnvelopeExecuted: false, executionGateOpen: false,
    metadataOnly: true, provider: "none", modelSelected: "none", promptPayloadIncluded: false, promptIncluded: false, providerResponseIncluded: false, providerResultIncluded: false,
    secretValuesIncluded: false, requestBodyIncluded: false, sensitiveRequestBodyIncluded: false,
    networkCallAllowed: false, networkCallPerformed: false, providerExecutionAllowed: false, realLlmCallAllowed: false, llmCallPerformed: false,
    executionAllowed: false, toolExecutionAllowed: false, agentExecutionAllowed: false, dryRunOnly: true,
    noSecretsIncluded: decision !== "blocked_approval_candidate_contains_secrets", reason,
    metadata: { ...(input.metadata || {}), phase: "45.0", noProviderCall: true, noNetworkCall: true, noDispatch: true, reviewOnlyConfirmation: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false }
  };
  appendEnvelope(envelope);
  appendGovernanceAuditEvent({ type: "agent_registry_status_changed", actor: "api", entityType: "agent-registry", entityId: envelope.providerDispatchHumanApprovalTokenIssuanceCandidatePolicySimulationId, status: envelope.decision, riskLevel: "critical", summary: "Provider Dispatch Human Approval Token Issuance Confirmation: " + envelope.decision, metadata: { source: "phase45.0-provider-dispatch-human-approval-token-issuance-confirmation", envelopeId: envelope.id, reviewOnlyConfirmation: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false } });
  return envelope;
}

export function summarizeProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelopes(envelopes: ProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelope[]) { const byDecision: Record<string, number> = {}; for (const item of envelopes) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1; return { total: envelopes.length, byDecision }; }
