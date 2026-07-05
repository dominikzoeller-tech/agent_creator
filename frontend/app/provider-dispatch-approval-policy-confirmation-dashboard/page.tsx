"use client";

import { UnifiedNavigation } from "../../components/UnifiedNavigation";

export default function ProviderDispatchApprovalPolicyConfirmationDashboardPage() {
  return (
    <main className="page-wrap">
      <UnifiedNavigation active="provider-dispatch-approval-policy-confirmation-dashboard" />
      <div className="page-shell">
        <section className="hero-card">
          <h1 className="section-title">Provider Dispatch Approval Policy Confirmation Dashboard</h1>
          <p style={{ lineHeight: 1.6 }}>
            Phase 42.2 fasst Approval Policy Confirmation Envelopes, Policy Simulationen,
            Approval Candidate Envelopes und Governance Audit zusammen. Alles bleibt metadata-only und dry-run-only.
            Keine Approval-Ausführung, kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf, kein Prompt Payload,
            keine Secret-Werte und keine Provider Response.
          </p>
        </section>

        <section className="panel-card">
          <h2>Approval Policy Confirmation Übersicht</h2>
          <ul>
            <li>Approval Policy Confirmation Envelope: /provider-dispatch-approval-policy-confirmation-envelope</li>
            <li>Approval Policy Confirmation Policy: /provider-dispatch-approval-policy-confirmation-policy</li>
            <li>Approval Policy Confirmation Dashboard: /provider-dispatch-approval-policy-confirmation-dashboard</li>
            <li>Approval Candidate Envelope: /provider-dispatch-approval-candidate-envelope</li>
            <li>Approval Candidate Policy: /provider-dispatch-approval-candidate-envelope-policy</li>
            <li>Approval Candidate Dashboard: /provider-dispatch-approval-candidate-envelope-dashboard</li>
            <li>Governance Audit: /governance-audit</li>
          </ul>
        </section>

        <section className="panel-card">
          <h2>Safety Invariants</h2>
          <ul>
            <li>providerDispatchApprovalPolicyConfirmationEnvelopePrepared=true</li>
            <li>approvalPolicyConfirmationEnvelopePrepared=true</li>
            <li>approvalPolicyConfirmationEnvelopePersisted=true</li>
            <li>approvalPolicyConfirmedForHumanApprovalOnly=true</li>
            <li>approvalCandidateReadyForHumanApproval=true</li>
            <li>approvalCandidateApproved=false</li>
            <li>approvalCandidateExecuted=false</li>
            <li>approvalCandidateContainsProviderResponse=false</li>
            <li>approvalCandidateContainsPromptPayload=false</li>
            <li>approvalCandidateContainsSecrets=false</li>
            <li>releaseCandidateReadyForHumanReview=true</li>
            <li>releaseCandidateApproved=false</li>
            <li>releaseCandidateExecuted=false</li>
            <li>finalDispatchAllowed=false</li>
            <li>providerDispatchPerformed=false</li>
            <li>commandEnvelopeExecuted=false</li>
            <li>executionGateOpen=false</li>
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
