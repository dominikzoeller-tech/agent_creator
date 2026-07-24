'use client';

import { useState } from 'react';
import type { PrivacyGateResult } from '../../lib/cmt-privacy-gate';

export default function PrivacyGatePage() {
  const [input, setInput] = useState('Hier ist eine interne Kalkulation fuer Kunde Muster mit Angebot 12345. Darf der Agent das pruefen?');
  const [result, setResult] = useState<PrivacyGateResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/privacy', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input }),
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
        <h1>Phase 121.0</h1>
        <h2>Privacy Gate MVP</h2>
        <p><strong>Status:</strong> Datenschutz-Gate lokal testbar. Keine externe Weitergabe.</p>
      </section>

      <section style={card}>
        <h3>Daten / Frage prüfen</h3>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={check} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Privacy Gate prueft...' : 'Privacy Gate prüfen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Entscheidung</h3>
            <p><strong>decision:</strong> {result.decision.decision}</p>
            <p><strong>reason:</strong> {result.decision.reason}</p>
            <p><strong>recommendedAction:</strong> {result.decision.recommendedAction}</p>
          </article>

          <article style={card}>
            <h3>Erkennung</h3>
            <ul>
              <li>sensitivity: {result.detected.sensitivity}</li>
              <li>containsInternalSignals: {String(result.detected.containsInternalSignals)}</li>
              <li>containsPersonalSignals: {String(result.detected.containsPersonalSignals)}</li>
              <li>containsBusinessSignals: {String(result.detected.containsBusinessSignals)}</li>
              <li>containsSecretSignals: {String(result.detected.containsSecretSignals)}</li>
            </ul>
          </article>

          <article style={card}>
            <h3>Anonymisierte Vorschau</h3>
            <p>{result.anonymizedPreview}</p>
          </article>

          <article style={card}>
            <h3>Freigabe</h3>
            <ul>
              <li>required: {String(result.approval.required)}</li>
              <li>selectedOption: {result.approval.selectedOption}</li>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
            </ul>
          </article>
        </section>
      )}

      <section style={{ marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>provider: none</li>
          <li>modelSelected: none</li>
          <li>liveModelEnabled: false</li>
          <li>externalSharingAllowed: false</li>
          <li>networkCallAllowed: false</li>
          <li>providerDispatchAllowed: false</li>
          <li>finalDispatchBlocked: true</li>
        </ul>
      </section>
    </main>
  );
}
