import Link from 'next/link';
import { getSecureMasterMainViewStatus } from '../../../../../../../lib/cmt-master-main-view-status';

export default function SecureMasterMainViewStatusPage() {
  const status = getSecureMasterMainViewStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 128.1</h1>
        <h2>{status.label}</h2>
        <p>{status.viewState.summary}</p>
        <p><Link href={status.mainPage}>Secure Master Hauptseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>View State</h3>
        <ul>
          <li>structuredMainViewVisible: {String(status.viewState.structuredMainViewVisible)}</li>
          <li>statusBadgesVisible: {String(status.viewState.statusBadgesVisible)}</li>
          <li>compactBlocksVisible: {String(status.viewState.compactBlocksVisible)}</li>
          <li>committeeCardsReadable: {String(status.viewState.committeeCardsReadable)}</li>
          <li>controlLinksVisible: {String(status.viewState.controlLinksVisible)}</li>
          <li>liveModelEnabled: {String(status.viewState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.viewState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.viewState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.viewState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Badges</h3>
        <ul>{status.visibleBadges.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Bereiche</h3>
        <ul>{status.visibleSections.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>badges: {status.demo.badges.length}</li>
          <li>compactBlocks: {status.demo.compactBlocks.length}</li>
          <li>roleCards: {status.demo.roleCards.length}</li>
          <li>externalSharingAllowed: {String(status.demo.externalSharingAllowed)}</li>
        </ul>
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
