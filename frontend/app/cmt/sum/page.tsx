import { getCommitteeSessionSummaryDemo } from '../../../lib/cmt-sum';

export default function CommitteeSummaryPage() {
  const sum = getCommitteeSessionSummaryDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 113.2</h1>
      <h2>{sum.label}</h2>
      <p>Die gespeicherte Gremium-Session wird als dry-run-only Zusammenfassung angezeigt.</p>

      <section>
        <h3>Zusammenfassung</h3>
        <p>{sum.summary.shortSummary}</p>
        <ul>
          <li>sessionKey: {sum.saved.sessionKey}</li>
          <li>totalQuestions: {sum.summary.totalQuestions}</li>
        </ul>
      </section>

      <section>
        <h3>Entscheidungen</h3>
        <ul>{sum.summary.decisions.map((item, index) => <li key={item + index}>{item}</li>)}</ul>
      </section>

      <section>
        <h3>Top Risiken</h3>
        <ul>{sum.summary.topRisks.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section>
        <h3>Naechste Aktionen</h3>
        <ul>{sum.summary.nextActions.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {sum.provider}</li>
          <li>modelSelected: {sum.modelSelected}</li>
          <li>dryRunOnly: {String(sum.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(sum.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(sum.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(sum.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
