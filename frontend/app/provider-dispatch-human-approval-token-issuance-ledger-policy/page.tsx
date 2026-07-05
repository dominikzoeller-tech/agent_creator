"use client";

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
