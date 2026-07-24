import Link from 'next/link';
import { getCommitteeAppEntry } from '../../../lib/cmt-app-entry';

export default function CommitteeAppEntryPage() {
  const entry = getCommitteeAppEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 116.2</h1>
        <h2>{entry.appEntry.title}</h2>
        <p><strong>{entry.appEntry.badge}</strong></p>
        <p>{entry.appEntry.description}</p>
        <p><Link href={entry.appEntry.href}>Gremium Home oeffnen</Link></p>
      </section>

      <section style={card}>
        <h3>App Routes</h3>
        <ul>{entry.appEntry.routes.map((route) => <li key={route}><Link href={route}>{route}</Link></li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Home Entry</h3>
        <p>{entry.home.entry.description}</p>
        <p><Link href={entry.home.entry.href}>{entry.home.entry.cta}</Link></p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {entry.provider}</li>
          <li>modelSelected: {entry.modelSelected}</li>
          <li>dryRunOnly: {String(entry.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(entry.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(entry.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(entry.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
