import { getP891Audit } from '../../lib/p89-1-store';

export default function P891Page() {
  const audit = getP891Audit();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 89.1</h1>
      <h2>{audit.label}</h2>
      <ul>
        <li>phase: {audit.phase}</li>
        <li>receiptPhase: {audit.receiptPhase}</li>
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
