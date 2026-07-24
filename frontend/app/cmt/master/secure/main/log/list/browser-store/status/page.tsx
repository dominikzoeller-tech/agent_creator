import Link from 'next/link';
import { getSecureMasterAnswerLogBrowserStoreStatus } from '../../../../../../../../lib/cmt-master-answer-log-list-browser-store-status';

export default function SecureMasterAnswerLogBrowserStoreStatusPage() {
  const data = getSecureMasterAnswerLogBrowserStoreStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 135.1</h1>
        <h2>{data.label}</h2>
        <p><strong>Status:</strong> Browserseitige Logspeicherung ist vorbereitet. Server-Persistenz bleibt aus.</p>
        <p><strong>Storage Key:</strong> {data.localStorage.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Links</h3>
        <ul>
          <li><Link href={data.pages.browserStorePage}>Browser-Store-Seite</Link></li>
          <li><Link href={data.pages.mainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={data.pages.selectStatusPage}>Main-Loglist-Select-Status</Link></li>
          <li><Link href={data.pages.secureMasterPage}>Secure Master</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>localStorage Status</h3>
        <ul>{Object.entries(data.localStorage).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(data.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {data.browserStore.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {data.browserStore.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {data.browserStore.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {data.browserStore.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {data.browserStore.mainSelect.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Checks</h3>
        <ol>{data.checks.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {data.nextMilestone}</p>
      </section>
    </main>
  );
}
