import { getP930Receipt } from '../../lib/p93-0-store';

export default function P930Page() {
  const receipt = getP930Receipt();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 93.0</h1>
      <h2>{receipt.label}</h2>
      <ul>
        <li>phase: {receipt.phase}</li>
        <li>priorBoundaryPhase: {receipt.priorBoundaryPhase}</li>
        <li>priorPolicyAuditPhase: {receipt.priorPolicyAuditPhase}</li>
        <li>provider: {receipt.provider}</li>
        <li>modelSelected: {receipt.modelSelected}</li>
        <li>dryRunOnly: {String(receipt.dryRunOnly)}</li>
        <li>finalDispatchBlocked: {String(receipt.finalDispatchBlocked)}</li>
        <li>executionGateClosed: {String(receipt.executionGateClosed)}</li>
        <li>networkCallAllowed: {String(receipt.networkCallAllowed)}</li>
        <li>providerDispatchAllowed: {String(receipt.providerDispatchAllowed)}</li>
        <li>receiptRecorded: {String(receipt.receiptRecorded)}</li>
      </ul>
    </main>
  );
}
