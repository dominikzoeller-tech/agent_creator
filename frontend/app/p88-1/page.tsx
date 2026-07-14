import { getP881Audit } from '../../lib/p88-1-store';

export default function P881Page() {
  const audit = getP881Audit();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 88.1</h1>
      <h2>{audit.label}</h2>
      <ul>
        <li>phase: {audit.phase}</li>
        <li>boundaryPhase: {audit.boundaryPhase}</li>
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
