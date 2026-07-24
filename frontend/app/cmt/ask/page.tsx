'use client';

import { useMemo, useState } from 'react';
import { createCommitteeAskState } from '../../../lib/cmt-ask';

export default function CommitteeAskPage() {
  const [question, setQuestion] = useState('Soll der Agent eine echte Eingabe-UI fuer Nutzerfragen an das Gremium anzeigen?');
  const state = useMemo(() => createCommitteeAskState(question), [question]);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 112.0</h1>
      <h2>{state.label}</h2>
      <p>Erste echte Eingabe-UI fuer Nutzerfragen an das interne Gremium. Weiterhin dry-run-only.</p>

      <section>
        <h3>Frage an das Gremium</h3>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={state.inputPlaceholder}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
      </section>

      <section>
        <h3>Kurzantwort</h3>
        <p>{state.result.brief.userMessage}</p>
        <ul>
          <li>decision: {state.result.brief.decision}</li>
          <li>headline: {state.result.brief.headline}</li>
        </ul>
      </section>

      <section>
        <h3>Risiken</h3>
        <ul>
          {state.result.brief.risks.map((risk) => <li key={risk}>{risk}</li>)}
        </ul>
      </section>

      <section>
        <h3>Aktionen</h3>
        <ul>
          {state.result.brief.actions.map((action) => <li key={action}>{action}</li>)}
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {state.provider}</li>
          <li>modelSelected: {state.modelSelected}</li>
          <li>dryRunOnly: {String(state.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(state.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(state.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(state.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
