import { getP1030Boundary } from '../../lib/p103-0-store';

export default function P1030Page() {
  const boundary = getP1030Boundary();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 103.0</h1>
      <h2>{boundary.label}</h2>
      <ul>
        <li>phase: {boundary.phase}</li>
        <li>priorBoundaryPhase: {boundary.priorBoundaryPhase}</li>
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
