import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterSelectStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter-select-status';

export default function SecureMasterAnswerLogListFilterSelectStatusPage() {
  const data = getSecureMasterAnswerLogListFilterSelectStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 133.1</h1>
        <h2>{data.label}</h2>
        <p><strong>Status:</strong> Select-Filter sind lokal sichtbar und nutzen die Options-Ableitung aus Phase 132. Keine Persistenz, kein Provider, kein Internet.</p>
      </section>

      <section style={card}>
        <h3>Links</h3>
        <ul>
          <li><Link href={data.pages.selectPage}>Select-Filterseite</Link></li>
          <li><Link href={data.pages.optionsPage}>Filter-Optionen</Link></li>
          <li><Link href={data.pages.filterPage}>Filterseite</Link></li>
          <li><Link href={data.pages.logListPage}>Logliste</Link></li>
          <li><Link href={data.pages.mainPage}>Secure Master Hauptseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Status Flags</h3>
        <ul>
          {Object.entries(data.status).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {data.select.filter.sourceCount}</li>
          <li>filteredCount: {data.select.filter.filteredCount}</li>
          <li>routeOptions: {data.select.options.routes.length}</li>
          <li>intentOptions: {data.select.options.intents.length}</li>
          <li>privacyOptions: {data.select.options.privacyDecisions.length}</li>
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
