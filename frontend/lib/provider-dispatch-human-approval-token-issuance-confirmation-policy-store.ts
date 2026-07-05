import { appendFileSync, mkdirSync, readFileSync } from "fs";
import path from "path";

export type ProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulation = {
  id: string;
  createdAt: string;
  sourceConfirmationId: string;
  policyMode: "human_approval_token_issuance_confirmation_policy_audit_only";
  humanApprovalTokenIssuanceConfirmedForReviewOnly: true;
  humanApprovalTokenReadyForIssuanceReview: true;
  humanApprovalTokenIssued: false;
  humanApprovalTokenActivated: false;
  humanApprovalTokenConsumed: false;
  approvalCandidateApproved: false;
  approvalCandidateExecuted: false;
  networkCallAllowed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
};

type SourceConfirmation = { id?: string };

function dataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data");
}

function inputPath(): string {
  return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-confirmation-envelopes.jsonl");
}

function simulationPath(): string {
  return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-confirmation-policy-simulations.jsonl");
}

function auditPath(): string {
  return path.join(dataDir(), "governance-audit.jsonl");
}

function ensureStore(): void {
  mkdirSync(dataDir(), { recursive: true });
}

function readJsonl(file: string): any[] {
  try {
    return readFileSync(file, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function makeId(prefix: string): string {
  const now = new Date().toISOString();
  return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8);
}

function appendJsonl(file: string, value: unknown): void {
  ensureStore();
  appendFileSync(file, JSON.stringify(value) + "\n", "utf8");
}

export function listProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulations(limit = 50): ProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulation[] {
  return readJsonl(simulationPath()).slice(-limit).reverse() as ProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulation[];
}

export function listProviderDispatchHumanApprovalTokenIssuanceConfirmations(limit = 50): SourceConfirmation[] {
  return readJsonl(inputPath()).slice(-limit).reverse() as SourceConfirmation[];
}

export function simulateProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicy(sourceConfirmationId?: string): ProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulation {
  const confirmations = listProviderDispatchHumanApprovalTokenIssuanceConfirmations(200);
  const source = confirmations.find((item) => item.id === sourceConfirmationId) || confirmations[0] || { id: "manual-confirmation-reference" };
  const now = new Date().toISOString();
  const sim: ProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulation = {
    id: makeId("pdhat-issuance-confirmation-policy"),
    createdAt: now,
    sourceConfirmationId: String(source.id || "manual-confirmation-reference"),
    policyMode: "human_approval_token_issuance_confirmation_policy_audit_only",
    humanApprovalTokenIssuanceConfirmedForReviewOnly: true,
    humanApprovalTokenReadyForIssuanceReview: true,
    humanApprovalTokenIssued: false,
    humanApprovalTokenActivated: false,
    humanApprovalTokenConsumed: false,
    approvalCandidateApproved: false,
    approvalCandidateExecuted: false,
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
      { name: "review-only confirmation", passed: true, detail: "Confirmation is evaluated only for human review." },
      { name: "token not issued", passed: true, detail: "Human approval token remains unissued." },
      { name: "no provider call", passed: true, detail: "No network call or provider execution is allowed." },
      { name: "dry-run invariant", passed: true, detail: "Dry-run only remains enforced." }
    ]
  };
  appendJsonl(simulationPath(), sim);
  appendJsonl(auditPath(), {
    id: makeId("audit"),
    createdAt: now,
    eventType: "provider_dispatch_human_approval_token_issuance_confirmation_policy_simulated",
    subjectId: sim.id,
    severity: "info",
    summary: "Provider dispatch human approval token issuance confirmation policy simulated without provider call.",
    metadata: sim
  });
  return sim;
}
