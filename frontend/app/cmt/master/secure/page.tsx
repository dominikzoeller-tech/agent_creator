'use client';

import { useState } from 'react';
import type { SecureMasterAgentResult } from '../../../../lib/cmt-master-secure';
import type { PrivacyDecisionOption } from '../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function SecureMasterAgentPage() {
  const [input, setInput] = useState('Soll ich diese interne Kalkulation fuer Kunde Muster mit dem Gremium pruefen?');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [result, setResult] = useState<SecureMasterAgentResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input, option }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 122.0</h1>
        <h2>Secure Master Agent MVP</h2>
        <p><strong>Status:</strong> Master-Agent + Privacy-Gate lokal zusammengeführt. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Frage an den sicheren Master-Agenten</h3>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 920, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <h3>Privacy-Option</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Master-Agent prüft...' : 'Master-Agent fragen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Antwort</h3>
            <p>{result.userVisibleAnswer}</p>
          </article>

          <article style={card}>
            <h3>Routing</h3>
            <ul>
              <li>finalRoute: {result.finalRoute}</li>
              <li>master.route: {result.master.route}</li>
              <li>requiresUserApproval: {String(result.requiresUserApproval)}</li>
              <li>requestedPrivacyOption: {result.requestedPrivacyOption}</li>
            </ul>
          </article>

          <article style={card}>
            <h3>Privacy Gate</h3>
            <ul>
              <li>privacy.decision: {result.privacy.decision.decision}</li>
              <li>sensitivity: {result.privacy.detected.sensitivity}</li>
              <li>decisionFlow.mode: {result.privacyDecision.outcome.mode}</li>
              <li>decisionFlow.message: {result.privacyDecision.outcome.message}</li>
            </ul>
          </article>

          <article style={card}>
            <h3>Safety State</h3>
            <ul>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
              <li>liveModelEnabled: {String(result.liveModelEnabled)}</li>
              <li>provider: {result.provider}</li>
              <li>modelSelected: {result.modelSelected}</li>
              <li>networkCallAllowed: {String(result.networkCallAllowed)}</li>
              <li>providerDispatchAllowed: {String(result.providerDispatchAllowed)}</li>
              <li>finalDispatchBlocked: {String(result.finalDispatchBlocked)}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
