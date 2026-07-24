'use client';

import { useState } from 'react';
import type { MasterAgentResult } from '../../../lib/cmt-master';

export default function MasterAgentPage() {
  const [question, setQuestion] = useState('Soll ich den Gremium-Agenten jetzt live schalten oder erst verbessern?');
  const [result, setResult] = useState<MasterAgentResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master', {
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
        <h1>Phase 120.0</h1>
        <h2>Master Agent Router MVP</h2>
        <p><strong>Status:</strong> Master-Router lokal testbar. Noch nicht live mit KI-Modell.</p>
        <p>Der Master-Agent entscheidet lokal: direkt antworten, Gremium fragen, Privacy-Gate, Tool benoetigt oder Spezialagenten-Idee.</p>
      </section>

      <section style={card}>
        <h3>Frage an den Master-Agenten</h3>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Master-Agent routet lokal...' : 'Master-Agent fragen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Routing Entscheidung</h3>
            <p><strong>Frage:</strong> {result.question}</p>
            <p><strong>Route:</strong> {result.decision.route}</p>
            <p><strong>Grund:</strong> {result.decision.reason}</p>
            <p><strong>Confidence:</strong> {result.decision.confidence}</p>
            {result.directAnswer && <p><strong>Direktantwort:</strong> {result.directAnswer}</p>}
          </article>

          <article style={card}>
            <h3>Privacy Gate</h3>
            <ul>
              <li>sensitivity: {result.privacy.sensitivity}</li>
              <li>externalSharingAllowed: {String(result.privacy.externalSharingAllowed)}</li>
              <li>anonymizationRequired: {String(result.privacy.anonymizationRequired)}</li>
              <li>userApprovalRequired: {String(result.privacy.userApprovalRequired)}</li>
            </ul>
          </article>

          {result.committee && (
            <article style={card}>
              <h3>Gremium Ergebnis</h3>
              <p><strong>Intent:</strong> {result.committee.intent}</p>
              <p><strong>Empfehlung:</strong> {result.committee.finalAnswer.recommendation}</p>
              <p><strong>Direktantwort:</strong> {result.committee.finalAnswer.directAnswer}</p>
            </article>
          )}

          <article style={card}>
            <h3>Naechste Aktionen</h3>
            <ol>{result.nextActions.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
        </section>
      )}

      <section style={{ marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>provider: none</li>
          <li>modelSelected: none</li>
          <li>liveModelEnabled: false</li>
          <li>localReasoningOnly: true</li>
          <li>internetAccessEnabled: false</li>
          <li>dryRunOnly: true</li>
          <li>networkCallAllowed: false</li>
          <li>providerDispatchAllowed: false</li>
          <li>finalDispatchBlocked: true</li>
        </ul>
      </section>
    </main>
  );
}
