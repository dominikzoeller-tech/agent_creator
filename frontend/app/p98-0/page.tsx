import { getP980Boundary } from '../../lib/p98-0-store';

export default function P980Page() {
  const boundary = getP980Boundary();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 98.0</h1>
      <h2>{boundary.label}</h2>
      <ul>
        <li>phase: {boundary.phase}</li>
        <li>priorReceiptPhase: {boundary.priorReceiptPhase}</li>
        <li>priorPolicyAuditPhase: {boundary.priorPolicyAuditPhase}</li>
        <li>provider: {boundary.provider}</li>
        <li>modelSelected: {boundary.modelSelected}</li>
        <li>dryRunOnly: {String(boundary.dryRunOnly)}</li>
        <li>finalDispatchBlocked: {String(boundary.finalDispatchBlocked)}</li>
        <li>executionGateClosed: {String(boundary.executionGateClosed)}</li>
        <li>networkCallAllowed: {String(boundary.networkCallAllowed)}</li>
        <li>providerDispatchAllowed: {String(boundary.providerDispatchAllowed)}</li>
        <li>boundaryRecorded: {String(boundary.boundaryRecorded)}</li>
      </ul>
    </main>
  );
}
