const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function ensureDir(file) { fs.mkdirSync(path.dirname(full(file)), { recursive: true }); }
function read(file) { return fs.existsSync(full(file)) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content) { ensureDir(file); fs.writeFileSync(full(file), content, "utf8"); console.log("OK " + file); }

function patchPackageJson() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["phase45:1:patch"] = "node scripts/phase45-1-patch-provider-dispatch-human-approval-token-issuance-confirmation-policy-audit.cjs";
  pkg.scripts["phase45:1:verify"] = "node scripts/phase45-1-verify-provider-dispatch-human-approval-token-issuance-confirmation-policy-audit.cjs";
  pkg.scripts["llm:provider-dispatch-human-approval-token-issuance-confirmation:policy:verify"] = "npm run phase45:1:verify";
  write(file, JSON.stringify(pkg, null, 2) + "\n");
}

function patchNavigation() {
  const file = "frontend/components/UnifiedNavigation.tsx";
  if (!fs.existsSync(full(file))) return;
  let nav = read(file);
  const route = '{ href: "/provider-dispatch-human-approval-token-issuance-confirmation-policy", label: "Token Issuance Policy", key: "provider-dispatch-human-approval-token-issuance-confirmation-policy" }';
  if (nav.includes("provider-dispatch-human-approval-token-issuance-confirmation-policy")) return;

  const lines = nav.split(/\r?\n/);
  const markerIndex = lines.findIndex((line) => line.includes("provider-dispatch-human-approval-token-issuance-confirmation"));
  if (markerIndex >= 0) {
    const indent = (lines[markerIndex].match(/^\s*/) || [""])[0];
    lines.splice(markerIndex + 1, 0, indent + route + ",");
    nav = lines.join("\n");
  } else {
    nav += "\n// Phase 45.1 navigation marker: /provider-dispatch-human-approval-token-issuance-confirmation-policy Token Issuance Policy provider-dispatch-human-approval-token-issuance-confirmation-policy\n";
  }
  write(file, nav);
}

function createStore() {
  write("frontend/lib/provider-dispatch-human-approval-token-issuance-confirmation-policy-store.ts", `import { appendFileSync, mkdirSync, readFileSync } from "fs";
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

function dataDir(): string { return path.join(process.cwd(), "data"); }
function inputPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-confirmations.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-human-approval-token-issuance-confirmation-policy-simulations.jsonl"); }
function auditPath(): string { return path.join(dataDir(), "governance-audit.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function appendJsonl(file: string, value: unknown): void { ensureStore(); appendFileSync(file, JSON.stringify(value) + "\n", "utf8"); }

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
  appendJsonl(auditPath(), { id: makeId("audit"), createdAt: now, eventType: "provider_dispatch_human_approval_token_issuance_confirmation_policy_simulated", subjectId: sim.id, severity: "info", summary: "Provider dispatch human approval token issuance confirmation policy simulated without provider call.", metadata: sim });
  return sim;
}
`);
}

function createApiRoute() {
  write("frontend/app/api/provider-dispatch-human-approval-token-issuance-confirmation-policy/route.ts", `import { NextRequest, NextResponse } from "next/server";
import { listProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulations, simulateProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicy } from "../../../lib/provider-dispatch-human-approval-token-issuance-confirmation-policy-store";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") || "50");
  const simulations = listProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulations(limit);
  return NextResponse.json({ summary: { count: simulations.length, dryRunOnly: true, networkCallPerformed: false, providerExecutionAllowed: false }, simulations });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const simulation = simulateProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicy(body?.sourceConfirmationId);
  return NextResponse.json({ simulation }, { status: 201 });
}
`);
}

function createPage() {
  write("frontend/app/provider-dispatch-human-approval-token-issuance-confirmation-policy/page.tsx", `"use client";

import { useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Simulation = { id: string; createdAt: string; sourceConfirmationId: string; checks?: Array<{ name: string; passed: boolean; detail: string }> };

export default function ProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicyPage() {
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSimulation() {
    setError(null);
    const response = await fetch("/api/provider-dispatch-human-approval-token-issuance-confirmation-policy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const payload = await response.json();
    if (!response.ok) { setError(payload?.error || "Policy simulation failed"); return; }
    setSimulation(payload.simulation);
  }

  return (
    <main className="page-wrap">
      <UnifiedNavigation active="provider-dispatch-human-approval-token-issuance-confirmation-policy" />
      <div className="page-shell">
        <section className="hero-card">
          <h1 className="section-title">Provider Dispatch Human Approval Token Issuance Confirmation Policy</h1>
          <p style={{ lineHeight: 1.6 }}>Phase 45.1 simuliert die Policy zur Issuance Confirmation. Es bleibt review-only, dry-run-only und ohne Provider Call.</p>
          <button className="primary-button" onClick={runSimulation}>Provider Dispatch Human Approval Token Issuance Confirmation Policy simulieren</button>
        </section>
        {error ? <section className="panel-card">{error}</section> : null}
        <section className="panel-card">
          <h2>Policy Invariants</h2>
          <ul>
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
        {simulation ? <section className="panel-card"><h2>Letzte Simulation</h2><pre>{JSON.stringify(simulation, null, 2)}</pre></section> : null}
      </div>
    </main>
  );
}
`);
}

function createDocs() {
  write("phase45-1-provider-dispatch-human-approval-token-issuance-confirmation-policy-audit.md", `# Phase 45.1 – Provider Dispatch Human Approval Token Issuance Confirmation Policy & Audit

## Ziel

Policy- und Audit-Simulation fuer die Provider Dispatch Human Approval Token Issuance Confirmation. Kein Token wird ausgestellt und kein Provider Call wird ausgefuehrt.

## Safety Invariants

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

## Next

Phase 45.2 – Provider Dispatch Human Approval Token Issuance Confirmation Dashboard & Smoke
`);
  write("docs/phase45-provider-dispatch-human-approval-token-issuance-confirmation-policy-audit-runbook.md", `# Runbook – Phase 45.1 Provider Dispatch Human Approval Token Issuance Confirmation Policy & Audit

## Patch

\`\`\`powershell
npm run phase45:1:patch
\`\`\`

## Verify

\`\`\`powershell
npm run phase45:1:verify
npm run build
\`\`\`

## Browser

http://localhost:3000/provider-dispatch-human-approval-token-issuance-confirmation-policy
`);
}

patchNavigation();
createStore();
createApiRoute();
createPage();
createDocs();
patchPackageJson();
console.log("Phase 45.1 patch applied.");
