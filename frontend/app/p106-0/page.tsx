import { getP1060Boundary } from '../../lib/p106-0-store';

export default function P1060Page() {
  const boundary = getP1060Boundary();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 106.0</h1>
      <h2>{boundary.label}</h2>
      <ul>
        <li>phase: {boundary.phase}</li>
        <li>provider: {boundary.provider}</li>
        <li>modelSelected: {boundary.modelSelected}</li>
        <li>dryRunOnly: {String(boundary.dryRunOnly)}</li>
        <li>finalDispatchBlocked: {String(boundary.finalDispatchBlocked)}</li>
        <li>executionGateClosed: {String(boundary.executionGateClosed)}</li>
        <li>networkCallAllowed: {String(boundary.networkCallAllowed)}</li>
        <li>providerDispatchAllowed: {String(boundary.providerDispatchAllowed)}</li>
        <li>externalDataTransferAllowed: {String(boundary.externalDataTransferAllowed)}</li>
      </ul>
    </main>
  );
}
