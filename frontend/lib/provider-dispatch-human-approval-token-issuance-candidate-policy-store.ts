import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchHumanApprovalTokenIssuanceCandidatePolicyDecision =
  | "provider_dispatch_human_approval_token_issuance_candidate_policy_allowed_no_provider_call"
  | "blocked_missing_human_approval_token_issuance_candidate_envelope"
  | "blocked_issuance_candidate_not_prepared"
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
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_secret_values_included";

export interface ProviderDispatchHumanApprovalTokenIssuanceCandidatePolicySimulation {
  id: string;
  timestamp: string;
  providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId?: string;
  providerDispatchHumanApprovalTokenPolicySimulationId?: string;
  providerDispatchHumanApprovalTokenEnvelopeId?: string;
  providerDispatchApprovalPolicyConfirmationEnvelopeId?: string;
  providerDispatchApprovalCandidateEnvelopeId?: string;
  providerDispatchReleaseCandidateEnvelopeId?: string;
  decision: ProviderDispatchHumanApprovalTokenIssuanceCandidatePolicyDecision;
  policyMode: "provider_dispatch_human_approval_token_issuance_candidate_policy_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  providerDispatchHumanApprovalTokenIssuanceCandidatePrepared: true;
  humanApprovalTokenIssuanceCandidatePrepared: true;
  humanApprovalTokenIssuanceCandidatePersisted: true;
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
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function envelopePath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-candidate-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-candidate-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
function appendSimulation(simulation: ProviderDispatchHumanApprovalTokenIssuanceCandidatePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(simulation) + "\n", "utf8"); }

export function listProviderDispatchHumanApprovalTokenIssuanceCandidatePolicySimulations(limit = 100): ProviderDispatchHumanApprovalTokenIssuanceCandidatePolicySimulation[] {
  ensureStore();
  return readJsonl(simulationPath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function simulateProviderDispatchHumanApprovalTokenIssuanceCandidatePolicy(input: { providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchHumanApprovalTokenIssuanceCandidatePolicySimulation {
  ensureStore();
  const envelopes = readJsonl(envelopePath());
  const envelope = input.providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId ? envelopes.find((entry: any) => entry.id === input.providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId) : envelopes[0];
  const checks: Array<{ name: string; passed: boolean; reason: string }> = [];
  checks.push({ name: "issuance_candidate_exists", passed: Boolean(envelope), reason: envelope ? "Issuance Candidate Envelope gefunden." : "Issuance Candidate Envelope fehlt." });
  checks.push({ name: "issuance_candidate_prepared", passed: envelope?.providerDispatchHumanApprovalTokenIssuanceCandidatePrepared === true && envelope?.humanApprovalTokenIssuanceCandidatePrepared === true && envelope?.humanApprovalTokenIssuanceCandidatePersisted === true, reason: "Issuance Candidate muss vorbereitet und persistiert sein." });
  checks.push({ name: "issuance_review_ready_only", passed: envelope?.humanApprovalTokenReadyForIssuanceReview === true && envelope?.humanApprovalTokenIssued === false && envelope?.humanApprovalTokenActivated === false && envelope?.humanApprovalTokenConsumed === false, reason: "Candidate darf nur review-ready sein; Token bleibt nicht issued, nicht aktiviert und nicht konsumiert." });
  checks.push({ name: "approval_candidate_not_approved_or_executed", passed: envelope?.approvalCandidateApproved === false && envelope?.approvalCandidateExecuted === false, reason: "Approval Candidate bleibt nicht approved und nicht ausgeführt." });
  checks.push({ name: "no_provider_response", passed: envelope?.approvalCandidateContainsProviderResponse === false && envelope?.providerResponseIncluded === false && envelope?.providerResultIncluded === false, reason: "Keine Provider Response und kein Provider Result." });
  checks.push({ name: "no_prompt_payload", passed: envelope?.approvalCandidateContainsPromptPayload === false && envelope?.promptPayloadIncluded === false && envelope?.promptIncluded === false, reason: "Kein Prompt Payload." });
  checks.push({ name: "no_secrets", passed: envelope?.approvalCandidateContainsSecrets === false && envelope?.secretValuesIncluded === false && envelope?.noSecretsIncluded === true && !containsSecretValue(envelope), reason: "Keine Secret-Werte." });
  checks.push({ name: "execution_dispatch_blocked", passed: envelope?.finalDispatchAllowed === false && envelope?.providerDispatchPerformed === false && envelope?.commandEnvelopeExecuted === false && envelope?.executionGateOpen === false, reason: "Dispatch und Execution bleiben blockiert." });
  checks.push({ name: "network_provider_blocked", passed: envelope?.networkCallAllowed === false && envelope?.networkCallPerformed === false && envelope?.providerExecutionAllowed === false && envelope?.llmCallPerformed === false, reason: "Provider-/Netzwerk-Ausführung bleibt blockiert." });
  checks.push({ name: "dry_run_only", passed: envelope?.executionAllowed === false && envelope?.toolExecutionAllowed === false && envelope?.agentExecutionAllowed === false && envelope?.dryRunOnly === true, reason: "Dry-run-only bleibt aktiv." });

  let decision: ProviderDispatchHumanApprovalTokenIssuanceCandidatePolicyDecision = "provider_dispatch_human_approval_token_issuance_candidate_policy_allowed_no_provider_call";
  let reason = "Issuance Candidate Policy erlaubt nur metadata-only review-ready Status. Token bleibt nicht issued, nicht aktiviert, nicht konsumiert. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.";
  if (!envelope) { decision = "blocked_missing_human_approval_token_issuance_candidate_envelope"; reason = "Issuance Candidate Envelope fehlt."; }
  else if (envelope.providerDispatchHumanApprovalTokenIssuanceCandidatePrepared !== true || envelope.humanApprovalTokenIssuanceCandidatePrepared !== true || envelope.humanApprovalTokenIssuanceCandidatePersisted !== true) { decision = "blocked_issuance_candidate_not_prepared"; reason = "Issuance Candidate ist nicht vorbereitet oder nicht persistiert."; }
  else if (envelope.humanApprovalTokenReadyForIssuanceReview !== true) { decision = "blocked_issuance_candidate_not_ready_for_review"; reason = "Issuance Candidate ist nicht review-ready."; }
  else if (envelope.humanApprovalTokenIssued !== false) { decision = "blocked_token_issued"; reason = "Human Approval Token wurde issued."; }
  else if (envelope.humanApprovalTokenActivated !== false) { decision = "blocked_token_activated"; reason = "Human Approval Token wurde aktiviert."; }
  else if (envelope.humanApprovalTokenConsumed !== false) { decision = "blocked_token_consumed"; reason = "Human Approval Token wurde konsumiert."; }
  else if (envelope.approvalCandidateApproved !== false) { decision = "blocked_approval_candidate_approved"; reason = "Approval Candidate ist approved."; }
  else if (envelope.approvalCandidateExecuted !== false) { decision = "blocked_approval_candidate_executed"; reason = "Approval Candidate ist ausgeführt."; }
  else if (envelope.approvalCandidateContainsProviderResponse !== false || envelope.providerResponseIncluded !== false || envelope.providerResultIncluded !== false) { decision = "blocked_approval_candidate_contains_provider_response"; reason = "Provider Response oder Provider Result enthalten."; }
  else if (envelope.approvalCandidateContainsPromptPayload !== false || envelope.promptPayloadIncluded !== false || envelope.promptIncluded !== false) { decision = "blocked_approval_candidate_contains_prompt_payload"; reason = "Prompt Payload enthalten."; }
  else if (envelope.approvalCandidateContainsSecrets !== false || envelope.secretValuesIncluded !== false || envelope.noSecretsIncluded !== true || containsSecretValue(envelope)) { decision = "blocked_approval_candidate_contains_secrets"; reason = "Secret-Werte enthalten."; }
  else if (envelope.finalDispatchAllowed !== false || envelope.providerDispatchPerformed !== false || envelope.commandEnvelopeExecuted !== false || envelope.executionGateOpen !== false || envelope.executionAllowed !== false || envelope.toolExecutionAllowed !== false || envelope.agentExecutionAllowed !== false || envelope.dryRunOnly !== true) { decision = "blocked_execution_or_dispatch_enabled"; reason = "Dispatch oder Execution ist aktiv."; }
  else if (envelope.networkCallAllowed !== false || envelope.networkCallPerformed !== false || envelope.providerExecutionAllowed !== false || envelope.llmCallPerformed !== false) { decision = "blocked_network_or_provider_execution_attempt"; reason = "Netzwerk-/Provider-Ausführung erkannt."; }
  else if (envelope.secretValuesIncluded !== false || envelope.noSecretsIncluded !== true || containsSecretValue(envelope)) { decision = "blocked_secret_values_included"; reason = "Secret Boundary verletzt."; }

  const simulation: ProviderDispatchHumanApprovalTokenIssuanceCandidatePolicySimulation = {
    id: makeId("provider-dispatch-human-approval-token-issuance-candidate-policy-sim"), timestamp: new Date().toISOString(),
    providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId: envelope?.id || input.providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId,
    providerDispatchHumanApprovalTokenPolicySimulationId: envelope?.providerDispatchHumanApprovalTokenPolicySimulationId,
    providerDispatchHumanApprovalTokenEnvelopeId: envelope?.providerDispatchHumanApprovalTokenEnvelopeId,
    providerDispatchApprovalPolicyConfirmationEnvelopeId: envelope?.providerDispatchApprovalPolicyConfirmationEnvelopeId,
    providerDispatchApprovalCandidateEnvelopeId: envelope?.providerDispatchApprovalCandidateEnvelopeId,
    providerDispatchReleaseCandidateEnvelopeId: envelope?.providerDispatchReleaseCandidateEnvelopeId,
    decision, policyMode: "provider_dispatch_human_approval_token_issuance_candidate_policy_no_provider_call", policyChecks: checks,
    providerDispatchHumanApprovalTokenIssuanceCandidatePrepared: true, humanApprovalTokenIssuanceCandidatePrepared: true, humanApprovalTokenIssuanceCandidatePersisted: true,
    humanApprovalTokenReadyForIssuanceReview: true, humanApprovalTokenReadyForHumanApproval: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false,
    approvalPolicyConfirmedForHumanApprovalOnly: true, approvalCandidateReadyForHumanApproval: true, approvalCandidateApproved: false, approvalCandidateExecuted: false,
    approvalCandidateContainsProviderResponse: false, approvalCandidateContainsPromptPayload: false, approvalCandidateContainsSecrets: false,
    releaseCandidateReadyForHumanReview: true, releaseCandidateApproved: false, releaseCandidateExecuted: false,
    finalDispatchAllowed: false, providerDispatchPerformed: false, commandEnvelopeExecuted: false, executionGateOpen: false,
    metadataOnly: true, provider: "none", modelSelected: "none", promptPayloadIncluded: false, promptIncluded: false, providerResponseIncluded: false, providerResultIncluded: false,
    secretValuesIncluded: false, requestBodyIncluded: false, sensitiveRequestBodyIncluded: false,
    networkCallAllowed: false, networkCallPerformed: false, providerExecutionAllowed: false, realLlmCallAllowed: false, llmCallPerformed: false,
    executionAllowed: false, toolExecutionAllowed: false, agentExecutionAllowed: false, dryRunOnly: true,
    noSecretsIncluded: decision !== "blocked_secret_values_included" && decision !== "blocked_approval_candidate_contains_secrets", simulated: true, reason,
    metadata: { ...(input.metadata || {}), phase: "44.1", noProviderCall: true, noNetworkCall: true, noDispatch: true, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false }
  };
  appendSimulation(simulation);
  appendGovernanceAuditEvent({ type: "agent_registry_status_changed", actor: "api", entityType: "agent-registry", entityId: simulation.providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopeId, status: simulation.decision, riskLevel: "critical", summary: "Provider Dispatch Human Approval Token Issuance Candidate Policy Simulation: " + simulation.decision, metadata: { source: "phase44.1-provider-dispatch-human-approval-token-issuance-candidate-policy", simulationId: simulation.id, humanApprovalTokenIssued: false, humanApprovalTokenActivated: false, humanApprovalTokenConsumed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false } });
  return simulation;
}

export function summarizeProviderDispatchHumanApprovalTokenIssuanceCandidatePolicySimulations(simulations: ProviderDispatchHumanApprovalTokenIssuanceCandidatePolicySimulation[]) { const byDecision: Record<string, number> = {}; for (const item of simulations) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1; return { total: simulations.length, byDecision }; }
