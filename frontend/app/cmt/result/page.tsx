import { getCommitteeDecisionResultDemo } from '../../../lib/cmt-result';

export default function CommitteeResultPage() {
  const result = getCommitteeDecisionResultDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 111.1</h1>
      <h2>{result.label}</h2>
      <p>Die Gremiumsberatung wird als klares Ergebnis mit Risiken und naechsten Schritten angezeigt.</p>

      <section>
        <h3>Antwort</h3>
        <p>{result.decision.shortAnswer}</p>
        <ul>
          <li>sessionId: {result.session.sessionId}</li>
          <li>verdict: {result.decision.verdict}</li>
        </ul>
      </section>

      <section>
        <h3>Begruendung</h3>
        <ul>
          {result.decision.rationale.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section>
        <h3>Risiken</h3>
        <ul>
          {result.decision.risks.map((risk) => <li key={risk}>{risk}</li>)}
        </ul>
      </section>

      <section>
        <h3>Naechste Aktionen</h3>
        <ul>
          {result.decision.nextActions.map((action) => <li key={action}>{action}</li>)}
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
