import Link from 'next/link';
import { getCommitteeLandingGuide } from '../../../../lib/cmt-land-guide';

export default function CommitteeLandingGuidePage() {
  const guide = getCommitteeLandingGuide();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 115.2</h1>
        <h2>{guide.label}</h2>
        <p>{guide.guide.title}</p>
        <p><Link href="/cmt/land">Zur Landing Page</Link></p>
      </section>

      <section style={card}>
        <h3>Demo Ablauf</h3>
        <ol>{guide.guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Links</h3>
        <ul>
          <li><Link href={guide.guide.demoPath}>Demo</Link></li>
          <li><Link href={guide.guide.reportPath}>Report</Link></li>
          <li><Link href={guide.guide.sharePath}>Share</Link></li>
          <li><Link href={guide.guide.statusPath}>Status</Link></li>
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {guide.provider}</li>
          <li>modelSelected: {guide.modelSelected}</li>
          <li>dryRunOnly: {String(guide.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(guide.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(guide.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(guide.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
