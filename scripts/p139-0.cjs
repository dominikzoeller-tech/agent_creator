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

write('frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', `import { prepareSecureMasterAnswerLogJsonImport, type SecureMasterAnswerLogJsonImportResult } from './cmt-master-answer-log-list-json-import';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportApplyInput = {
  rawJson?: string;
};

export type SecureMasterAnswerLogJsonImportApplyResult = {
  phase: '139.0';
  label: 'Secure Master Answer Log JSON Import Manual Browser Apply Preparation';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  importPreview: SecureMasterAnswerLogJsonImportResult;
  applyState: {
    manualApplyPrepared: true;
    applyButtonVisible: true;
    applyRequiresValidSchema: true;
    applyRequiresParseOk: true;
    applyImportAutomatically: false;
    previewVisibleBeforeApply: true;
    validationVisibleBeforeApply: true;
    localStorageWritePrepared: true;
    browserStorePreserved: true;
    persistedInBrowser: 'browser_optional_local_after_manual_apply';
    persistedOnServer: false;
    serverStoragePrepared: false;
  };
  applyPayloadPreview: {
    canApply: boolean;
    reason: string;
    storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
    itemCount: number;
    sourceCount?: number;
    filteredCount?: number;
    exportedAt?: string;
  };
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

export function prepareSecureMasterAnswerLogJsonImportApply(input: SecureMasterAnswerLogJsonImportApplyInput): SecureMasterAnswerLogJsonImportApplyResult {
  const importPreview = prepareSecureMasterAnswerLogJsonImport({ rawJson: input.rawJson || '' });
  const canApply = importPreview.validation.parseOk && importPreview.validation.schemaOk;
  const preview = importPreview.preview;

  return {
    phase: '139.0',
    label: 'Secure Master Answer Log JSON Import Manual Browser Apply Preparation',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    importPreview,
    applyState: {
      manualApplyPrepared: true,
      applyButtonVisible: true,
      applyRequiresValidSchema: true,
      applyRequiresParseOk: true,
      applyImportAutomatically: false,
      previewVisibleBeforeApply: true,
      validationVisibleBeforeApply: true,
      localStorageWritePrepared: true,
      browserStorePreserved: true,
      persistedInBrowser: 'browser_optional_local_after_manual_apply',
      persistedOnServer: false,
      serverStoragePrepared: false,
    },
    applyPayloadPreview: {
      canApply,
      reason: canApply ? 'Export-JSON ist parsebar und Schema ist gueltig. Manuelle Uebernahme in Browser-Speicher ist vorbereitet.' : 'Export-JSON ist noch nicht gueltig fuer manuelle Uebernahme.',
      storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
      itemCount: importPreview.validation.itemCount,
      sourceCount: preview?.sourceCount,
      filteredCount: preview?.filteredCount,
      exportedAt: preview?.exportedAt,
    },
    safety: {
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    note: 'Phase 139.0 bereitet die manuelle Uebernahme validierter Export-JSON-Daten in den Browser-Speicher vor. Kein automatischer Import.',
  };
}

export function getSecureMasterAnswerLogJsonImportApplyDemo() {
  return prepareSecureMasterAnswerLogJsonImportApply({
    rawJson: JSON.stringify({
      schema: 'cmt.secureMaster.answerLogList.export.v1',
      phase: '137.0',
      exportedAt: 'demo',
      exportState: { persistedOnServer: false },
      safety: { externalSharingAllowed: false },
      mainBrowserStore: {
        browserStore: {
          mainSelect: {
            select: {
              filter: { sourceCount: 2, filteredCount: 2, items: [{ id: 'demo-1' }, { id: 'demo-2' }] },
            },
          },
        },
      },
    }, null, 2),
  });
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/import-json/apply/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportApplyDemo, prepareSecureMasterAnswerLogJsonImportApply } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-import-apply';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportApplyDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(prepareSecureMasterAnswerLogJsonImportApply({
    rawJson: typeof body?.rawJson === 'string' ? body.rawJson : '',
  }));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/import-json/apply/page.tsx', `'use client';

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
`);

write('README_PHASE139_0.md', `# Phase 139.0 - Secure Master Answer Log JSON Import Manual Browser Apply Preparation

Bereitet die manuelle Uebernahme validierter Export-JSON-Daten in den Browser-Speicher vor.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-json-import-apply.ts
- API: /api/cmt/master/secure/main/log/list/import-json/apply
- UI: /cmt/master/secure/main/log/list/import-json/apply
- Patch: scripts/p139-0.cjs
- Verify: scripts/v139-0.cjs

Wirkung:

- Manuelle Apply-Schaltflaeche vorbereitet.
- Apply Preview vorbereitet.
- Validation vor Apply sichtbar.
- Import Preview vor Apply sichtbar.
- Nur parsebares JSON mit gueltigem Schema kann angewendet werden.
- Kein automatischer Import.
- localStorage-Write vorbereitet.
- Browser-Speicher bleibt lokal.
- Server-Persistenz bleibt false.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- manualApplyPrepared = true
- applyButtonVisible = true
- applyRequiresValidSchema = true
- applyRequiresParseOk = true
- applyImportAutomatically = false
- previewVisibleBeforeApply = true
- validationVisibleBeforeApply = true
- localStorageWritePrepared = true
- browserStorePreserved = true
- persistedInBrowser = browser_optional_local_after_manual_apply
- persistedOnServer = false
- serverStoragePrepared = false
- externalSharingAllowed = false
`);

write('scripts/v139-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'prepareSecureMasterAnswerLogJsonImportApply'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', "phase: '139.0'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'manualApplyPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'applyButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'applyRequiresValidSchema: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'applyRequiresParseOk: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'previewVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'validationVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'localStorageWritePrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/apply/route.ts', 'prepareSecureMasterAnswerLogJsonImportApply'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/page.tsx', 'Apply Preview vorbereiten'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/page.tsx', 'Validiertes JSON manuell in Browser speichern'],
  ['README_PHASE139_0.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Preparation'],
  ['package.json', 'phase139:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 139.0 Secure Master Answer Log JSON Import Manual Browser Apply Preparation verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase139:0:verify'] = 'node scripts/v139-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 139.0 Secure Master Answer Log JSON Import Manual Browser Apply Preparation patch applied.');
