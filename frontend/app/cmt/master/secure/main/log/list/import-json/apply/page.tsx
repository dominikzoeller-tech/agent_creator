'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogJsonImportApplyResult } from '../../../../../../../../lib/cmt-master-answer-log-list-json-import-apply';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from '../../../../../../../../lib/cmt-master-answer-log-list-browser-store';

export default function SecureMasterAnswerLogJsonImportApplyPage() {
  const [rawJson, setRawJson] = useState('');
  const [result, setResult] = useState<SecureMasterAnswerLogJsonImportApplyResult | null>(null);
  const [applyStatus, setApplyStatus] = useState('nicht angewendet');
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function prepareApply() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure/main/log/list/import-json/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rawJson }),
      });
      setResult(await response.json());
      setApplyStatus('Preview vorbereitet');
    } finally {
      setLoading(false);
    }
  }

  function manualApply() {
    if (!result?.applyPayloadPreview.canApply) {
      setApplyStatus('nicht angewendet: Validation oder Schema nicht gueltig');
      return;
    }
    const payload = {
      appliedAt: new Date().toISOString(),
      source: 'manual_json_import_apply_prepared_phase_139_0',
      rawJson,
      validation: result.importPreview.validation,
      preview: result.importPreview.preview,
    };
    window.localStorage.setItem(SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY, JSON.stringify(payload));
    setApplyStatus('manuell in Browser-Speicher uebernommen: ' + payload.appliedAt);
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 139.0</h1>
        <h2>Secure Master Answer Log JSON Import Manual Browser Apply</h2>
        <p><strong>Status:</strong> Manuelle Uebernahme validierter Export-JSON-Daten in den Browser-Speicher ist vorbereitet. Kein automatischer Import.</p>
        <p><strong>Storage Key:</strong> {SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY}</p>
        <p><Link href="/cmt/master/secure/main/log/list/import-json">JSON-Import</Link> · <Link href="/cmt/master/secure/main/log/list/export-json">JSON-Export</Link> · <Link href="/cmt/master/secure/main/log/list">Haupt-Logliste</Link></p>
      </section>

      <section style={card}>
        <h3>Export-JSON einfuegen</h3>
        <textarea value={rawJson} onChange={(event) => setRawJson(event.target.value)} rows={12} placeholder="Export-JSON hier einfuegen" style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc', fontFamily: 'monospace' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <button onClick={prepareApply} disabled={loading} style={{ padding: '10px 16px', borderRadius: 10 }}>{loading ? 'Apply Preview wird vorbereitet...' : 'Apply Preview vorbereiten'}</button>
          <button onClick={manualApply} disabled={!result?.applyPayloadPreview.canApply} style={{ padding: '10px 16px', borderRadius: 10 }}>Validiertes JSON manuell in Browser speichern</button>
        </div>
        <p><strong>Apply Status:</strong> {applyStatus}</p>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Apply State</h3>
            <ul>{Object.entries(result.applyState).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
          </article>
          <article style={card}>
            <h3>Apply Payload Preview</h3>
            <ul>{Object.entries(result.applyPayloadPreview).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
          </article>
          <article style={card}>
            <h3>Validation vor Apply</h3>
            <ul>{Object.entries(result.importPreview.validation).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
          </article>
          <article style={card}>
            <h3>Import Preview vor Apply</h3>
            <pre style={{ overflow: 'auto', maxHeight: 360, background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 12 }}>{JSON.stringify(result.importPreview.preview, null, 2)}</pre>
          </article>
        </section>
      )}
    </main>
  );
}
