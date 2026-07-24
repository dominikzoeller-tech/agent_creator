'use client';

import { useState } from 'react';
import type { CommitteeRun } from '../../../lib/cmt-run';

export default function CommitteeRunPage() {
  const [text, setText] = useState('Soll die UI eine Frage per Button an das Gremium senden und ein Ergebnis anzeigen?');
  const [run, setRun] = useState<CommitteeRun | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setRun(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 112.1</h1>
      <h2>Gremium Run</h2>
      <p>Die Frage wird per Button dry-run-only an die lokale Gremium-API gesendet.</p>

      <section>
        <h3>Frage</h3>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={submit} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Gremium laeuft...' : 'Gremium fragen'}
        </button>
      </section>

      {run && (
        <section>
          <h3>Ergebnis</h3>
          <p>{run.ask.result.brief.userMessage}</p>
          <ul>
            <li>requestId: {run.requestId}</li>
            <li>status: {run.status}</li>
            <li>decision: {run.ask.result.brief.decision}</li>
          </ul>
          <h4>Aktionen</h4>
          <ul>{run.ask.result.brief.actions.map((action) => <li key={action}>{action}</li>)}</ul>
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
