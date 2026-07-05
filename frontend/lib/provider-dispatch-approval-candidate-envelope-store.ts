import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchApprovalCandidateEnvelopeDecision =
  | "provider_dispatch_approval_candidate_envelope_prepared_no_provider_call"
  | "blocked_missing_release_candidate_envelope"
  | "blocked_release_candidate_not_human_review_ready"
  | "blocked_release_candidate_approved_or_executed"
  | "blocked_release_candidate_contains_provider_response"
  | "blocked_release_candidate_contains_prompt_payload"
  | "blocked_release_candidate_contains_secrets"
  | "blocked_execution_or_dispatch_enabled"
  | "blocked_network_or_provider_execution_attempt";

export interface ProviderDispatchApprovalCandidateEnvelope {
  id: string;
  timestamp: string;
  providerDispatchReleaseCandidateEnvelopeId?: string;
  providerDispatchTranscriptEnvelopeId?: string;
  decision: ProviderDispatchApprovalCandidateEnvelopeDecision;
  envelopeMode: "controlled_provider_dispatch_approval_candidate_envelope_no_provider_call";
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
  releaseCandidateContainsProviderResponse: false;
  releaseCandidateContainsPromptPayload: false;
  releaseCandidateContainsSecrets: false;
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
function releaseCandidatePath(): string { return path.join(dataDir(), "provider-dispatch-release-candidate-envelopes.jsonl"); }
function approvalCandidatePath(): string { return path.join(dataDir(), "provider-dispatch-approval-candidate-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] {
  try {
    return readFileSync(file, "utf8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}
function makeId(prefix: string): string { return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
function appendEnvelope(envelope: ProviderDispatchApprovalCandidateEnvelope): void { ensureStore(); appendFileSync(approvalCandidatePath(), JSON.stringify(envelope) + "\n", "utf8"); }

export function listProviderDispatchApprovalCandidateEnvelopes(limit = 100): ProviderDispatchApprovalCandidateEnvelope[] {
  ensureStore();
  return readJsonl(approvalCandidatePath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function createProviderDispatchApprovalCandidateEnvelope(input: { providerDispatchReleaseCandidateEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchApprovalCandidateEnvelope {
  ensureStore();
  const candidates = readJsonl(releaseCandidatePath());
  const release = input.providerDispatchReleaseCandidateEnvelopeId ? candidates.find((entry: any) => entry.id === input.providerDispatchReleaseCandidateEnvelopeId) : candidates[0];

  let decision: ProviderDispatchApprovalCandidateEnvelopeDecision = "provider_dispatch_approval_candidate_envelope_prepared_no_provider_call";
  let reason = "Provider Dispatch Approval Candidate Envelope wurde nur vorbereitet. Es ist bereit für Human Approval, aber nicht approved und nicht ausgeführt. Kein Provider-/Netzwerk-Aufruf.";

  if (!release) { decision = "blocked_missing_release_candidate_envelope"; reason = "Release Candidate Envelope fehlt."; }
  else if (release.releaseCandidateReadyForHumanReview !== true) { decision = "blocked_release_candidate_not_human_review_ready"; reason = "Release Candidate ist nicht Human-Review-ready."; }
  else if (release.releaseCandidateApproved !== false || release.releaseCandidateExecuted !== false) { decision = "blocked_release_candidate_approved_or_executed"; reason = "Release Candidate wurde approved oder ausgeführt."; }
  else if (release.releaseCandidateContainsProviderResponse !== false || release.providerResponseIncluded !== false || release.providerResultIncluded !== false) { decision = "blocked_release_candidate_contains_provider_response"; reason = "Release Candidate enthält Provider Response oder Provider Result."; }
  else if (release.releaseCandidateContainsPromptPayload !== false || release.promptPayloadIncluded !== false || release.promptIncluded !== false) { decision = "blocked_release_candidate_contains_prompt_payload"; reason = "Release Candidate enthält Prompt Payload."; }
  else if (release.releaseCandidateContainsSecrets !== false || release.secretValuesIncluded !== false || release.noSecretsIncluded !== true || containsSecretValue(release)) { decision = "blocked_release_candidate_contains_secrets"; reason = "Release Candidate enthält Secrets."; }
  else if (release.finalDispatchAllowed !== false || release.providerDispatchPerformed !== false || release.commandEnvelopeExecuted !== false || release.executionGateOpen !== false) { decision = "blocked_execution_or_dispatch_enabled"; reason = "Dispatch oder Execution ist aktiv."; }
  else if (release.networkCallAllowed !== false || release.networkCallPerformed !== false || release.providerExecutionAllowed !== false || release.llmCallPerformed !== false) { decision = "blocked_network_or_provider_execution_attempt"; reason = "Netzwerk-/Provider-Ausführung erkannt."; }

  const envelope: ProviderDispatchApprovalCandidateEnvelope = {
    id: makeId("provider-dispatch-approval-candidate-envelope"),
    timestamp: new Date().toISOString(),
    providerDispatchReleaseCandidateEnvelopeId: release?.id || input.providerDispatchReleaseCandidateEnvelopeId,
    providerDispatchTranscriptEnvelopeId: release?.providerDispatchTranscriptEnvelopeId,
    decision,
    envelopeMode: "controlled_provider_dispatch_approval_candidate_envelope_no_provider_call",
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
    releaseCandidateContainsProviderResponse: false,
    releaseCandidateContainsPromptPayload: false,
    releaseCandidateContainsSecrets: false,
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
    noSecretsIncluded: decision !== "blocked_release_candidate_contains_secrets",
    reason,
    metadata: { ...(input.metadata || {}), phase: "41.0", noProviderCall: true, noNetworkCall: true, noDispatch: true, approvalCandidateReadyForHumanApproval: true, approvalCandidateApproved: false, approvalCandidateExecuted: false }
  };

  appendEnvelope(envelope);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: envelope.providerDispatchReleaseCandidateEnvelopeId,
    status: envelope.decision,
    riskLevel: "critical",
    summary: "Provider Dispatch Approval Candidate Envelope: " + envelope.decision,
    metadata: { source: "phase41.0-provider-dispatch-approval-candidate-envelope", envelopeId: envelope.id, approvalCandidateApproved: false, approvalCandidateExecuted: false, networkCallAllowed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false }
  });
  return envelope;
}

export function summarizeProviderDispatchApprovalCandidateEnvelopes(envelopes: ProviderDispatchApprovalCandidateEnvelope[]) {
  const byDecision: Record<string, number> = {};
  for (const item of envelopes) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1;
  return { total: envelopes.length, byDecision };
}
