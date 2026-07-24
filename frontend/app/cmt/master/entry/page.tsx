import Link from 'next/link';
import { getMasterAgentEntry } from '../../../../lib/cmt-master-entry';

export default function MasterAgentEntryPage() {
  const entry = getMasterAgentEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 120.2</h1>
        <h2>{entry.entry.title}</h2>
        <p>{entry.entry.description}</p>
        <p><strong>Modus:</strong> {entry.entry.mode}</p>
        <p><Link href={entry.entry.primaryHref}>Master-Agent öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Zentrale Links</h3>
        <ul>
          <li><Link href={entry.entry.primaryHref}>Master-Agent Testseite</Link></li>
          <li><Link href={entry.entry.statusHref}>Master-Agent Status</Link></li>
          <li><Link href={entry.entry.committeeHref}>Gremium Ask</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Fähigkeiten aktuell</h3>
        <ul>
          <li>directAnswer: {String(entry.capabilities.directAnswer)}</li>
          <li>committeeRouting: {String(entry.capabilities.committeeRouting)}</li>
          <li>privacyGate: {String(entry.capabilities.privacyGate)}</li>
          <li>toolRequiredDetection: {String(entry.capabilities.toolRequiredDetection)}</li>
          <li>agentBuilderDetection: {String(entry.capabilities.agentBuilderDetection)}</li>
          <li>liveModel: {String(entry.capabilities.liveModel)}</li>
          <li>internet: {String(entry.capabilities.internet)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Status Snapshot</h3>
        <p>{entry.status.status.summary}</p>
        <p><strong>currentMode:</strong> {entry.status.status.currentMode}</p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {entry.provider}</li>
          <li>modelSelected: {entry.modelSelected}</li>
          <li>dryRunOnly: {String(entry.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(entry.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(entry.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(entry.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
