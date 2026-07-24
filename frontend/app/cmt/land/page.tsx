import Link from 'next/link';
import { getCommitteeLanding } from '../../../lib/cmt-land';

export default function CommitteeLandingPage() {
  const landing = getCommitteeLanding();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 115.0</h1>
        <h2>{landing.hero.title}</h2>
        <p>{landing.hero.subtitle}</p>
        <p>
          <Link href={landing.hero.primaryPath}>Demo starten</Link>
          {' | '}
          <Link href={landing.hero.secondaryPath}>Share erzeugen</Link>
        </p>
      </section>

      <section style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <h3>Navigation</h3>
        {landing.links.map((link) => (
          <article key={link.href} style={card}>
            <h4><Link href={link.href}>{link.title}</Link></h4>
            <p>{link.description}</p>
          </article>
        ))}
      </section>

      <section style={card}>
        <h3>Demo Snapshot</h3>
        <p><strong>Demo:</strong> {landing.demo.finalAnswer.headline}</p>
        <p><strong>Report:</strong> {landing.report.report.title}</p>
        <p><strong>Share:</strong> {landing.share.share.title}</p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {landing.provider}</li>
          <li>modelSelected: {landing.modelSelected}</li>
          <li>dryRunOnly: {String(landing.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(landing.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(landing.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(landing.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
