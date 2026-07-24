'use client';

import { useState } from 'react';
import type { CommitteeDemoShare } from '../../../../lib/cmt-demo-share';

export default function CommitteeDemoSharePage() {
  const [text, setText] = useState('Soll der Gremium-Agent eine copy-ready Demo-Zusammenfassung erzeugen?');
  const [share, setShare] = useState<CommitteeDemoShare | null>(null);
  const [loading, setLoading] = useState(false);

  async function runShare() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/demo/share', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setShare(data);
    } finally {
      setLoading(false);
    }
  }

  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 114.2</h1>
      <h2>Gremium Demo Share</h2>
      <p>Der Demo-Report wird als copy-ready Kurzfassung bereitgestellt.</p>

      <section style={card}>
        <h3>Frage</h3>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={runShare} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Share wird gebaut...' : 'Demo-Share erzeugen'}
        </button>
      </section>

      {share && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>{share.share.title}</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{share.share.plainText}</pre>
          </article>

          <article style={card}>
            <h3>Bullets</h3>
            <ul>{share.share.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
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
