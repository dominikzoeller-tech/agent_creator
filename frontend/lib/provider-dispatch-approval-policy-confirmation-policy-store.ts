import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchApprovalPolicyConfirmationPolicyDecision =
  | "provider_dispatch_approval_policy_confirmation_policy_allowed_no_provider_call"
  | "blocked_missing_approval_policy_confirmation_envelope"
  | "blocked_confirmation_not_prepared"
  | "blocked_confirmation_not_human_approval_only"
  | "blocked_approval_candidate_approved"
  | "blocked_approval_candidate_executed"
  | "blocked_approval_candidate_contains_provider_response"
  | "blocked_approval_candidate_contains_prompt_payload"
  | "blocked_approval_candidate_contains_secrets"
  | "blocked_execution_or_dispatch_enabled"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_secret_values_included";

export interface ProviderDispatchApprovalPolicyConfirmationPolicySimulation {
  id: string;
  timestamp: string;
  providerDispatchApprovalPolicyConfirmationEnvelopeId?: string;
  providerDispatchApprovalCandidateEnvelopePolicySimulationId?: string;
  providerDispatchApprovalCandidateEnvelopeId?: string;
  providerDispatchReleaseCandidateEnvelopeId?: string;
  decision: ProviderDispatchApprovalPolicyConfirmationPolicyDecision;
  policyMode: "provider_dispatch_approval_policy_confirmation_policy_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
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
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function confirmationPath(): string { return path.join(dataDir(), "provider-dispatch-approval-policy-confirmation-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-approval-policy-confirmation-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] {
  try {
    return readFileSync(file, "utf8").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}
function makeId(prefix: string): string { return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
function appendSimulation(sim: ProviderDispatchApprovalPolicyConfirmationPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim) + "\n", "utf8"); }

export function listProviderDispatchApprovalPolicyConfirmationPolicySimulations(limit = 100): ProviderDispatchApprovalPolicyConfirmationPolicySimulation[] {
  ensureStore();
  return readJsonl(simulationPath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function simulateProviderDispatchApprovalPolicyConfirmationPolicy(input: { providerDispatchApprovalPolicyConfirmationEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchApprovalPolicyConfirmationPolicySimulation {
  ensureStore();
  const confirmations = readJsonl(confirmationPath());
  const envelope = input.providerDispatchApprovalPolicyConfirmationEnvelopeId ? confirmations.find((entry: any) => entry.id === input.providerDispatchApprovalPolicyConfirmationEnvelopeId) : confirmations[0];
  const checks: Array<{ name: string; passed: boolean; reason: string }> = [];

  checks.push({ name: "confirmation_envelope_exists", passed: Boolean(envelope), reason: envelope ? "Confirmation Envelope gefunden." : "Confirmation Envelope fehlt." });
  checks.push({ name: "confirmation_prepared", passed: envelope?.providerDispatchApprovalPolicyConfirmationEnvelopePrepared === true && envelope?.approvalPolicyConfirmationEnvelopePrepared === true && envelope?.approvalPolicyConfirmationEnvelopePersisted === true, reason: "Confirmation Envelope muss vorbereitet und persistiert sein." });
  checks.push({ name: "human_approval_only_confirmed", passed: envelope?.approvalPolicyConfirmedForHumanApprovalOnly === true, reason: "Policy Confirmation muss Human-Approval-only bestätigen." });
  checks.push({ name: "approval_candidate_not_approved_or_executed", passed: envelope?.approvalCandidateApproved === false && envelope?.approvalCandidateExecuted === false, reason: "Approval Candidate bleibt nicht approved und nicht ausgeführt." });
  checks.push({ name: "approval_candidate_no_provider_response", passed: envelope?.approvalCandidateContainsProviderResponse === false && envelope?.providerResponseIncluded === false && envelope?.providerResultIncluded === false, reason: "Keine Provider Response und kein Provider Result." });
  checks.push({ name: "approval_candidate_no_prompt_payload", passed: envelope?.approvalCandidateContainsPromptPayload === false && envelope?.promptPayloadIncluded === false && envelope?.promptIncluded === false, reason: "Kein Prompt Payload." });
  checks.push({ name: "approval_candidate_no_secrets", passed: envelope?.approvalCandidateContainsSecrets === false && envelope?.secretValuesIncluded === false && envelope?.noSecretsIncluded === true && !containsSecretValue(envelope), reason: "Keine Secret-Werte." });
  checks.push({ name: "execution_dispatch_blocked", passed: envelope?.finalDispatchAllowed === false && envelope?.providerDispatchPerformed === false && envelope?.commandEnvelopeExecuted === false && envelope?.executionGateOpen === false, reason: "Dispatch und Execution bleiben blockiert." });
  checks.push({ name: "network_provider_blocked", passed: envelope?.networkCallAllowed === false && envelope?.networkCallPerformed === false && envelope?.providerExecutionAllowed === false && envelope?.llmCallPerformed === false, reason: "Provider-/Netzwerk-Ausführung bleibt blockiert." });
  checks.push({ name: "dry_run_only", passed: envelope?.executionAllowed === false && envelope?.toolExecutionAllowed === false && envelope?.agentExecutionAllowed === false && envelope?.dryRunOnly === true, reason: "Dry-run-only bleibt aktiv." });

  let decision: ProviderDispatchApprovalPolicyConfirmationPolicyDecision = "provider_dispatch_approval_policy_confirmation_policy_allowed_no_provider_call";
  let reason = "Policy Confirmation ist gültig: Human-Approval-only bestätigt, ohne Approval, ohne Execution, ohne Provider Dispatch und ohne Provider-/Netzwerk-Aufruf.";

  if (!envelope) { decision = "blocked_missing_approval_policy_confirmation_envelope"; reason = "Approval Policy Confirmation Envelope fehlt."; }
  else if (envelope.providerDispatchApprovalPolicyConfirmationEnvelopePrepared !== true || envelope.approvalPolicyConfirmationEnvelopePrepared !== true || envelope.approvalPolicyConfirmationEnvelopePersisted !== true) { decision = "blocked_confirmation_not_prepared"; reason = "Confirmation Envelope ist nicht vorbereitet oder nicht persistiert."; }
  else if (envelope.approvalPolicyConfirmedForHumanApprovalOnly !== true) { decision = "blocked_confirmation_not_human_approval_only"; reason = "Human-Approval-only ist nicht bestätigt."; }
  else if (envelope.approvalCandidateApproved !== false) { decision = "blocked_approval_candidate_approved"; reason = "Approval Candidate ist approved."; }
  else if (envelope.approvalCandidateExecuted !== false) { decision = "blocked_approval_candidate_executed"; reason = "Approval Candidate ist ausgeführt."; }
  else if (envelope.approvalCandidateContainsProviderResponse !== false || envelope.providerResponseIncluded !== false || envelope.providerResultIncluded !== false) { decision = "blocked_approval_candidate_contains_provider_response"; reason = "Provider Response oder Provider Result enthalten."; }
  else if (envelope.approvalCandidateContainsPromptPayload !== false || envelope.promptPayloadIncluded !== false || envelope.promptIncluded !== false) { decision = "blocked_approval_candidate_contains_prompt_payload"; reason = "Prompt Payload enthalten."; }
  else if (envelope.approvalCandidateContainsSecrets !== false || envelope.secretValuesIncluded !== false || envelope.noSecretsIncluded !== true || containsSecretValue(envelope)) { decision = "blocked_approval_candidate_contains_secrets"; reason = "Secret-Werte enthalten."; }
  else if (envelope.finalDispatchAllowed !== false || envelope.providerDispatchPerformed !== false || envelope.commandEnvelopeExecuted !== false || envelope.executionGateOpen !== false || envelope.executionAllowed !== false || envelope.toolExecutionAllowed !== false || envelope.agentExecutionAllowed !== false || envelope.dryRunOnly !== true) { decision = "blocked_execution_or_dispatch_enabled"; reason = "Dispatch oder Execution ist aktiv."; }
  else if (envelope.networkCallAllowed !== false || envelope.networkCallPerformed !== false || envelope.providerExecutionAllowed !== false || envelope.llmCallPerformed !== false) { decision = "blocked_network_or_provider_execution_attempt"; reason = "Netzwerk-/Provider-Ausführung erkannt."; }
  else if (envelope.secretValuesIncluded !== false || envelope.noSecretsIncluded !== true || containsSecretValue(envelope)) { decision = "blocked_secret_values_included"; reason = "Secret Boundary verletzt."; }

  const simulation: ProviderDispatchApprovalPolicyConfirmationPolicySimulation = {
    id: makeId("provider-dispatch-approval-policy-confirmation-policy-sim"),
    timestamp: new Date().toISOString(),
    providerDispatchApprovalPolicyConfirmationEnvelopeId: envelope?.id || input.providerDispatchApprovalPolicyConfirmationEnvelopeId,
    providerDispatchApprovalCandidateEnvelopePolicySimulationId: envelope?.providerDispatchApprovalCandidateEnvelopePolicySimulationId,
    providerDispatchApprovalCandidateEnvelopeId: envelope?.providerDispatchApprovalCandidateEnvelopeId,
    providerDispatchReleaseCandidateEnvelopeId: envelope?.providerDispatchReleaseCandidateEnvelopeId,
    decision,
    policyMode: "provider_dispatch_approval_policy_confirmation_policy_no_provider_call",
    policyChecks: checks,
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
    noSecretsIncluded: decision !== "blocked_secret_values_included" && decision !== "blocked_approval_candidate_contains_secrets",
    simulated: true,
    reason,
    metadata: { ...(input.metadata || {}), phase: "42.1", noProviderCall: true, noNetworkCall: true, noDispatch: true, approvalPolicyConfirmedForHumanApprovalOnly: true, approvalCandidateApproved: false, approvalCandidateExecuted: false }
  };

  appendSimulation(simulation);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: simulation.providerDispatchApprovalPolicyConfirmationEnvelopeId,
    status: simulation.decision,
    riskLevel: "critical",
    summary: "Provider Dispatch Approval Policy Confirmation Policy Simulation: " + simulation.decision,
    metadata: { source: "phase42.1-provider-dispatch-approval-policy-confirmation-policy", simulationId: simulation.id, providerDispatchApprovalPolicyConfirmationEnvelopeId: simulation.providerDispatchApprovalPolicyConfirmationEnvelopeId, approvalPolicyConfirmedForHumanApprovalOnly: true, approvalCandidateApproved: false, approvalCandidateExecuted: false, networkCallAllowed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false }
  });
  return simulation;
}

export function summarizeProviderDispatchApprovalPolicyConfirmationPolicySimulations(simulations: ProviderDispatchApprovalPolicyConfirmationPolicySimulation[]) {
  const byDecision: Record<string, number> = {};
  for (const item of simulations) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1;
  return { total: simulations.length, byDecision };
}
