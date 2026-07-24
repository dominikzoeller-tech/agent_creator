import Link from 'next/link';
import { getSecureMasterAnswerLogListStatus } from '../../../../../../../../lib/cmt-master-answer-log-list-status';

export default function SecureMasterAnswerLogListStatusPage() {
  const status = getSecureMasterAnswerLogListStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 130.1</h1>
        <h2>{status.label}</h2>
        <p>{status.listState.summary}</p>
        <p><Link href={status.listPage}>In-Memory-Logliste öffnen</Link></p>
        <p><Link href={status.singleLogPage}>Einzelnes Answer Log öffnen</Link></p>
        <p><Link href={status.mainPage}>Secure Master Hauptseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>List State</h3>
        <ul>
          <li>inMemoryListVisible: {String(status.listState.inMemoryListVisible)}</li>
          <li>multipleLogsVisible: {String(status.listState.multipleLogsVisible)}</li>
          <li>countVisible: {String(status.listState.countVisible)}</li>
          <li>itemFieldsVisible: {String(status.listState.itemFieldsVisible)}</li>
          <li>usesSingleLogStore: {String(status.listState.usesSingleLogStore)}</li>
          <li>persistedInBrowser: {String(status.listState.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.listState.persistedOnServer)}</li>
          <li>localOnly: {String(status.listState.localOnly)}</li>
          <li>liveModelEnabled: {String(status.listState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.listState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.listState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.listState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Felder</h3>
        <ul>{status.visibleFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>count: {status.demo.count}</li>
          <li>persistedInBrowser: {String(status.demo.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.demo.persistedOnServer)}</li>
          <li>externalSharingAllowed: {String(status.demo.safety.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testprompts</h3>
        <ol>{status.testPrompts.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
