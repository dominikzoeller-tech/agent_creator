import Link from 'next/link';
import { getSecureMasterAnswerLogListMainSelectEntry } from '../../../../../../../../lib/cmt-master-answer-log-list-main-select-entry';

export default function SecureMasterAnswerLogListMainSelectEntryPage() {
  const entry = getSecureMasterAnswerLogListMainSelectEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 134.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Main-Loglist-Entry ist sichtbar. Die Haupt-Logliste ist jetzt der bevorzugte lokale Loglisten-Testpunkt.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryMainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={entry.mainLogListStatusPage}>Main-Loglist-Status</Link></li>
          <li><Link href={entry.selectControlPage}>Select-Kontrollseite</Link></li>
          <li><Link href={entry.optionsControlPage}>Options-Kontrollseite</Link></li>
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
        <h3>Demo Counts</h3>
        <ul>
          <li>sourceCount: {entry.status.mainSelect.select.filter.sourceCount}</li>
          <li>filteredCount: {entry.status.mainSelect.select.filter.filteredCount}</li>
          <li>routeOptions: {entry.status.mainSelect.select.options.routes.length}</li>
          <li>intentOptions: {entry.status.mainSelect.select.options.intents.length}</li>
          <li>privacyOptions: {entry.status.mainSelect.select.options.privacyDecisions.length}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(entry.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
