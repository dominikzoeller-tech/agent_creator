'use client';

import { useState } from 'react';
import type { CommitteeSavedSession } from '../../../lib/cmt-save';

export default function CommitteeSavePage() {
  const [text, setText] = useState('Soll der Agent Gremiumsfragen als Session speichern?');
  const [saved, setSaved] = useState<CommitteeSavedSession | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const questions = text.split('
').map((line) => line.trim()).filter(Boolean);
      const response = await fetch('/api/cmt/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ questions }),
      });
      const data = await response.json();
      setSaved(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 113.1</h1>
      <h2>Gremium Save</h2>
      <p>Mehrere Gremiumsfragen werden als dry-run-only Session gesammelt und angezeigt.</p>

      <section>
        <h3>Fragen</h3>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={6}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={save} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Session wird gespeichert...' : 'Session speichern'}
        </button>
      </section>

      {saved && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <h3>Gespeicherte Session</h3>
          <p>sessionKey: {saved.sessionKey}</p>
          <p>savedCount: {saved.savedCount}</p>
          {saved.history.items.map((item) => (
            <article key={item.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
              <h4>{item.title}</h4>
              <p>{item.question}</p>
              <p><strong>decision:</strong> {item.view.panels.decision}</p>
            </article>
          ))}
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
