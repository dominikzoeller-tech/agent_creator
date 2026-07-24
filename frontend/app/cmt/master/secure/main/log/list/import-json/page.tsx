'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogJsonImportResult } from '../../../../../../../lib/cmt-master-answer-log-list-json-import';

export default function SecureMasterAnswerLogJsonImportPage() {
  const [rawJson, setRawJson] = useState('');
  const [result, setResult] = useState<SecureMasterAnswerLogJsonImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function prepareImport() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure/main/log/list/import-json', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rawJson }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 138.0</h1>
        <h2>Secure Master Answer Log JSON Import Preparation</h2>
        <p><strong>Status:</strong> Lokaler JSON-Import ist vorbereitet. Der Import wird nur geprueft und angezeigt, nicht automatisch angewendet.</p>
        <p><Link href="/cmt/master/secure/main/log/list/export-json">JSON-Export</Link> · <Link href="/cmt/master/secure/main/log/list">Haupt-Logliste</Link> · <Link href="/cmt/master/secure">Secure Master</Link></p>
      </section>

      <section style={card}>
        <h3>JSON einfuegen</h3>
        <textarea value={rawJson} onChange={(event) => setRawJson(event.target.value)} rows={12} placeholder="Export-JSON hier einfuegen" style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc', fontFamily: 'monospace' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <button onClick={prepareImport} disabled={loading} style={{ padding: '10px 16px', borderRadius: 10 }}>{loading ? 'Import Preview wird vorbereitet...' : 'Import Preview vorbereiten'}</button>
        </div>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Import State</h3>
            <ul>{Object.entries(result.importState).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
          </article>
          <article style={card}>
            <h3>Validation</h3>
            <ul>{Object.entries(result.validation).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
          </article>
          <article style={card}>
            <h3>Import Preview</h3>
            <pre style={{ overflow: 'auto', maxHeight: 360, background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 12 }}>{JSON.stringify(result.preview, null, 2)}</pre>
          </article>
          <article style={card}>
            <h3>Safety State</h3>
            <ul>{Object.entries(result.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
          </article>
        </section>
      )}
    </main>
  );
}
