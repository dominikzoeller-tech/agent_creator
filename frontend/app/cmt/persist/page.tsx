import { getCommitteePersistAdapterDemo } from '../../../lib/cmt-persist';

export default function CommitteePersistPage() {
  const persist = getCommitteePersistAdapterDemo();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 117.0</h1>
        <h2>{persist.label}</h2>
        <p>Persistenz-Adapter fuer Gremiums-Sessions ist dry-run-only vorbereitet.</p>
      </section>

      <section style={card}>
        <h3>Adapter</h3>
        <ul>
          <li>kind: {persist.adapter.kind}</li>
          <li>canRead: {String(persist.adapter.canRead)}</li>
          <li>canWrite: {String(persist.adapter.canWrite)}</li>
          <li>externalStorageEnabled: {String(persist.adapter.externalStorageEnabled)}</li>
          <li>storageTarget: {persist.adapter.storageTarget}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Prepared Session</h3>
        <ul>
          <li>key: {persist.persisted.key}</li>
          <li>itemCount: {persist.persisted.itemCount}</li>
          <li>status: {persist.persisted.status}</li>
        </ul>
        <p>{persist.persisted.note}</p>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Session Items</h3>
        <ul>{persist.session.history.items.map((item) => <li key={item.id}>{item.question}</li>)}</ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {persist.provider}</li>
          <li>modelSelected: {persist.modelSelected}</li>
          <li>dryRunOnly: {String(persist.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(persist.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(persist.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(persist.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
