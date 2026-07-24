'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogJsonExportPayload } from '../../../../../../../lib/cmt-master-answer-log-list-json-export';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
  'Wie ist morgen das Wetter?',
  'Baue mir spaeter einen Trading-Agenten.',
].join('
');

export default function SecureMasterAnswerLogJsonExportPage() {
  const [text, setText] = useState(defaults);
  const [search, setSearch] = useState('');
  const [route, setRoute] = useState('all');
  const [intent, setIntent] = useState('all');
  const [privacyDecision, setPrivacyDecision] = useState('all');
  const [payload, setPayload] = useState<SecureMasterAnswerLogJsonExportPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function prepareExport() {
    setLoading(true);
    try {
      const items = text.split('
').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/export-json', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items, search, route, intent, privacyDecision }),
      });
      setPayload(await response.json());
    } finally {
      setLoading(false);
    }
  }

  function downloadJson() {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'secure-master-answer-log-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 137.0</h1>
        <h2>Secure Master Answer Log JSON Export</h2>
        <p><strong>Status:</strong> Lokaler JSON-Export fuer die Haupt-Logliste ist vorbereitet. Kein Server-Speicher, kein Provider, kein Internet.</p>
        <p><Link href="/cmt/master/secure/main/log/list">Haupt-Logliste</Link> · <Link href="/cmt/master/secure">Secure Master</Link></p>
      </section>

      <section style={card}>
        <h3>Export-Quelle</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <h3>Filter</h3>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', maxWidth: 980 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Suche inputPreview" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <input value={route} onChange={(event) => setRoute(event.target.value)} placeholder="route" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <input value={intent} onChange={(event) => setIntent(event.target.value)} placeholder="intent" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <input value={privacyDecision} onChange={(event) => setPrivacyDecision(event.target.value)} placeholder="privacyDecision" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <button onClick={prepareExport} disabled={loading} style={{ padding: '10px 16px', borderRadius: 10 }}>{loading ? 'Export wird vorbereitet...' : 'JSON-Export vorbereiten'}</button>
          <button onClick={downloadJson} disabled={!payload} style={{ padding: '10px 16px', borderRadius: 10 }}>JSON herunterladen</button>
        </div>
      </section>

      {payload && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Export State</h3>
            <ul>{Object.entries(payload.exportState).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
          </article>
          <article style={card}>
            <h3>Safety State</h3>
            <ul>{Object.entries(payload.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
          </article>
          <article style={card}>
            <h3>JSON Preview</h3>
            <pre style={{ overflow: 'auto', maxHeight: 420, background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 12 }}>{JSON.stringify(payload, null, 2)}</pre>
          </article>
        </section>
      )}
    </main>
  );
}
