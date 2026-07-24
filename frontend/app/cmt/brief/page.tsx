import { getCommitteeBriefDemo } from '../../../lib/cmt-brief';

export default function CommitteeBriefPage() {
  const brief = getCommitteeBriefDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 111.2</h1>
      <h2>{brief.label}</h2>
      <p>Das Gremium-Ergebnis wird als kurze Nutzerantwort mit Risiken und Aktionen verdichtet.</p>

      <section>
        <h3>Kurzantwort</h3>
        <p>{brief.brief.userMessage}</p>
        <ul>
          <li>headline: {brief.brief.headline}</li>
          <li>decision: {brief.brief.decision}</li>
        </ul>
      </section>

      <section>
        <h3>Warum</h3>
        <ul>
          {brief.brief.why.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section>
        <h3>Risiken</h3>
        <ul>
          {brief.brief.risks.map((risk) => <li key={risk}>{risk}</li>)}
        </ul>
      </section>

      <section>
        <h3>Aktionen</h3>
        <ul>
          {brief.brief.actions.map((action) => <li key={action}>{action}</li>)}
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {brief.provider}</li>
          <li>modelSelected: {brief.modelSelected}</li>
          <li>dryRunOnly: {String(brief.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(brief.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(brief.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(brief.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
