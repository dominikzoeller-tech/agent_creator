import { getCommitteeIntakeDemo } from '../../../lib/cmt-intake';

export default function CommitteeIntakePage() {
  const demo = getCommitteeIntakeDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 110.1</h1>
      <h2>Question Intake und Gremium-Routing</h2>
      <p>Die Nutzerfrage wird dry-run-only klassifiziert und an passende Gremiumsrollen geroutet.</p>

      <section>
        <h3>Demo-Frage</h3>
        <p>{demo.text}</p>
        <ul>
          <li>topic: {demo.topic}</li>
          <li>riskLevel: {demo.riskLevel}</li>
          <li>selectedRoleIds: {demo.selectedRoleIds.join(', ')}</li>
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {demo.provider}</li>
          <li>modelSelected: {demo.modelSelected}</li>
          <li>dryRunOnly: {String(demo.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(demo.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(demo.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(demo.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
