import Link from 'next/link';
import { getCommitteeAskStatus } from '../../../../lib/cmt-ask-status';

export default function CommitteeAskStatusPage() {
  const status = getCommitteeAskStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 119.2</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><Link href={status.status.openPage}>Gremium Ask öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Aktueller Modus</h3>
        <ul>
          <li>currentMode: {status.status.currentMode}</li>
          <li>canAskQuestions: {String(status.status.canAskQuestions)}</li>
          <li>usesFiveMemberCommittee: {String(status.status.usesFiveMemberCommittee)}</li>
          <li>questionIntentDetection: {String(status.status.questionIntentDetection)}</li>
          <li>liveModelEnabled: {String(status.status.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.status.providerEnabled)}</li>
          <li>internetEnabled: {String(status.status.internetEnabled)}</li>
          <li>internalDataProtectionRequired: {String(status.status.internalDataProtectionRequired)}</li>
          <li>nextMilestone: {status.status.nextMilestone}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Testfragen</h3>
        <ol>{status.testQuestions.map((question) => <li key={question}>{question}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <p><strong>Intent:</strong> {status.askDemo.intent}</p>
        <p><strong>Empfehlung:</strong> {status.askDemo.finalAnswer.recommendation}</p>
        <p><strong>Open Page:</strong> {status.status.openPage}</p>
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
