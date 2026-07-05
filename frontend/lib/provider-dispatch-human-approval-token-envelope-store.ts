import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchHumanApprovalTokenDecision =
  | "provider_dispatch_human_approval_token_envelope_prepared_no_provider_call"
  | "blocked_missing_approval_policy_confirmation_policy_simulation"
  | "blocked_policy_confirmation_not_allowed"
  | "blocked_approval_policy_not_human_approval_only"
  | "blocked_approval_candidate_approved"
  | "blocked_approval_candidate_executed"
  | "blocked_approval_candidate_contains_provider_response"
  | "blocked_approval_candidate_contains_prompt_payload"
  | "blocked_approval_candidate_contains_secrets"
  | "blocked_execution_or_dispatch_enabled"
  | "blocked_network_or_provider_execution_attempt";

export interface ProviderDispatchHumanApprovalTokenEnvelope {
  id: string;
  timestamp: string;
  providerDispatchApprovalPolicyConfirmationPolicySimulationId?: string;
  providerDispatchApprovalPolicyConfirmationEnvelopeId?: string;
  providerDispatchApprovalCandidateEnvelopeId?: string;
  providerDispatchReleaseCandidateEnvelopeId?: string;
  decision: ProviderDispatchHumanApprovalTokenDecision;
  envelopeMode: "controlled_provider_dispatch_human_approval_token_envelope_no_provider_call";
  providerDispatchHumanApprovalTokenEnvelopePrepared: true;
  humanApprovalTokenEnvelopePrepared: true;
  humanApprovalTokenEnvelopePersisted: true;
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
function srcPath(): string { return path.join(dataDir(), "provider-dispatch-approval-policy-confirmation-policy-simulations.jsonl"); }
function dstPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
function appendEnvelope(envelope: ProviderDispatchHumanApprovalTokenEnvelope): void { ensureStore(); appendFileSync(dstPath(), JSON.stringify(envelope) + "\n", "utf8"); }

export function listProviderDispatchHumanApprovalTokenEnvelopes(limit = 100): ProviderDispatchHumanApprovalTokenEnvelope[] {
  ensureStore();
  return readJsonl(dstPath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function createProviderDispatchHumanApprovalTokenEnvelope(input: { providerDispatchApprovalPolicyConfirmationPolicySimulationId?: string; metadata?: Record<string, unknown> }): ProviderDispatchHumanApprovalTokenEnvelope {
  ensureStore();
  const simulations = readJsonl(srcPath());
  const simulation = input.providerDispatchApprovalPolicyConfirmationPolicySimulationId ? simulations.find((entry: any) => entry.id === input.providerDispatchApprovalPolicyConfirmationPolicySimulationId) : simulations[0];
  let decision: ProviderDispatchHumanApprovalTokenDecision = "provider_dispatch_human_approval_token_envelope_prepared_no_provider_call";
  let reason = "Human Approval Token Envelope wurde metadata-only vorbereitet. Token ist nicht issued, nicht aktiviert und nicht konsumiert. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.";
  if (!simulation) { decision = "blocked_missing_approval_policy_confirmation_policy_simulation"; reason = "Approval Policy Confirmation Policy Simulation fehlt."; }
  else if (simulation.decision !== "provider_dispatch_approval_policy_confirmation_policy_allowed_no_provider_call") { decision = "blocked_policy_confirmation_not_allowed"; reason = "Approval Policy Confirmation Policy erlaubt den nächsten Schritt nicht."; }
  else if (simulation.approvalPolicyConfirmedForHumanApprovalOnly !== true) { decision = "blocked_approval_policy_not_human_approval_only"; reason = "Human-Approval-only wurde nicht bestätigt."; }
  else if (simulation.approvalCandidateApproved !== false) { decision = "blocked_approval_candidate_approved"; reason = "Approval Candidate ist approved."; }
  else if (simulation.approvalCandidateExecuted !== false) { decision = "blocked_approval_candidate_executed"; reason = "Approval Candidate ist ausgeführt."; }
  else if (simulation.approvalCandidateContainsProviderResponse !== false || simulation.providerResponseIncluded !== false || simulation.providerResultIncluded !== false) { decision = "blocked_approval_candidate_contains_provider_response"; reason = "Provider Response oder Provider Result enthalten."; }
  else if (simulation.approvalCandidateContainsPromptPayload !== false || simulation.promptPayloadIncluded !== false || simulation.promptIncluded !== false) { decision = "blocked_approval_candidate_contains_prompt_payload"; reason = "Prompt Payload enthalten."; }
  else if (simulation.approvalCandidateContainsSecrets !== false || simulation.secretValuesIncluded !== false || simulation.noSecretsIncluded !== true || containsSecretValue(simulation)) { decision = "blocked_approval_candidate_contains_secrets"; reason = "Secret-Werte enthalten."; }
  else if (simulation.finalDispatchAllowed !== false || simulation.providerDispatchPerformed !== false || simulation.commandEnvelopeExecuted !== false || simulation.executionGateOpen !== false || simulation.executionAllowed !== false || simulation.toolExecutionAllowed !== false || simulation.agentExecutionAllowed !== false || simulation.dryRunOnly !== true) { decision = "blocked_execution_or_dispatch_enabled"; reason = "Dispatch oder Execution ist aktiv."; }
  else if (simulation.networkCallAllowed !== false || simulation.networkCallPerformed !== false || simulation.providerExecutionAllowed !== false || simulation.llmCallPerformed !== false) { decision = "blocked_network_or_provider_execution_attempt"; reason = "Netzwerk-/Provider-Ausführung erkannt."; }
  const envelope: ProviderDispatchHumanApprovalTokenEnvelope = {
    id: makeId("provider-dispatch-human-approval-token-envelope"), timestamp: new Date().toISOString(),
    providerDispatchApprovalPolicyConfirmationPolicySimulationId: simulation?.id || input.providerDispatchApprovalPolicyConfirmationPolicySimulationId,
    providerDispatchApprovalPolicyConfirmationEnvelopeId: simulation?.providerDispatchApprovalPolicyConfirmationEnvelopeId,
    providerDispatchApprovalCandidateEnvelopeId: simulation?.providerDispatchApprovalCandidateEnvelopeId,
    providerDispatchReleaseCandidateEnvelopeId: simulation?.providerDispatchReleaseCandidateEnvelopeId,
    decision, envelopeMode: "controlled_provider_dispatch_human_approval_token_envelope_no_provider_call",
    providerDispatchHumanApprovalTokenEnvelopePrepared: true, humanApprovalTokenEnvelopePrepared: true, humanApprovalTokenEnvelopePersisted: true, humanApprovalTokenReadyForHumanApproval: true,
    humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false,
    approvalPolicyConfirmedForHumanApprovalOnly: true, approvalCandidateReadyForHumanApproval: true, approvalCandidateApproved: false, approvalCandidateExecuted: false,
    approvalCandidateContainsProviderResponse: false, approvalCandidateContainsPromptPayload: false, approvalCandidateContainsSecrets: false,
    releaseCandidateReadyForHumanReview: true, releaseCandidateApproved: false, releaseCandidateExecuted: false,
    finalDispatchAllowed: false, providerDispatchPerformed: false, commandEnvelopeExecuted: false, executionGateOpen: false,
    metadataOnly: true, provider: "none", modelSelected: "none", promptPayloadIncluded: false, promptIncluded: false, providerResponseIncluded: false, providerResultIncluded: false,
    secretValuesIncluded: false, requestBodyIncluded: false, sensitiveRequestBodyIncluded: false,
    networkCallAllowed: false, networkCallPerformed: false, providerExecutionAllowed: false, realLlmCallAllowed: false, llmCallPerformed: false,
    executionAllowed: false, toolExecutionAllowed: false, agentExecutionAllowed: false, dryRunOnly: true,
    noSecretsIncluded: decision !== "blocked_approval_candidate_contains_secrets", reason,
    metadata: { ...(input.metadata || {}), phase: "43.0", noProviderCall: true, noNetworkCall: true, noDispatch: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false }
  };
  appendEnvelope(envelope);
  appendGovernanceAuditEvent({ type: "agent_registry_status_changed", actor: "api", entityType: "agent-registry", entityId: envelope.providerDispatchApprovalPolicyConfirmationPolicySimulationId, status: envelope.decision, riskLevel: "critical", summary: "Provider Dispatch Human Approval Token Envelope: " + envelope.decision, metadata: { source: "phase43.0-provider-dispatch-human-approval-token-envelope", envelopeId: envelope.id, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false } });
  return envelope;
}

export function summarizeProviderDispatchHumanApprovalTokenEnvelopes(envelopes: ProviderDispatchHumanApprovalTokenEnvelope[]) { const byDecision: Record<string, number> = {}; for (const item of envelopes) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1; return { total: envelopes.length, byDecision }; }
