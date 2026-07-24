import Link from 'next/link';
import { getCommitteeLandingStatus } from '../../../../lib/cmt-land-status';

export default function CommitteeLandingStatusPage() {
  const status = getCommitteeLandingStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 115.1</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><strong>ready:</strong> {String(status.status.ready)}</p>
        <p><Link href="/cmt/land">Zur Landing Page</Link></p>
      </section>

      <section style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <article style={card}>
          <h3>Pages</h3>
          <ul>{status.status.pages.map((item) => <li key={item}><Link href={item}>{item}</Link></li>)}</ul>
        </article>

        <article style={card}>
          <h3>API Routes</h3>
          <ul>{status.status.apiRoutes.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>

        <article style={card}>
          <h3>Checks</h3>
          <ul>{status.status.checks.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
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
