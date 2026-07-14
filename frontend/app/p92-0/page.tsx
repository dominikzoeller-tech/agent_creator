import { getP920Boundary } from '../../lib/p92-0-store';

export default function P920Page() {
  const boundary = getP920Boundary();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 92.0</h1>
      <h2>{boundary.label}</h2>
      <ul>
        <li>phase: {boundary.phase}</li>
        <li>priorReceiptPhase: {boundary.priorReceiptPhase}</li>
        <li>provider: {boundary.provider}</li>
        <li>modelSelected: {boundary.modelSelected}</li>
        <li>dryRunOnly: {String(boundary.dryRunOnly)}</li>
        <li>finalDispatchBlocked: {String(boundary.finalDispatchBlocked)}</li>
        <li>executionGateClosed: {String(boundary.executionGateClosed)}</li>
        <li>networkCallAllowed: {String(boundary.networkCallAllowed)}</li>
        <li>providerDispatchAllowed: {String(boundary.providerDispatchAllowed)}</li>
        <li>finalBoundaryRecorded: {String(boundary.finalBoundaryRecorded)}</li>
      </ul>
    </main>
  );
}
