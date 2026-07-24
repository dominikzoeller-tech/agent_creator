import Link from 'next/link';
import { getMasterAgentStatus } from '../../../../lib/cmt-master-status';

export default function MasterAgentStatusPage() {
  const status = getMasterAgentStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 120.1</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><Link href={status.status.mainPage}>Master-Agent öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Aktueller Status</h3>
        <ul>
          <li>currentMode: {status.status.currentMode}</li>
          <li>mainPage: {status.status.mainPage}</li>
          <li>apiRoute: {status.status.apiRoute}</li>
          <li>canAnswerDirect: {String(status.status.canAnswerDirect)}</li>
          <li>canAskCommittee: {String(status.status.canAskCommittee)}</li>
          <li>canDetectPrivacyGate: {String(status.status.canDetectPrivacyGate)}</li>
          <li>canDetectToolRequired: {String(status.status.canDetectToolRequired)}</li>
          <li>canDetectAgentBuilder: {String(status.status.canDetectAgentBuilder)}</li>
          <li>liveModelEnabled: {String(status.status.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.status.providerEnabled)}</li>
          <li>internetEnabled: {String(status.status.internetEnabled)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Routen</h3>
        <ul>{status.status.routesSupported.map((route) => <li key={route}>{route}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Testfragen</h3>
        <ol>{status.testQuestions.map((question) => <li key={question}>{question}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <p><strong>Route:</strong> {status.demo.decision.route}</p>
        <p><strong>Grund:</strong> {status.demo.decision.reason}</p>
        <p><strong>Usable Status:</strong> {status.demo.usableStatus}</p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {status.provider}</li>
          <li>modelSelected: {status.modelSelected}</li>
          <li>dryRunOnly: {String(status.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(status.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(status.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(status.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
