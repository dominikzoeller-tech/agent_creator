'use client';

import { useState } from 'react';
import type { CommitteeView } from '../../../lib/cmt-view';

export default function CommitteeViewPage() {
  const [text, setText] = useState('Soll die UI das Gremium-Ergebnis in klaren Panels anzeigen?');
  const [view, setView] = useState<CommitteeView | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/view', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setView(data);
    } finally {
      setLoading(false);
    }
  }

  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 112.2</h1>
      <h2>Gremium View</h2>
      <p>Das Gremium-Ergebnis wird in klaren Panels angezeigt: Antwort, Entscheidung, Rollen, Risiken und Aktionen.</p>

      <section style={card}>
        <h3>Frage</h3>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={submit} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Panel wird gebaut...' : 'Gremium View erzeugen'}
        </button>
      </section>

      {view && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Antwort</h3>
            <p>{view.panels.answer}</p>
            <p><strong>decision:</strong> {view.panels.decision}</p>
          </article>

          <article style={card}>
            <h3>Rollen</h3>
            <ul>{view.panels.roles.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Risiken</h3>
            <ul>{view.panels.risks.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Aktionen</h3>
            <ul>{view.panels.actions.map((item) => <li key={item}>{item}</li>)}</ul>
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
