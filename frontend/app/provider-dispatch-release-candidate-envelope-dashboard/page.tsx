"use client";

import { UnifiedNavigation } from "../../components/UnifiedNavigation";

export default function ProviderDispatchReleaseCandidateEnvelopeDashboardPage() {
  return (
    <main className="page-wrap">
      <UnifiedNavigation active="provider-dispatch-release-candidate-envelope-dashboard" />
      <div className="page-shell">
        <section className="hero-card" style={{ background: "linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)", borderColor: "#c7d2fe" }}>
          <h1 className="section-title">Provider Dispatch Release Candidate Envelope Dashboard</h1>
          <p style={{ lineHeight: 1.6 }}>
            Phase 40.2 fasst Provider Dispatch Release Candidate Envelopes, Policy Simulationen,
            Transcript Envelopes und Governance Audit zusammen. Alles bleibt metadata-only und dry-run-only.
            Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte
            und keine Provider Response.
          </p>
        </section>

        <section className="panel-card">
          <h2>Provider Dispatch Release Candidate Envelope Übersicht</h2>
          <div className="metrics-grid">
            /provider-dispatch-release-candidate-envelope<span className="metric-label">Release Candidate Envelope</span><strong className="metric-value">Öffnen</strong></a>
            /provider-dispatch-release-candidate-envelope-policy<span className="metric-label">Release Candidate Policy</span><strong className="metric-value">Öffnen</strong></a>
            /provider-dispatch-transcript-envelope<span className="metric-label">Transcript Envelope</span><strong className="metric-value">Öffnen</strong></a>
            /governance-audit<span className="metric-label">Governance Audit</span><strong className="metric-value">Öffnen</strong></a>
          </div>
        </section>

        <section className="panel-card">
          <h2>Safety Invariants</h2>
          <ul>
            <li>providerDispatchReleaseCandidateEnvelopePrepared=true</li>
            <li>releaseCandidateEnvelopePrepared=true</li>
            <li>releaseCandidateEnvelopePersisted=true</li>
            <li>releaseCandidateReadyForHumanReview=true</li>
            <li>releaseCandidateApproved=false</li>
            <li>releaseCandidateExecuted=false</li>
            <li>releaseCandidateContainsProviderResponse=false</li>
            <li>releaseCandidateContainsPromptPayload=false</li>
            <li>releaseCandidateContainsSecrets=false</li>
            <li>networkCallAllowed=false</li>
            <li>networkCallPerformed=false</li>
            <li>providerExecutionAllowed=false</li>
            <li>realLlmCallAllowed=false</li>
            <li>llmCallPerformed=false</li>
            <li>executionAllowed=false</li>
            <li>toolExecutionAllowed=false</li>
            <li>agentExecutionAllowed=false</li>
            <li>dryRunOnly=true</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
