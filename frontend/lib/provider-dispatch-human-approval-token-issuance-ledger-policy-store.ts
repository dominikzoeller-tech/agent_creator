import { appendFileSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulation = {
  id: string;
  sourceLedgerEntryId: string;
  createdAt: string;
  policyMode: "human_approval_token_issuance_ledger_policy_review_only";
  decision: "simulation_allowed_ledger_review_only";
  providerDispatchHumanApprovalTokenIssuanceLedgerRecorded: true;
  humanApprovalTokenIssuanceLedgerEntryPrepared: true;
  humanApprovalTokenIssuanceLedgerEntryPersisted: true;
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
  llmCallPerformed: false;
  dryRunOnly: true;
  checks: Array<{ key: string; passed: boolean; detail: string }>;
};

function dataDir(): string { return path.join(process.cwd(), "data"); }
function ledgerPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-ledger.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-ledger-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function appendSimulation(sim: ProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim) + "\n", "utf8"); }

export function listProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulations(limit = 50): ProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulation[] {
  return readJsonl(simulationPath()).slice(-limit).reverse();
}

export function simulateProviderDispatchHumanApprovalTokenIssuanceLedgerPolicy(sourceLedgerEntryId?: string): ProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulation {
  ensureStore();
  const entries = readJsonl(ledgerPath());
  const source = sourceLedgerEntryId ? entries.find((entry) => entry.id === sourceLedgerEntryId) : entries[entries.length - 1];
  const now = new Date().toISOString();
  const sim: ProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulation = {
    id: makeId("issuance-ledger-policy"),
    sourceLedgerEntryId: source?.id || sourceLedgerEntryId || "none",
    createdAt: now,
    policyMode: "human_approval_token_issuance_ledger_policy_review_only",
    decision: "simulation_allowed_ledger_review_only",
    providerDispatchHumanApprovalTokenIssuanceLedgerRecorded: true,
    humanApprovalTokenIssuanceLedgerEntryPrepared: true,
    humanApprovalTokenIssuanceLedgerEntryPersisted: true,
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
    llmCallPerformed: false,
    dryRunOnly: true,
    checks: [
      { key: "ledger_entry_review_only", passed: true, detail: "Ledger policy simulation remains review-only." },
      { key: "token_not_issued", passed: true, detail: "Human approval token is not issued." },
      { key: "no_provider_call", passed: true, detail: "No provider dispatch or network call is allowed." },
      { key: "dry_run_only", passed: true, detail: "Policy simulation is dry-run-only." },
    ],
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: sim.sourceLedgerEntryId,
    status: sim.decision,
    riskLevel: "critical",
    summary: "Provider dispatch human approval token issuance ledger policy simulated without token issuance or provider call.",
    metadata: {
      source: "phase46.1-provider-dispatch-human-approval-token-issuance-ledger-policy",
      simulationId: sim.id,
      sourceLedgerEntryId: sim.sourceLedgerEntryId,
      humanApprovalTokenIssued: false,
      humanApprovalTokenActivated: false,
      humanApprovalTokenConsumed: false,
      networkCallPerformed: false,
      providerExecutionAllowed: false,
      llmCallPerformed: false,
      dryRunOnly: true
    }
  });
  return sim;
}
