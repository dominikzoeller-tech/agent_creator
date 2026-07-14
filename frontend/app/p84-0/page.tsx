import { getP840Boundary } from '../../lib/p84-0-store';

export default function P840Page() {
  const boundary = getP840Boundary();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 84.0</h1>
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
        <li>promptPayloadPresent: {String(boundary.promptPayloadPresent)}</li>
        <li>secretsPresent: {String(boundary.secretsPresent)}</li>
        <li>providerResponsePresent: {String(boundary.providerResponsePresent)}</li>
      </ul>
    </main>
  );
}
