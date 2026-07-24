import Link from 'next/link';
import { getCommitteeHomeEntry } from '../../../lib/cmt-home';

export default function CommitteeHomeEntryPage() {
  const home = getCommitteeHomeEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 116.1</h1>
        <h2>{home.entry.title}</h2>
        <p>{home.entry.description}</p>
        <p><Link href={home.entry.href}>{home.entry.cta}</Link></p>
      </section>

      <section style={card}>
        <h3>Highlights</h3>
        <ul>{home.entry.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Navigation Snapshot</h3>
        <ul>{home.nav.nav.items.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {home.provider}</li>
          <li>modelSelected: {home.modelSelected}</li>
          <li>dryRunOnly: {String(home.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(home.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(home.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(home.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
