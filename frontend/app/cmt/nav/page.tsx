import Link from 'next/link';
import { getCommitteeMainNav } from '../../../lib/cmt-nav';

export default function CommitteeMainNavPage() {
  const mainNav = getCommitteeMainNav();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 116.0</h1>
        <h2>{mainNav.label}</h2>
        <p>Die MVP-Navigation buendelt Landing, Demo, Report, Share, Guide und Status.</p>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h3>{mainNav.nav.title}</h3>
        {mainNav.nav.items.map((item) => (
          <article key={item.href} style={card}>
            <h4><Link href={item.href}>{item.label}</Link></h4>
            <p>kind: {item.kind}</p>
          </article>
        ))}
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {mainNav.provider}</li>
          <li>modelSelected: {mainNav.modelSelected}</li>
          <li>dryRunOnly: {String(mainNav.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(mainNav.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(mainNav.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(mainNav.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
