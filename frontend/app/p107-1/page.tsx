import { getP1071Audit } from '../../lib/p107-1-store';

export default function P1071Page() {
  const audit = getP1071Audit();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 107.1</h1>
      <h2>{audit.auditLabel}</h2>
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
        <li>externalDataTransferAllowed: {String(audit.externalDataTransferAllowed)}</li>
        <li>policyAuditRecorded: {String(audit.policyAuditRecorded)}</li>
        <li>policyDecision: {audit.policyDecision}</li>
      </ul>
    </main>
  );
}
