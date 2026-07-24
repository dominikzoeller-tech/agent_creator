'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogManualApplyBrowserLoadResult } from '../../../../../../../lib/cmt-master-answer-log-list-manual-apply-browser-load';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from '../../../../../../../lib/cmt-master-answer-log-list-browser-store';

export default function SecureMasterManualApplyBrowserLoadPage() {
  const [result, setResult] = useState<SecureMasterAnswerLogManualApplyBrowserLoadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function loadFromBrowser() {
    setLoading(true);
    try {
      const rawStoredValue = window.localStorage.getItem(SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY) || '';
      const response = await fetch('/api/cmt/master/secure/main/log/list/manual-apply-browser-load', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rawStoredValue }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 140.0</h1>
        <h2>Secure Master Main Log List Manual JSON Apply Browser Load</h2>
        <p><strong>Status:</strong> Haupt-Logliste kann manuell angewendete Import-Payloads aus dem Browser-Speicher laden und als manual_json_import_apply kennzeichnen.</p>
        <p><strong>Storage Key:</strong> {SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY}</p>
        <p><Link href="/cmt/master/secure/main/log/list/import-json/apply">Manual Apply</Link> · <Link href="/cmt/master/secure/main/log/list">Haupt-Logliste</Link> · <Link href="/cmt/master/secure">Secure Master</Link></p>
      </section>

      <section style={card}>
        <h3>Browser-Speicher laden</h3>
        <p>Diese Seite liest den lokalen Browser-Speicher und prueft, ob die Quelle <code>manual_json_import_apply_prepared_phase_139_0</code> ist.</p>
        <button onClick={loadFromBrowser} disabled={loading} style={{ padding: '10px 16px', borderRadius: 10 }}>{loading ? 'Browser-Speicher wird geladen...' : 'Manual-Apply-Payload aus Browser laden'}</button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Load State</h3>
            <ul>{Object.entries(result.loadState).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
          </article>
          <article style={card}>
            <h3>Validation</h3>
            <ul>{Object.entries(result.validation).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
          </article>
          <article style={card}>
            <h3>Source Preview</h3>
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
