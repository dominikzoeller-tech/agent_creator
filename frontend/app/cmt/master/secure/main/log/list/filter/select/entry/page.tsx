import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterSelectEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter-select-entry';

export default function SecureMasterAnswerLogListFilterSelectEntryPage() {
  const entry = getSecureMasterAnswerLogListFilterSelectEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 133.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Select-Entry ist sichtbar. Lokale Dropdown-Filter sind vorbereitet. Keine Persistenz, kein Provider, kein Internet.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primarySelectPage}>Select-Filterseite</Link></li>
          <li><Link href={entry.selectStatusPage}>Select-Statusseite</Link></li>
          <li><Link href={entry.optionsPage}>Filter-Optionen</Link></li>
          <li><Link href={entry.filterPage}>Klassische Filterseite</Link></li>
          <li><Link href={entry.logListPage}>In-Memory-Logliste</Link></li>
          <li><Link href={entry.mainPage}>Secure Master Hauptseite</Link></li>
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
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {entry.status.select.filter.sourceCount}</li>
          <li>filteredCount: {entry.status.select.filter.filteredCount}</li>
          <li>routeOptions: {entry.status.select.options.routes.length}</li>
          <li>intentOptions: {entry.status.select.options.intents.length}</li>
          <li>privacyOptions: {entry.status.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          {Object.entries(entry.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
