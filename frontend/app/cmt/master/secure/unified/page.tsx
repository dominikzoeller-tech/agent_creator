'use client';

import { useState } from 'react';
import type { SecureMasterUnifiedResult } from '../../../../../lib/cmt-master-unified';
import type { PrivacyDecisionOption } from '../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function SecureMasterUnifiedPage() {
  const [input, setInput] = useState('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [result, setResult] = useState<SecureMasterUnifiedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure/unified', {
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
        <h1>Phase 126.0</h1>
        <h2>Secure Master Unified Main Flow</h2>
        <p><strong>Status:</strong> Privacy Gate, Quality-Antwort und 5er-Gremium in einem lokalen Flow. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Frage an den Secure Master</h3>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={5} style={{ width: '100%', maxWidth: 920, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <h3>Privacy-Option</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Secure Master prüft...' : 'Unified Flow testen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          {result.unifiedAnswerBlocks.map((block) => (
            <article key={block.title} style={card}>
              <h3>{block.title}</h3>
              <p>{block.body}</p>
            </article>
          ))}

          {result.committeeRoles.length > 0 && (
            <article style={card}>
              <h3>5 Rollen direkt im Hauptflow</h3>
              {result.committeeRoles.map((role) => (
                <div key={role.id} style={{ marginBottom: 12 }}>
                  <h4>{role.name}</h4>
                  <p><strong>Fokus:</strong> {role.focus}</p>
                  <p>{role.answer}</p>
                </div>
              ))}
            </article>
          )}

          <article style={card}>
            <h3>Flags</h3>
            <ul>
              <li>showsPrivacyGate: {String(result.showsPrivacyGate)}</li>
              <li>showsQualityAnswer: {String(result.showsQualityAnswer)}</li>
              <li>showsCommitteeWhenNeeded: {String(result.showsCommitteeWhenNeeded)}</li>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
              <li>liveModelEnabled: {String(result.liveModelEnabled)}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
