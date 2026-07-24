import Link from 'next/link';
import { getSecureMasterGuide } from '../../../../../lib/cmt-master-secure-guide';

export default function SecureMasterGuidePage() {
  const guide = getSecureMasterGuide();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 122.2</h1>
        <h2>{guide.label}</h2>
        <p><strong>Jetzt lokal testen:</strong> <Link href={guide.openNow}>{guide.openNow}</Link></p>
        <p><strong>Status:</strong> Secure Master Agent lokal testbar, noch nicht live mit KI-Modell.</p>
      </section>
      <section style={card}>
        <h3>Schnelltest</h3>
        <ol>{guide.quickTestSteps.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Erwartetes Verhalten</h3>
        <ul>{guide.expectedBehaviors.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Noch nicht live</h3>
        <ul>{guide.notYetLive.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Bauschritte</h3>
        <ol>{guide.nextBuildSteps.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety</h3>
        <ul>{Object.entries(guide.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>
    </main>
  );
}
