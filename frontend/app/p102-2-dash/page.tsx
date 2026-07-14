import { getP1021Audit } from '../../lib/p102-1-store';

export default function P1022DashPage() {
  const audit = getP1021Audit();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 102.2 Dashboard</h1>
      <h2>Policy Audit Dashboard</h2>
      <ul>
        <li>phase: {audit.phase}</li>
        <li>auditPhase: {audit.auditPhase}</li>
        <li>provider: {audit.provider}</li>
        <li>modelSelected: {audit.modelSelected}</li>
        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>
        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>
        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>
        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>
        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>
        <li>policyAuditRecorded: {String(audit.policyAuditRecorded)}</li>
      </ul>
    </main>
  );
}
