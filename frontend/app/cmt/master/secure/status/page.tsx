import Link from 'next/link';
import { getSecureMasterStatus } from '../../../../../lib/cmt-master-secure-status';

export default function SecureMasterStatusPage() {
  const status = getSecureMasterStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 122.1</h1>
        <h2>{status.label}</h2>
        <p><strong>Modus:</strong> {status.currentMode}</p>
        <p><Link href={status.mainPage}>Secure Master Agent öffnen</Link></p>
      </section>
      <section style={card}>
        <h3>Capabilities</h3>
        <ul>
          {Object.entries(status.capabilities).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}
        </ul>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testeingaben</h3>
        <ol>{status.testInputs.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>finalRoute: {status.demo.finalRoute}</li>
          <li>privacy.decision: {status.demo.privacy.decision.decision}</li>
          <li>requiresUserApproval: {String(status.demo.requiresUserApproval)}</li>
          <li>externalSharingAllowed: {String(status.demo.externalSharingAllowed)}</li>
        </ul>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety</h3>
        <ul>{Object.entries(status.safety).map(([key, value]) => <li key={key}>{String(value)}</li>)}</ul>
      </section>
    </main>
  );
}
