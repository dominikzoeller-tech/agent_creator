import Link from 'next/link';
import { getSecureMasterMainViewEntry } from '../../../../../../../lib/cmt-master-main-view-entry';

export default function SecureMasterMainViewEntryPage() {
  const entry = getSecureMasterMainViewEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 128.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Strukturierte Hauptansicht ist lokal testbar. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryMainPage}>Secure Master Hauptseite</Link></li>
          <li><Link href={entry.structuredStatusPage}>Structured Main View Status</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Visible Features</h3>
        <ul>{entry.visibleFeatures.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Nutzung</h3>
        <ol>{entry.recommendedUse.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sample Questions</h3>
        <ol>{entry.sampleQuestions.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>localTestable: {String(entry.safety.localTestable)}</li>
          <li>structuredMainViewVisible: {String(entry.safety.structuredMainViewVisible)}</li>
          <li>statusBadgesVisible: {String(entry.safety.statusBadgesVisible)}</li>
          <li>liveModelEnabled: {String(entry.safety.liveModelEnabled)}</li>
          <li>providerEnabled: {String(entry.safety.providerEnabled)}</li>
          <li>internetEnabled: {String(entry.safety.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(entry.safety.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
