import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterOptionsEntry } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-options-entry';

export default function SecureMasterAnswerLogListFilterOptionsEntryPage() {
  const entry = getSecureMasterAnswerLogListFilterOptionsEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 132.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Lokale Filter-Dropdown-Optionen sind sichtbar. Noch keine dauerhafte Speicherung.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryOptionsPage}>Filter-Optionen</Link></li>
          <li><Link href={entry.optionsStatusPage}>Filter-Optionen Status</Link></li>
          <li><Link href={entry.filterPage}>Filteransicht</Link></li>
          <li><Link href={entry.listPage}>In-Memory-Logliste</Link></li>
          <li><Link href={entry.mainPage}>Secure Master Hauptseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Options-Felder</h3>
        <ul>{entry.visibleOptionFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Nutzung</h3>
        <ol>{entry.recommendedUse.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sample Checks</h3>
        <ol>{entry.sampleChecks.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>localTestable: {String(entry.safety.localTestable)}</li>
          <li>routeOptionsVisible: {String(entry.safety.routeOptionsVisible)}</li>
          <li>intentOptionsVisible: {String(entry.safety.intentOptionsVisible)}</li>
          <li>privacyOptionsVisible: {String(entry.safety.privacyOptionsVisible)}</li>
          <li>allOptionPrepended: {String(entry.safety.allOptionPrepended)}</li>
          <li>persistedInBrowser: {String(entry.safety.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(entry.safety.persistedOnServer)}</li>
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
