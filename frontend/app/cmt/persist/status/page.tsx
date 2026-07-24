import Link from 'next/link';
import { getCommitteePersistStatus } from '../../../../lib/cmt-persist-status';

export default function CommitteePersistStatusPage() {
  const status = getCommitteePersistStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 117.1</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><Link href="/cmt/persist">Zum Persist Adapter</Link></p>
      </section>

      <section style={card}>
        <h3>Status</h3>
        <ul>
          <li>ready: {String(status.status.ready)}</li>
          <li>adapterKind: {status.status.adapterKind}</li>
          <li>storageEnabled: {String(status.status.storageEnabled)}</li>
          <li>preparedKey: {status.persist.persisted.key}</li>
          <li>itemCount: {status.persist.persisted.itemCount}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Checks</h3>
        <ul>{status.status.checks.map((check) => <li key={check}>{check}</li>)}</ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {status.provider}</li>
          <li>modelSelected: {status.modelSelected}</li>
          <li>dryRunOnly: {String(status.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(status.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(status.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(status.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
