import Link from 'next/link';
import { getCommitteeLocalJsonPlan } from '../../../lib/cmt-json';

export default function CommitteeLocalJsonPage() {
  const plan = getCommitteeLocalJsonPlan();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 118.0</h1>
        <h2>{plan.label}</h2>
        <p>Local JSON Persistenz ist geplant, aber echte Datei-Schreibvorgaenge bleiben deaktiviert.</p>
        <p><Link href="/cmt/persist/guide">Zum Persist Guide</Link></p>
      </section>

      <section style={card}>
        <h3>Local JSON Plan</h3>
        <ul>
          <li>target: {plan.localJson.target}</li>
          <li>directory: {plan.localJson.directory}</li>
          <li>fileName: {plan.localJson.fileName}</li>
          <li>writeMode: {plan.localJson.writeMode}</li>
          <li>schemaVersion: {plan.localJson.schemaVersion}</li>
          <li>externalStorageEnabled: {String(plan.localJson.externalStorageEnabled)}</li>
          <li>actualFileWriteEnabled: {String(plan.localJson.actualFileWriteEnabled)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Planned Payload</h3>
        <ul>
          <li>sessionKey: {plan.localJson.plannedPayload.sessionKey}</li>
          <li>savedCount: {plan.localJson.plannedPayload.savedCount}</li>
        </ul>
        <ol>{plan.localJson.plannedPayload.questions.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {plan.provider}</li>
          <li>modelSelected: {plan.modelSelected}</li>
          <li>dryRunOnly: {String(plan.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(plan.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(plan.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(plan.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
