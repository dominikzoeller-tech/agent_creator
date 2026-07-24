import Link from 'next/link';
import { getSecureMasterAnswerLogBrowserStoreEntry } from '../../../../../../../../lib/cmt-master-answer-log-list-browser-store-entry';

export default function SecureMasterAnswerLogBrowserStoreEntryPage() {
  const entry = getSecureMasterAnswerLogBrowserStoreEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 135.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Browser-Store-Entry ist sichtbar. Browserseitige Speicherung ist vorbereitet, aber nicht serverseitig aktiv.</p>
        <p><strong>Storage Key:</strong> {entry.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryBrowserStorePage}>Browser-Store-Seite</Link></li>
          <li><Link href={entry.browserStoreStatusPage}>Browser-Store-Status</Link></li>
          <li><Link href={entry.mainLogListPage}>Haupt-Logliste</Link></li>
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
        <h3>Persistence State</h3>
        <ul>{Object.entries(entry.persistence).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(entry.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {entry.status.browserStore.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {entry.status.browserStore.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {entry.status.browserStore.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {entry.status.browserStore.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {entry.status.browserStore.mainSelect.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
