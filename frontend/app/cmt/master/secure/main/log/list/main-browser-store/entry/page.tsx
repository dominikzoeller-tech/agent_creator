import Link from 'next/link';
import { getSecureMasterAnswerLogMainBrowserStoreEntry } from '../../../../../../../../lib/cmt-master-answer-log-list-main-browser-store-entry';

export default function SecureMasterAnswerLogMainBrowserStoreEntryPage() {
  const entry = getSecureMasterAnswerLogMainBrowserStoreEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 136.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Main-Browser-Store-Entry ist sichtbar. Die Haupt-Logliste ist die bevorzugte Seite fuer Speichern, Laden und Reset.</p>
        <p><strong>Storage Key:</strong> {entry.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryMainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={entry.mainBrowserStoreStatusPage}>Main-Browser-Store-Status</Link></li>
          <li><Link href={entry.browserStoreControlPage}>Browser-Store-Kontrollseite</Link></li>
          <li><Link href={entry.browserStoreStatusPage}>Browser-Store-Status</Link></li>
          <li><Link href={entry.browserStoreEntryPage}>Browser-Store-Entry</Link></li>
          <li><Link href={entry.secureMasterPage}>Secure Master Hauptseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Nutzung</h3>
        <ol>{entry.recommendedUse.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>UI-Checklist</h3>
        <ol>{entry.uiChecklist.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Integration State</h3>
        <ul>{Object.entries(entry.integration).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(entry.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {entry.status.mainBrowserStore.browserStore.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {entry.status.mainBrowserStore.browserStore.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {entry.status.mainBrowserStore.browserStore.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {entry.status.mainBrowserStore.browserStore.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {entry.status.mainBrowserStore.browserStore.mainSelect.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
