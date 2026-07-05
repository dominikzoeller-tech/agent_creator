import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchApprovalCandidateEnvelopePolicyDecision =
  | "provider_dispatch_approval_candidate_envelope_policy_allowed_human_approval_only_no_provider_call"
  | "blocked_missing_approval_candidate_envelope"
  | "blocked_approval_candidate_not_prepared"
  | "blocked_approval_candidate_not_ready_for_human_approval"
  | "blocked_approval_candidate_approved"
  | "blocked_approval_candidate_executed"
  | "blocked_approval_candidate_contains_provider_response"
  | "blocked_approval_candidate_contains_prompt_payload"
  | "blocked_approval_candidate_contains_secrets"
  | "blocked_release_candidate_approved_or_executed"
  | "blocked_execution_or_dispatch_enabled"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_secret_values_included";

export interface ProviderDispatchApprovalCandidateEnvelopePolicySimulation {
  id: string;
  timestamp: string;
  providerDispatchApprovalCandidateEnvelopeId?: string;
  providerDispatchReleaseCandidateEnvelopeId?: string;
  providerDispatchTranscriptEnvelopeId?: string;
  decision: ProviderDispatchApprovalCandidateEnvelopePolicyDecision;
  policyMode: "provider_dispatch_approval_candidate_envelope_policy_human_approval_only_no_provider_call";
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  providerDispatchApprovalCandidateEnvelopePrepared: true;
  approvalCandidateEnvelopePrepared: true;
  approvalCandidateEnvelopePersisted: true;
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
function approvalCandidatePath(): string { return path.join(dataDir(), "provider-dispatch-approval-candidate-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-approval-candidate-envelope-policy-simulations.jsonl"); }
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
function appendSimulation(simulation: ProviderDispatchApprovalCandidateEnvelopePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(simulation) + "\n", "utf8"); }

export function listProviderDispatchApprovalCandidateEnvelopePolicySimulations(limit = 100): ProviderDispatchApprovalCandidateEnvelopePolicySimulation[] {
  ensureStore();
  return readJsonl(simulationPath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function simulateProviderDispatchApprovalCandidateEnvelopePolicy(input: { providerDispatchApprovalCandidateEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchApprovalCandidateEnvelopePolicySimulation {
  ensureStore();
  const envelopes = readJsonl(approvalCandidatePath());
  const envelope = input.providerDispatchApprovalCandidateEnvelopeId ? envelopes.find((entry: any) => entry.id === input.providerDispatchApprovalCandidateEnvelopeId) : envelopes[0];
  const checks: Array<{ name: string; passed: boolean; reason: string }> = [];

  checks.push({ name: "approval_candidate_exists", passed: Boolean(envelope), reason: envelope ? "Approval Candidate Envelope gefunden." : "Approval Candidate Envelope fehlt." });
  checks.push({ name: "approval_candidate_prepared", passed: envelope?.providerDispatchApprovalCandidateEnvelopePrepared === true && envelope?.approvalCandidateEnvelopePrepared === true && envelope?.approvalCandidateEnvelopePersisted === true, reason: "Approval Candidate Envelope muss vorbereitet und persistiert sein." });
  checks.push({ name: "human_approval_only", passed: envelope?.approvalCandidateReadyForHumanApproval === true && envelope?.approvalCandidateApproved === false && envelope?.approvalCandidateExecuted === false, reason: "Approval Candidate ist nur Human-Approval-ready, nicht approved und nicht ausgeführt." });
  checks.push({ name: "approval_candidate_no_provider_response", passed: envelope?.approvalCandidateContainsProviderResponse === false && envelope?.providerResponseIncluded === false && envelope?.providerResultIncluded === false, reason: "Approval Candidate darf keine Provider Response und kein Provider Result enthalten." });
  checks.push({ name: "approval_candidate_no_prompt_payload", passed: envelope?.approvalCandidateContainsPromptPayload === false && envelope?.promptPayloadIncluded === false && envelope?.promptIncluded === false, reason: "Approval Candidate darf keinen Prompt Payload enthalten." });
  checks.push({ name: "approval_candidate_no_secrets", passed: envelope?.approvalCandidateContainsSecrets === false && envelope?.secretValuesIncluded === false && envelope?.noSecretsIncluded === true && !containsSecretValue(envelope), reason: "Approval Candidate darf keine Secret-Werte enthalten." });
  checks.push({ name: "release_candidate_not_approved_or_executed", passed: envelope?.releaseCandidateApproved === false && envelope?.releaseCandidateExecuted === false, reason: "Release Candidate bleibt nicht approved und nicht ausgeführt." });
  checks.push({ name: "execution_dispatch_blocked", passed: envelope?.finalDispatchAllowed === false && envelope?.providerDispatchPerformed === false && envelope?.commandEnvelopeExecuted === false && envelope?.executionGateOpen === false, reason: "Dispatch und Execution bleiben blockiert." });
  checks.push({ name: "network_provider_blocked", passed: envelope?.networkCallAllowed === false && envelope?.networkCallPerformed === false && envelope?.providerExecutionAllowed === false && envelope?.llmCallPerformed === false, reason: "Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name: "execution_blocked", passed: envelope?.executionAllowed === false && envelope?.toolExecutionAllowed === false && envelope?.agentExecutionAllowed === false && envelope?.dryRunOnly === true, reason: "Execution-, Tool- und Agent-Ausführung bleiben blockiert." });

  let decision: ProviderDispatchApprovalCandidateEnvelopePolicyDecision = "provider_dispatch_approval_candidate_envelope_policy_allowed_human_approval_only_no_provider_call";
  let reason = "Policy erlaubt nur Human-Approval-ready Approval Candidate ohne Approval, ohne Execution, ohne Provider-/Netzwerk-Aufruf und ohne Provider Response, Prompt Payload oder Secrets.";

  if (!envelope) { decision = "blocked_missing_approval_candidate_envelope"; reason = "Approval Candidate Envelope fehlt."; }
  else if (envelope.providerDispatchApprovalCandidateEnvelopePrepared !== true || envelope.approvalCandidateEnvelopePrepared !== true || envelope.approvalCandidateEnvelopePersisted !== true) { decision = "blocked_approval_candidate_not_prepared"; reason = "Approval Candidate Envelope ist nicht vorbereitet oder nicht persistiert."; }
  else if (envelope.approvalCandidateReadyForHumanApproval !== true) { decision = "blocked_approval_candidate_not_ready_for_human_approval"; reason = "Approval Candidate ist nicht Human-Approval-ready."; }
  else if (envelope.approvalCandidateApproved !== false) { decision = "blocked_approval_candidate_approved"; reason = "Approval Candidate wurde approved."; }
  else if (envelope.approvalCandidateExecuted !== false) { decision = "blocked_approval_candidate_executed"; reason = "Approval Candidate wurde ausgeführt."; }
  else if (envelope.approvalCandidateContainsProviderResponse !== false || envelope.providerResponseIncluded !== false || envelope.providerResultIncluded !== false) { decision = "blocked_approval_candidate_contains_provider_response"; reason = "Approval Candidate enthält Provider Response oder Provider Result."; }
  else if (envelope.approvalCandidateContainsPromptPayload !== false || envelope.promptPayloadIncluded !== false || envelope.promptIncluded !== false) { decision = "blocked_approval_candidate_contains_prompt_payload"; reason = "Approval Candidate enthält Prompt Payload."; }
  else if (envelope.approvalCandidateContainsSecrets !== false || envelope.secretValuesIncluded !== false || envelope.noSecretsIncluded !== true || containsSecretValue(envelope)) { decision = "blocked_approval_candidate_contains_secrets"; reason = "Approval Candidate enthält Secrets."; }
  else if (envelope.releaseCandidateApproved !== false || envelope.releaseCandidateExecuted !== false) { decision = "blocked_release_candidate_approved_or_executed"; reason = "Release Candidate wurde approved oder ausgeführt."; }
  else if (envelope.finalDispatchAllowed !== false || envelope.providerDispatchPerformed !== false || envelope.commandEnvelopeExecuted !== false || envelope.executionGateOpen !== false || envelope.executionAllowed !== false || envelope.toolExecutionAllowed !== false || envelope.agentExecutionAllowed !== false || envelope.dryRunOnly !== true) { decision = "blocked_execution_or_dispatch_enabled"; reason = "Dispatch oder Execution ist aktiv."; }
  else if (envelope.networkCallAllowed !== false || envelope.networkCallPerformed !== false || envelope.providerExecutionAllowed !== false || envelope.llmCallPerformed !== false) { decision = "blocked_network_or_provider_execution_attempt"; reason = "Netzwerk-/Provider-Ausführung erkannt."; }
  else if (envelope.secretValuesIncluded !== false || envelope.noSecretsIncluded !== true || containsSecretValue(envelope)) { decision = "blocked_secret_values_included"; reason = "Secret Boundary verletzt."; }

  const simulation: ProviderDispatchApprovalCandidateEnvelopePolicySimulation = {
    id: makeId("provider-dispatch-approval-candidate-envelope-policy-sim"),
    timestamp: new Date().toISOString(),
    providerDispatchApprovalCandidateEnvelopeId: envelope?.id || input.providerDispatchApprovalCandidateEnvelopeId,
    providerDispatchReleaseCandidateEnvelopeId: envelope?.providerDispatchReleaseCandidateEnvelopeId,
    providerDispatchTranscriptEnvelopeId: envelope?.providerDispatchTranscriptEnvelopeId,
    decision,
    policyMode: "provider_dispatch_approval_candidate_envelope_policy_human_approval_only_no_provider_call",
    policyChecks: checks,
    providerDispatchApprovalCandidateEnvelopePrepared: true,
    approvalCandidateEnvelopePrepared: true,
    approvalCandidateEnvelopePersisted: true,
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
    metadata: { ...(input.metadata || {}), phase: "41.1", noProviderCall: true, noNetworkCall: true, noDispatch: true, approvalCandidateReadyForHumanApproval: true, approvalCandidateApproved: false, approvalCandidateExecuted: false }
  };

  appendSimulation(simulation);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: simulation.providerDispatchApprovalCandidateEnvelopeId,
    status: simulation.decision,
    riskLevel: "critical",
    summary: "Provider Dispatch Approval Candidate Envelope Policy Simulation: " + simulation.decision,
    metadata: { source: "phase41.1-provider-dispatch-approval-candidate-envelope-policy", simulationId: simulation.id, providerDispatchApprovalCandidateEnvelopeId: simulation.providerDispatchApprovalCandidateEnvelopeId, approvalCandidateApproved: false, approvalCandidateExecuted: false, networkCallAllowed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false }
  });
  return simulation;
}

export function summarizeProviderDispatchApprovalCandidateEnvelopePolicySimulations(simulations: ProviderDispatchApprovalCandidateEnvelopePolicySimulation[]) {
  const byDecision: Record<string, number> = {};
  for (const item of simulations) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1;
  return { total: simulations.length, byDecision };
}
