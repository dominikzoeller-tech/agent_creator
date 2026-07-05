"use client";

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
