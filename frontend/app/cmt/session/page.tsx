import { getCommitteeSessionDemo } from '../../../lib/cmt-session';

export default function CommitteeSessionPage() {
  const session = getCommitteeSessionDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 111.0</h1>
      <h2>{session.label}</h2>
      <p>Eine Nutzerfrage wird als Session erfasst und an das interne Gremium uebergeben.</p>

      <section>
        <h3>User-Frage</h3>
        <p>{session.userQuestion}</p>
        <ul>
          <li>sessionId: {session.sessionId}</li>
          <li>status: {session.status}</li>
          <li>recommendation: {session.deliberation.aggregate.recommendation}</li>
        </ul>
      </section>

      <section>
        <h3>Gremium</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {session.deliberation.opinions.map((opinion) => (
            <article key={opinion.roleId} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
              <h4>{opinion.title}</h4>
              <p><strong>stance:</strong> {opinion.stance}</p>
              <p>{opinion.summary}</p>
              <p><strong>nextStep:</strong> {opinion.nextStep}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3>Naechste Schritte</h3>
        <ul>
          {session.deliberation.aggregate.nextSteps.map((step) => <li key={step}>{step}</li>)}
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {session.provider}</li>
          <li>modelSelected: {session.modelSelected}</li>
          <li>dryRunOnly: {String(session.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(session.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(session.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(session.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
