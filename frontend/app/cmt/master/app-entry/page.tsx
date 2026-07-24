import Link from 'next/link';
import { getSecureMasterAppEntry } from '../../../lib/cmt-master-app-entry';

export default function SecureMasterAppEntryPage() {
  const entry = getSecureMasterAppEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 123.2</h1>
        <h2>{entry.appEntry.title}</h2>
        <p>{entry.appEntry.subtitle}</p>
        <p><strong>Status:</strong> lokal testbar, noch nicht live mit KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Start</h3>
        <p><Link href={entry.appEntry.primaryHref}>Secure Master Agent starten</Link></p>
        <p><strong>Bookmark:</strong> {entry.appEntry.recommendedBookmark}</p>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Weitere Einstiege</h3>
        <ul>
          <li><Link href={entry.appEntry.secondaryHref}>Home Entry</Link></li>
          <li><Link href={entry.appEntry.statusHref}>Navigation Status</Link></li>
          <li><Link href={entry.appEntry.guideHref}>Guide</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Links</h3>
        <ul>{entry.visibleLinks.map((href) => <li key={href}><Link href={href}>{href}</Link></li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>localTestable: {String(entry.status.localTestable)}</li>
          <li>liveModelEnabled: {String(entry.status.liveModelEnabled)}</li>
          <li>providerEnabled: {String(entry.status.providerEnabled)}</li>
          <li>internetEnabled: {String(entry.status.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(entry.status.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
