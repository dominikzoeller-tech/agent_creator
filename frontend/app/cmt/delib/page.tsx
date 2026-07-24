import { getCommitteeDeliberationDemo } from '../../../lib/cmt-delib';

export default function CommitteeDeliberationPage() {
  const result = getCommitteeDeliberationDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 110.2</h1>
      <h2>{result.label}</h2>
      <p>Das interne Gremium erzeugt rollenbasierte Dry-run-Einschaetzungen und eine aggregierte Empfehlung.</p>

      <section>
        <h3>Frage</h3>
        <p>{result.question.text}</p>
        <ul>
          <li>topic: {result.question.topic}</li>
          <li>riskLevel: {result.question.riskLevel}</li>
          <li>recommendation: {result.aggregate.recommendation}</li>
        </ul>
      </section>

      <section>
        <h3>Rollenmeinungen</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {result.opinions.map((opinion) => (
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
        <h3>Aggregate</h3>
        <p>{result.aggregate.summary}</p>
        <ul>
          {result.aggregate.nextSteps.map((step) => <li key={step}>{step}</li>)}
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {result.provider}</li>
          <li>modelSelected: {result.modelSelected}</li>
          <li>dryRunOnly: {String(result.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(result.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(result.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(result.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
