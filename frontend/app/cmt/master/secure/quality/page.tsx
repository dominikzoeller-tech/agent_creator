'use client';

import { useState } from 'react';
import type { SecureMasterQualityResult } from '../../../../../lib/cmt-master-quality';
import type { PrivacyDecisionOption } from '../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function SecureMasterQualityPage() {
  const [input, setInput] = useState('Soll ich fuer diese interne Entscheidung das Gremium fragen?');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [result, setResult] = useState<SecureMasterQualityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure/quality', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input, option }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 124.0</h1>
        <h2>Secure Master Local Answer Quality</h2>
        <p><strong>Status:</strong> Lokale Antwortqualität verbessert. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Frage testen</h3>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={5} style={{ width: '100%', maxWidth: 920, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <h3>Privacy-Option</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Prüft...' : 'Qualitätsantwort testen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Verbesserte Antwort</h3>
            <p>{result.improvedAnswer}</p>
          </article>
          <article style={card}>
            <h3>Erkennung</h3>
            <ul>
              <li>detectedIntent: {result.detectedIntent}</li>
              <li>finalRoute: {result.finalRoute}</li>
              <li>committeeRolesVisible: {String(result.committeeRolesVisible)}</li>
              <li>missingCapability: {result.missingCapability || 'none'}</li>
            </ul>
          </article>
          <article style={card}>
            <h3>Lokale nächste Schritte</h3>
            <ol>{result.localNextSteps.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
          <article style={card}>
            <h3>Safety</h3>
            <ul>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
              <li>liveModelEnabled: {String(result.liveModelEnabled)}</li>
              <li>provider: {result.provider}</li>
              <li>networkCallAllowed: {String(result.networkCallAllowed)}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
