'use client';

import { useState } from 'react';
import type { CommitteeMvpDemo } from '../../../lib/cmt-demo';

export default function CommitteeMvpDemoPage() {
  const [text, setText] = useState('Soll der Gremium-Agent als MVP-Demo eine Frage komplett durch den internen Flow fuehren?');
  const [demo, setDemo] = useState<CommitteeMvpDemo | null>(null);
  const [loading, setLoading] = useState(false);

  async function runDemo() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setDemo(data);
    } finally {
      setLoading(false);
    }
  }

  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 114.0</h1>
      <h2>Gremium MVP Demo</h2>
      <p>Ein kompletter dry-run-only Demo-Flow vom User-Input bis zur Gremiumsantwort.</p>

      <section style={card}>
        <h3>Frage</h3>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={runDemo} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Demo laeuft...' : 'MVP-Demo starten'}
        </button>
      </section>

      {demo && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>{demo.finalAnswer.headline}</h3>
            <p><strong>recommendation:</strong> {demo.finalAnswer.recommendation}</p>
          </article>

          <article style={card}>
            <h3>Flow</h3>
            <ol>{demo.flow.map((item) => <li key={item.step}><strong>{item.step}:</strong> {item.result}</li>)}</ol>
          </article>

          <article style={card}>
            <h3>Risiken</h3>
            <ul>{demo.finalAnswer.risks.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Aktionen</h3>
            <ul>{demo.finalAnswer.actions.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </section>
      )}

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: none</li>
          <li>modelSelected: none</li>
          <li>dryRunOnly: true</li>
          <li>networkCallAllowed: false</li>
          <li>providerDispatchAllowed: false</li>
          <li>finalDispatchBlocked: true</li>
        </ul>
      </section>
    </main>
  );
}
