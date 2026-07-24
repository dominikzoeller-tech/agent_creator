import Link from 'next/link';
import { getSecureMasterQualityStatus } from '../../../../../../lib/cmt-master-quality-status';

export default function SecureMasterQualityStatusPage() {
  const status = getSecureMasterQualityStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 124.1</h1>
        <h2>{status.label}</h2>
        <p>{status.qualityState.summary}</p>
        <p><Link href={status.mainQualityPage}>Quality-Testseite öffnen</Link></p>
        <p><Link href={status.mainSecurePage}>Secure Master öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Quality State</h3>
        <ul>
          <li>localAnswersImproved: {String(status.qualityState.localAnswersImproved)}</li>
          <li>intentDetectionEnabled: {String(status.qualityState.intentDetectionEnabled)}</li>
          <li>committeeDecisionVisible: {String(status.qualityState.committeeDecisionVisible)}</li>
          <li>privacyAnswerImproved: {String(status.qualityState.privacyAnswerImproved)}</li>
          <li>toolMissingCapabilityVisible: {String(status.qualityState.toolMissingCapabilityVisible)}</li>
          <li>liveModelEnabled: {String(status.qualityState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.qualityState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.qualityState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.qualityState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Unterstützte Intents</h3>
        <ul>{status.supportedIntents.map((item) => <li key={item}>{item}</li>)}</ul>
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
          <li>committeeRolesVisible: {String(status.demo.committeeRolesVisible)}</li>
          <li>missingCapability: {status.demo.missingCapability || 'none'}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
