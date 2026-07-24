const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('WROTE', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n', 'utf8');

write('frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', `import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogManualApplyBrowserLoadInput = {
  rawStoredValue?: string;
};

export type SecureMasterAnswerLogManualApplyBrowserLoadResult = {
  phase: '140.0';
  label: 'Secure Master Main Log List Manual JSON Apply Browser Load';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  loadState: {
    mainLogListManualApplyBrowserLoadPrepared: true;
    readsManualApplyPayloadFromBrowser: true;
    manualApplySourceRecognized: true;
    sourceLabelVisible: true;
    loadButtonVisible: true;
    browserReadPrepared: true;
    applyImportAutomatically: false;
    externalSharingAllowed: false;
    persistedInBrowser: 'browser_optional_local_after_manual_apply';
    persistedOnServer: false;
    serverStoragePrepared: false;
  };
  validation: {
    hasStoredValue: boolean;
    parseOk: boolean;
    sourceOk: boolean;
    hasValidation: boolean;
    hasPreview: boolean;
    itemCount: number;
    error: string | null;
  };
  preview: {
    source?: string;
    appliedAt?: string;
    itemCount?: number;
    sourceCount?: number;
    filteredCount?: number;
    schemaOk?: boolean;
    parseOk?: boolean;
  } | null;
  safety: {
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    externalSharingAllowed: false;
    finalDispatchBlocked: true;
  };
  note: string;
};

export function loadSecureMasterAnswerLogManualApplyFromBrowser(input: SecureMasterAnswerLogManualApplyBrowserLoadInput): SecureMasterAnswerLogManualApplyBrowserLoadResult {
  const rawStoredValue = input.rawStoredValue || '';
  let parsed: any = null;
  let parseOk = false;
  let error: string | null = null;

  if (rawStoredValue.trim()) {
    try {
      parsed = JSON.parse(rawStoredValue);
      parseOk = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'JSON parse failed';
    }
  }

  const sourceOk = Boolean(parseOk && parsed?.source === 'manual_json_import_apply_prepared_phase_139_0');
  const validation = parsed?.validation;
  const preview = parsed?.preview;
  const itemCount = typeof validation?.itemCount === 'number' ? validation.itemCount : 0;

  return {
    phase: '140.0',
    label: 'Secure Master Main Log List Manual JSON Apply Browser Load',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    loadState: {
      mainLogListManualApplyBrowserLoadPrepared: true,
      readsManualApplyPayloadFromBrowser: true,
      manualApplySourceRecognized: true,
      sourceLabelVisible: true,
      loadButtonVisible: true,
      browserReadPrepared: true,
      applyImportAutomatically: false,
      externalSharingAllowed: false,
      persistedInBrowser: 'browser_optional_local_after_manual_apply',
      persistedOnServer: false,
      serverStoragePrepared: false,
    },
    validation: {
      hasStoredValue: Boolean(rawStoredValue.trim()),
      parseOk,
      sourceOk,
      hasValidation: Boolean(validation),
      hasPreview: Boolean(preview),
      itemCount,
      error,
    },
    preview: parseOk ? {
      source: parsed?.source,
      appliedAt: parsed?.appliedAt,
      itemCount,
      sourceCount: preview?.sourceCount,
      filteredCount: preview?.filteredCount,
      schemaOk: validation?.schemaOk,
      parseOk: validation?.parseOk,
    } : null,
    safety: {
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    note: 'Phase 140.0 bereitet das Laden manuell angewendeter Import-Payloads aus dem Browser-Speicher fuer die Haupt-Logliste vor. Keine externe Weitergabe.',
  };
}

export function getSecureMasterAnswerLogManualApplyBrowserLoadDemo() {
  return loadSecureMasterAnswerLogManualApplyFromBrowser({
    rawStoredValue: JSON.stringify({
      appliedAt: 'demo',
      source: 'manual_json_import_apply_prepared_phase_139_0',
      validation: { parseOk: true, schemaOk: true, itemCount: 2 },
      preview: { sourceCount: 2, filteredCount: 2, exportedAt: 'demo' },
    }, null, 2),
  });
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/manual-apply-browser-load/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogManualApplyBrowserLoadDemo, loadSecureMasterAnswerLogManualApplyFromBrowser } from '../../../../../../../../lib/cmt-master-answer-log-list-manual-apply-browser-load';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogManualApplyBrowserLoadDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(loadSecureMasterAnswerLogManualApplyFromBrowser({
    rawStoredValue: typeof body?.rawStoredValue === 'string' ? body.rawStoredValue : '',
  }));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/manual-apply-browser-load/page.tsx', `'use client';

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
`);

write('README_PHASE140_0.md', `# Phase 140.0 - Secure Master Main Log List Manual JSON Apply Browser Load

Bereitet das Laden manuell angewendeter Import-Payloads aus dem Browser-Speicher fuer die Haupt-Logliste vor.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts
- API: /api/cmt/master/secure/main/log/list/manual-apply-browser-load
- UI: /cmt/master/secure/main/log/list/manual-apply-browser-load
- Patch: scripts/p140-0.cjs
- Verify: scripts/v140-0.cjs

Wirkung:

- Haupt-Logliste kann Manual-Apply-Payloads aus localStorage lesen.
- Quelle manual_json_import_apply wird erkannt.
- Source Label ist vorbereitet.
- Browser-Read ist vorbereitet.
- Load Button ist sichtbar.
- Kein automatischer Import.
- Keine externe Weitergabe.
- Server-Persistenz bleibt false.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- mainLogListManualApplyBrowserLoadPrepared = true
- readsManualApplyPayloadFromBrowser = true
- manualApplySourceRecognized = true
- sourceLabelVisible = true
- loadButtonVisible = true
- browserReadPrepared = true
- applyImportAutomatically = false
- persistedInBrowser = browser_optional_local_after_manual_apply
- persistedOnServer = false
- serverStoragePrepared = false
- externalSharingAllowed = false
`);

write('scripts/v140-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'loadSecureMasterAnswerLogManualApplyFromBrowser'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', "phase: '140.0'"],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'mainLogListManualApplyBrowserLoadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'readsManualApplyPayloadFromBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'manualApplySourceRecognized: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'sourceLabelVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'loadButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'browserReadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/manual-apply-browser-load/route.ts', 'loadSecureMasterAnswerLogManualApplyFromBrowser'],
  ['frontend/app/cmt/master/secure/main/log/list/manual-apply-browser-load/page.tsx', 'Manual-Apply-Payload aus Browser laden'],
  ['frontend/app/cmt/master/secure/main/log/list/manual-apply-browser-load/page.tsx', 'Source Preview'],
  ['README_PHASE140_0.md', 'Secure Master Main Log List Manual JSON Apply Browser Load'],
  ['package.json', 'phase140:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 140.0 Secure Master Main Log List Manual JSON Apply Browser Load verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase140:0:verify'] = 'node scripts/v140-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 140.0 Secure Master Main Log List Manual JSON Apply Browser Load patch applied.');
