import Link from 'next/link';
import { getSecureMasterCommitteeStatus } from '../../../../../../lib/cmt-master-committee-status';

export default function SecureMasterCommitteeStatusPage() {
  const status = getSecureMasterCommitteeStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 125.1</h1>
        <h2>{status.label}</h2>
        <p>{status.committeeState.summary}</p>
        <p><Link href={status.mainCommitteePage}>Committee-Testseite öffnen</Link></p>
        <p><Link href={status.mainQualityPage}>Quality-Testseite öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Committee State</h3>
        <ul>
          <li>integratedInSecureMaster: {String(status.committeeState.integratedInSecureMaster)}</li>
          <li>fiveRolesVisible: {String(status.committeeState.fiveRolesVisible)}</li>
          <li>localOnly: {String(status.committeeState.localOnly)}</li>
          <li>decisionQuestionsDetected: {String(status.committeeState.decisionQuestionsDetected)}</li>
          <li>finalRecommendationVisible: {String(status.committeeState.finalRecommendationVisible)}</li>
          <li>liveModelEnabled: {String(status.committeeState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.committeeState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.committeeState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.committeeState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Rollen</h3>
        <ul>{status.roles.map((role) => <li key={role}>{role}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testprompts</h3>
        <ol>{status.testPrompts.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>committeeTriggered: {String(status.demo.committeeTriggered)}</li>
          <li>detectedIntent: {status.demo.detectedIntent}</li>
          <li>roles: {status.demo.committeeRoles.length}</li>
          <li>finalRecommendation: {status.demo.finalRecommendation}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
