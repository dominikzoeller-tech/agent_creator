import Link from 'next/link';
import { getSecureMasterNavStatus } from '../../../../lib/cmt-master-nav-status';

export default function SecureMasterNavStatusPage() {
  const status = getSecureMasterNavStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 123.1</h1>
        <h2>{status.label}</h2>
        <p>{status.navigationState.message}</p>
        <p><strong>Empfohlene Startseite:</strong> <Link href={status.navigationState.recommendedDefaultPage}>{status.navigationState.recommendedDefaultPage}</Link></p>
      </section>

      <section style={card}>
        <h3>Navigation State</h3>
        <ul>
          <li>primaryEntryVisible: {String(status.navigationState.primaryEntryVisible)}</li>
          <li>primaryEntry: {status.navigationState.primaryEntry}</li>
          <li>homeEntry: {status.navigationState.homeEntry}</li>
          <li>statusEntry: {status.navigationState.statusEntry}</li>
          <li>guideEntry: {status.navigationState.guideEntry}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Route Map</h3>
        <ul>
          {Object.entries(status.routeMap).map(([key, value]) => <li key={key}><Link href={value}>{key}: {value}</Link></li>)}
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety</h3>
        <ul>
          <li>localTestable: {String(status.safety.localTestable)}</li>
          <li>liveModelEnabled: {String(status.safety.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.safety.providerEnabled)}</li>
          <li>internetEnabled: {String(status.safety.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.safety.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {status.nextMilestone}</p>
      </section>
    </main>
  );
}
