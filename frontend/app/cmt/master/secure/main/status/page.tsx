import Link from 'next/link';
import { getSecureMasterMainStatus } from '../../../../../../lib/cmt-master-main-status';

export default function SecureMasterMainStatusPage() {
  const status = getSecureMasterMainStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 127.1</h1>
        <h2>{status.label}</h2>
        <p>{status.mainState.summary}</p>
        <p><Link href={status.mainPage}>Secure Master Hauptseite öffnen</Link></p>
        <p><Link href={status.unifiedControlPage}>Unified Kontrollseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Main State</h3>
        <ul>
          <li>mainPageUsesUnifiedFlow: {String(status.mainState.mainPageUsesUnifiedFlow)}</li>
          <li>localAnswerVisible: {String(status.mainState.localAnswerVisible)}</li>
          <li>routingVisible: {String(status.mainState.routingVisible)}</li>
          <li>privacyGateVisibleWhenNeeded: {String(status.mainState.privacyGateVisibleWhenNeeded)}</li>
          <li>committeeVisibleWhenNeeded: {String(status.mainState.committeeVisibleWhenNeeded)}</li>
          <li>safetyStateVisible: {String(status.mainState.safetyStateVisible)}</li>
          <li>controlPagesKept: {String(status.mainState.controlPagesKept)}</li>
          <li>liveModelEnabled: {String(status.mainState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.mainState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.mainState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.mainState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Kontrollseiten</h3>
        <ul>{status.controlPages.map((href) => <li key={href}><Link href={href}>{href}</Link></li>)}</ul>
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
