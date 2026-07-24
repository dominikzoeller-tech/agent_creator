import Link from 'next/link';
import { getSecureMasterUnifiedStatus } from '../../../../../../lib/cmt-master-unified-status';

export default function SecureMasterUnifiedStatusPage() {
  const status = getSecureMasterUnifiedStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 126.1</h1>
        <h2>{status.label}</h2>
        <p>{status.unifiedState.summary}</p>
        <p><Link href={status.mainUnifiedPage}>Unified Flow öffnen</Link></p>
        <p><Link href={status.mainSecurePage}>Secure Master Hauptseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Unified State</h3>
        <ul>
          <li>mainFlowAvailable: {String(status.unifiedState.mainFlowAvailable)}</li>
          <li>privacyGateVisibleWhenNeeded: {String(status.unifiedState.privacyGateVisibleWhenNeeded)}</li>
          <li>qualityAnswerVisible: {String(status.unifiedState.qualityAnswerVisible)}</li>
          <li>committeeVisibleWhenNeeded: {String(status.unifiedState.committeeVisibleWhenNeeded)}</li>
          <li>safetyStateVisible: {String(status.unifiedState.safetyStateVisible)}</li>
          <li>localOnly: {String(status.unifiedState.localOnly)}</li>
          <li>liveModelEnabled: {String(status.unifiedState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.unifiedState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.unifiedState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.unifiedState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Blöcke</h3>
        <ul>{status.visibleBlocks.map((block) => <li key={block}>{block}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testprompts</h3>
        <ol>{status.testPrompts.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>detectedIntent: {status.demo.detectedIntent}</li>
          <li>finalRoute: {status.demo.finalRoute}</li>
          <li>showsPrivacyGate: {String(status.demo.showsPrivacyGate)}</li>
          <li>showsCommitteeWhenNeeded: {String(status.demo.showsCommitteeWhenNeeded)}</li>
          <li>blocks: {status.demo.unifiedAnswerBlocks.length}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
