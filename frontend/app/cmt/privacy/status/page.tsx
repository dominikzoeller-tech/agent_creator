import Link from 'next/link';
import { getPrivacyGateStatus } from '../../../../lib/cmt-privacy-status';

export default function PrivacyGateStatusPage() {
  const status = getPrivacyGateStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 121.1</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><Link href={status.status.mainPage}>Privacy Gate öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Aktueller Status</h3>
        <ul>
          <li>currentMode: {status.status.currentMode}</li>
          <li>mainPage: {status.status.mainPage}</li>
          <li>apiRoute: {status.status.apiRoute}</li>
          <li>detectsInternalData: {String(status.status.detectsInternalData)}</li>
          <li>detectsPersonalData: {String(status.status.detectsPersonalData)}</li>
          <li>detectsBusinessData: {String(status.status.detectsBusinessData)}</li>
          <li>detectsSecretData: {String(status.status.detectsSecretData)}</li>
          <li>anonymizedPreviewEnabled: {String(status.status.anonymizedPreviewEnabled)}</li>
          <li>userApprovalPrepared: {String(status.status.userApprovalPrepared)}</li>
          <li>externalSharingAllowed: {String(status.status.externalSharingAllowed)}</li>
          <li>liveModelEnabled: {String(status.status.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.status.providerEnabled)}</li>
          <li>internetEnabled: {String(status.status.internetEnabled)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Freigabeoptionen vorbereitet</h3>
        <ul>{status.allowedOptions.map((item) => <li key={item}>{item}</li>)}</ul>
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
        <p><strong>Decision:</strong> {status.demo.decision.decision}</p>
        <p><strong>Sensitivity:</strong> {status.demo.detected.sensitivity}</p>
        <p><strong>External Sharing:</strong> {String(status.demo.externalSharingAllowed)}</p>
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
