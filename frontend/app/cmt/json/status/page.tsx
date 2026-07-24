import Link from 'next/link';
import { getCommitteeLocalJsonStatus } from '../../../../lib/cmt-json-status';

export default function CommitteeLocalJsonStatusPage() {
  const status = getCommitteeLocalJsonStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 118.1</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><Link href="/cmt/json">Zum Local JSON Plan</Link></p>
      </section>

      <section style={card}>
        <h3>Status</h3>
        <ul>
          <li>ready: {String(status.status.ready)}</li>
          <li>target: {status.status.target}</li>
          <li>writeMode: {status.status.writeMode}</li>
          <li>actualFileWriteEnabled: {String(status.status.actualFileWriteEnabled)}</li>
          <li>directory: {status.plan.localJson.directory}</li>
          <li>fileName: {status.plan.localJson.fileName}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Checks</h3>
        <ul>{status.status.checks.map((check) => <li key={check}>{check}</li>)}</ul>
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
