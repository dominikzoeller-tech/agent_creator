import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterOptionsStatus } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-options-status';

export default function SecureMasterAnswerLogListFilterOptionsStatusPage() {
  const status = getSecureMasterAnswerLogListFilterOptionsStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 132.1</h1>
        <h2>{status.label}</h2>
        <p>{status.optionsState.summary}</p>
        <p><Link href={status.optionsPage}>Filter-Optionen öffnen</Link></p>
        <p><Link href={status.filterPage}>Filteransicht öffnen</Link></p>
        <p><Link href={status.listPage}>Logliste öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Options State</h3>
        <ul>
          <li>routeOptionsVisible: {String(status.optionsState.routeOptionsVisible)}</li>
          <li>intentOptionsVisible: {String(status.optionsState.intentOptionsVisible)}</li>
          <li>privacyOptionsVisible: {String(status.optionsState.privacyOptionsVisible)}</li>
          <li>allOptionPrepended: {String(status.optionsState.allOptionPrepended)}</li>
          <li>sourceCountVisible: {String(status.optionsState.sourceCountVisible)}</li>
          <li>usesInMemoryList: {String(status.optionsState.usesInMemoryList)}</li>
          <li>persistedInBrowser: {String(status.optionsState.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.optionsState.persistedOnServer)}</li>
          <li>localOnly: {String(status.optionsState.localOnly)}</li>
          <li>liveModelEnabled: {String(status.optionsState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.optionsState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.optionsState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.optionsState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>sourceCount: {status.demo.sourceCount}</li>
          <li>routeOptions: {status.demo.routes.length}</li>
          <li>intentOptions: {status.demo.intents.length}</li>
          <li>privacyOptions: {status.demo.privacyDecisions.length}</li>
          <li>firstRouteOption: {status.demo.routes[0]}</li>
          <li>firstIntentOption: {status.demo.intents[0]}</li>
          <li>firstPrivacyOption: {status.demo.privacyDecisions[0]}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Felder</h3>
        <ul>{status.visibleFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testchecks</h3>
        <ol>{status.testChecks.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
