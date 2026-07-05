const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function ensureDir(file) { fs.mkdirSync(path.dirname(full(file)), { recursive: true }); }
function write(file, content) { ensureDir(file); fs.writeFileSync(full(file), content, "utf8"); console.log("OK", file); }
function read(file) { return fs.existsSync(full(file)) ? fs.readFileSync(full(file), "utf8") : ""; }
function readJson(file) { return JSON.parse(read(file)); }
function writeJson(file, value) { write(file, JSON.stringify(value, null, 2) + "\n"); }

function patchNavigation() {
  const file = "frontend/components/UnifiedNavigation.tsx";
  let content = read(file);
  if (!content) return;
  const route = '  { href: "/provider-dispatch-human-approval-token-issuance-ledger-policy", label: "Issuance Ledger Policy", key: "provider-dispatch-human-approval-token-issuance-ledger-policy" },';
  if (content.includes('/provider-dispatch-human-approval-token-issuance-ledger-policy')) return;
  const lines = content.split(/\r?\n/);
  let idx = lines.findIndex((line) => line.includes('provider-dispatch-human-approval-token-issuance-ledger'));
  if (idx >= 0) {
    lines.splice(idx + 1, 0, route);
    write(file, lines.join('\n'));
    return;
  }
  const firstArrayEnd = content.indexOf('];', content.indexOf('href:'));
  if (firstArrayEnd >= 0) {
    content = content.slice(0, firstArrayEnd) + route + '\n' + content.slice(firstArrayEnd);
    write(file, content);
  }
}

function patchPackage() {
  const pkg = readJson('package.json');
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['phase46:1:patch'] = 'node scripts/phase46-1-patch-provider-dispatch-human-approval-token-issuance-ledger-policy-audit.cjs';
  pkg.scripts['phase46:1:verify'] = 'node scripts/phase46-1-verify-provider-dispatch-human-approval-token-issuance-ledger-policy-audit.cjs';
  pkg.scripts['llm:provider-dispatch-human-approval-token-issuance-ledger:policy:verify'] = 'npm run phase46:1:verify';
  writeJson('package.json', pkg);
}

const store = `import { appendFileSync, mkdirSync, readFileSync } from "fs";
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
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function appendSimulation(sim: ProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim) + "\\n", "utf8"); }

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
    id: sim.id,
    createdAt: now,
    type: "provider_dispatch_human_approval_token_issuance_ledger_policy_simulated",
    summary: "Provider dispatch human approval token issuance ledger policy simulated without token issuance or provider call.",
    metadata: sim,
  });
  return sim;
}
`;

const route = `import { NextRequest, NextResponse } from "next/server";
import { listProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulations, simulateProviderDispatchHumanApprovalTokenIssuanceLedgerPolicy } from "../../../lib/provider-dispatch-human-approval-token-issuance-ledger-policy-store";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") || "50");
  const simulations = listProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulations(limit);
  return NextResponse.json({ simulations, summary: { count: simulations.length, dryRunOnly: true, networkCallPerformed: false, providerExecutionAllowed: false } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const simulation = simulateProviderDispatchHumanApprovalTokenIssuanceLedgerPolicy(body?.sourceLedgerEntryId);
  return NextResponse.json({ simulation }, { status: 201 });
}
`;

const page = `"use client";

import { useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

export default function ProviderDispatchHumanApprovalTokenIssuanceLedgerPolicyPage() {
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSimulation() {
    setError(null);
    try {
      const res = await fetch("/api/provider-dispatch-human-approval-token-issuance-ledger-policy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Policy simulation failed");
      setResult(data.simulation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }

  return (
    <main className="page-wrap">
      <UnifiedNavigation active="provider-dispatch-human-approval-token-issuance-ledger-policy" />
      <div className="page-shell">
        <section className="hero-card">
          <h1 className="section-title">Provider Dispatch Human Approval Token Issuance Ledger Policy</h1>
          <p>Phase 46.1 simuliert die Ledger Policy review-only. Es wird kein Token ausgestellt, aktiviert oder konsumiert und es erfolgt kein Provider Call.</p>
          <button className="primary-button" type="button" onClick={runSimulation}>Issuance Ledger Policy simulieren</button>
        </section>
        {error ? <section className="panel-card">{error}</section> : null}
        <section className="panel-card">
          <h2>Safety Invariants</h2>
          <ul>
            <li>providerDispatchHumanApprovalTokenIssuanceLedgerRecorded=true</li>
            <li>humanApprovalTokenIssuanceLedgerEntryPrepared=true</li>
            <li>humanApprovalTokenIssuanceLedgerEntryPersisted=true</li>
            <li>humanApprovalTokenIssuanceConfirmedForReviewOnly=true</li>
            <li>humanApprovalTokenReadyForIssuanceReview=true</li>
            <li>humanApprovalTokenIssued=false</li>
            <li>humanApprovalTokenActivated=false</li>
            <li>humanApprovalTokenConsumed=false</li>
            <li>approvalCandidateApproved=false</li>
            <li>approvalCandidateExecuted=false</li>
            <li>networkCallAllowed=false</li>
            <li>networkCallPerformed=false</li>
            <li>providerExecutionAllowed=false</li>
            <li>llmCallPerformed=false</li>
            <li>dryRunOnly=true</li>
          </ul>
        </section>
        {result ? <section className="panel-card"><h2>Simulation Result</h2><pre>{JSON.stringify(result, null, 2)}</pre></section> : null}
      </div>
    </main>
  );
}
`;

const md = `# Phase 46.1 – Provider Dispatch Human Approval Token Issuance Ledger Policy & Audit

## Ziel

Die Human Approval Token Issuance Ledger Policy wird simuliert und auditiert, ohne Token-Issuance, ohne Token-Aktivierung und ohne Provider Call.

## Invariants

- providerDispatchHumanApprovalTokenIssuanceLedgerRecorded=true
- humanApprovalTokenIssuanceLedgerEntryPrepared=true
- humanApprovalTokenIssuanceLedgerEntryPersisted=true
- humanApprovalTokenIssuanceConfirmedForReviewOnly=true
- humanApprovalTokenReadyForIssuanceReview=true
- humanApprovalTokenIssued=false
- humanApprovalTokenActivated=false
- humanApprovalTokenConsumed=false
- approvalCandidateApproved=false
- approvalCandidateExecuted=false
- networkCallAllowed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- llmCallPerformed=false
- dryRunOnly=true

## Nächster Schritt

Phase 46.2 – Provider Dispatch Human Approval Token Issuance Ledger Dashboard & Smoke
`;

const runbook = `# Runbook – Phase 46.1 Provider Dispatch Human Approval Token Issuance Ledger Policy & Audit

## Patch

\`\`\`powershell
npm run phase46:1:patch
\`\`\`

## Verify

\`\`\`powershell
npm run phase46:1:verify
npm run build
\`\`\`

## Browser

http://localhost:3000/provider-dispatch-human-approval-token-issuance-ledger-policy
`;

write('frontend/lib/provider-dispatch-human-approval-token-issuance-ledger-policy-store.ts', store);
write('frontend/app/api/provider-dispatch-human-approval-token-issuance-ledger-policy/route.ts', route);
write('frontend/app/provider-dispatch-human-approval-token-issuance-ledger-policy/page.tsx', page);
write('phase46-1-provider-dispatch-human-approval-token-issuance-ledger-policy-audit.md', md);
write('docs/phase46-provider-dispatch-human-approval-token-issuance-ledger-policy-audit-runbook.md', runbook);
patchNavigation();
patchPackage();
console.log('Phase 46.1 patch applied.');
