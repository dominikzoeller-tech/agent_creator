import Link from 'next/link';
import { getCommitteeLocalJsonGuide } from '../../../../lib/cmt-json-guide';

export default function CommitteeLocalJsonGuidePage() {
  const guide = getCommitteeLocalJsonGuide();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 118.2</h1>
        <h2>{guide.label}</h2>
        <p>{guide.guide.title}</p>
        <p><Link href="/cmt/json/status">Zum Local JSON Status</Link></p>
      </section>

      <section style={card}>
        <h3>Schritte</h3>
        <ol>{guide.guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Geplante Dateien</h3>
        <ul>{guide.guide.plannedFiles.map((file) => <li key={file}>{file}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Jetzt blockiert</h3>
        <ul>{guide.guide.blockedNow.map((item) => <li key={item}>{item}</li>)}</ul>
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
