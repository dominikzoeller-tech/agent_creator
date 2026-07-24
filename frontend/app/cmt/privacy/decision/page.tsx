'use client';

import { useState } from 'react';
import type { PrivacyDecisionOption, PrivacyDecisionResult } from '../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function PrivacyDecisionPage() {
  const [input, setInput] = useState('Interne Kalkulation fuer Kunde Muster mit E-Mail test@example.com und Angebot 12345.');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [result, setResult] = useState<PrivacyDecisionResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/privacy/decision', {
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
        <h1>Phase 121.2</h1>
        <h2>Privacy Gate Decision Flow</h2>
        <p><strong>Status:</strong> Freigabe-Auswahl lokal testbar. Externe Weitergabe bleibt blockiert.</p>
      </section>

      <section style={card}>
        <h3>Eingabe</h3>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <h3>Option auswählen</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={submit} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Entscheidung prueft...' : 'Entscheidung prüfen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Outcome</h3>
            <p><strong>accepted:</strong> {String(result.outcome.accepted)}</p>
            <p><strong>mode:</strong> {result.outcome.mode}</p>
            <p><strong>message:</strong> {result.outcome.message}</p>
            <p><strong>nextAction:</strong> {result.outcome.nextAction}</p>
          </article>

          <article style={card}>
            <h3>Privacy Gate</h3>
            <p><strong>decision:</strong> {result.gate.decision.decision}</p>
            <p><strong>sensitivity:</strong> {result.gate.detected.sensitivity}</p>
            <p><strong>approval.required:</strong> {String(result.gate.approval.required)}</p>
          </article>

          <article style={card}>
            <h3>Safe Payload Preview</h3>
            <p>{result.safePayloadPreview}</p>
          </article>

          <article style={card}>
            <h3>Safety</h3>
            <ul>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
              <li>providerDispatchAllowed: {String(result.providerDispatchAllowed)}</li>
              <li>networkCallAllowed: {String(result.networkCallAllowed)}</li>
              <li>finalDispatchBlocked: {String(result.finalDispatchBlocked)}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
