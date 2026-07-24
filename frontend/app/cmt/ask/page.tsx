'use client';

import { useState } from 'react';
import type { CommitteeAskResult } from '../../../lib/cmt-ask';

export default function CommitteeAskPage() {
  const [question, setQuestion] = useState('Wann kann ich den Gremium-Agenten testen und was fehlt noch bis zum Live-Betrieb?');
  const [result, setResult] = useState<CommitteeAskResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 119.0</h1>
        <h2>Gremium Ask MVP</h2>
        <p><strong>Status:</strong> Lokal testbar. Noch nicht live mit KI-Modell.</p>
        <p>Hier kannst du den Agenten erstmals mit echten Fragen lokal testen.</p>
      </section>

      <section style={card}>
        <h3>Frage an das Gremium</h3>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Gremium denkt lokal...' : 'Gremium fragen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>{result.finalAnswer.headline}</h3>
            <p><strong>Empfehlung:</strong> {result.finalAnswer.recommendation}</p>
            <p><strong>Usable Status:</strong> {result.usableStatus}</p>
          </article>

          <article style={card}>
            <h3>Gremiumsrollen</h3>
            {result.roles.map((role) => (
              <section key={role.role} style={{ borderTop: '1px solid #eee', paddingTop: 10, marginTop: 10 }}>
                <h4>{role.role} - {role.stance}</h4>
                <p>{role.answer}</p>
                <p><strong>Risiko:</strong> {role.risk}</p>
                <p><strong>Aktion:</strong> {role.action}</p>
              </section>
            ))}
          </article>

          <article style={card}>
            <h3>Begruendung</h3>
            <ul>{result.finalAnswer.reasoning.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Naechste Aktionen</h3>
            <ol>{result.finalAnswer.nextActions.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
        </section>
      )}

      <section style={{ marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>provider: none</li>
          <li>modelSelected: none</li>
          <li>liveModelEnabled: false</li>
          <li>dryRunOnly: true</li>
          <li>networkCallAllowed: false</li>
          <li>providerDispatchAllowed: false</li>
          <li>finalDispatchBlocked: true</li>
        </ul>
      </section>
    </main>
  );
}
