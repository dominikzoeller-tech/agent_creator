import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter-status';

export default function SecureMasterAnswerLogListFilterStatusPage() {
  const status = getSecureMasterAnswerLogListFilterStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 131.1</h1>
        <h2>{status.label}</h2>
        <p>{status.filterState.summary}</p>
        <p><Link href={status.filterPage}>Filteransicht öffnen</Link></p>
        <p><Link href={status.listPage}>Logliste öffnen</Link></p>
        <p><Link href={status.mainPage}>Secure Master Hauptseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Filter State</h3>
        <ul>
          <li>localSearchVisible: {String(status.filterState.localSearchVisible)}</li>
          <li>routeFilterVisible: {String(status.filterState.routeFilterVisible)}</li>
          <li>intentFilterVisible: {String(status.filterState.intentFilterVisible)}</li>
          <li>privacyDecisionFilterVisible: {String(status.filterState.privacyDecisionFilterVisible)}</li>
          <li>sourceCountVisible: {String(status.filterState.sourceCountVisible)}</li>
          <li>filteredCountVisible: {String(status.filterState.filteredCountVisible)}</li>
          <li>usesInMemoryList: {String(status.filterState.usesInMemoryList)}</li>
          <li>persistedInBrowser: {String(status.filterState.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.filterState.persistedOnServer)}</li>
          <li>localOnly: {String(status.filterState.localOnly)}</li>
          <li>liveModelEnabled: {String(status.filterState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.filterState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.filterState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.filterState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Felder</h3>
        <ul>{status.visibleFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>sourceCount: {status.demo.sourceCount}</li>
          <li>filteredCount: {status.demo.filteredCount}</li>
          <li>persistedInBrowser: {String(status.demo.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.demo.persistedOnServer)}</li>
          <li>externalSharingAllowed: {String(status.demo.safety.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testfilter</h3>
        <ol>{status.testFilters.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
