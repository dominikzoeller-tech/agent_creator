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

write('frontend/lib/cmt-master-answer-log-list-json-import.ts', `import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportInput = {
  rawJson?: string;
};

export type SecureMasterAnswerLogJsonImportResult = {
  phase: '138.0';
  label: 'Secure Master Answer Log JSON Import Preparation';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  schemaExpected: 'cmt.secureMaster.answerLogList.export.v1';
  importState: {
    importPrepared: true;
    importUiVisible: true;
    schemaCheckPrepared: true;
    importPreviewPrepared: true;
    applyImportAutomatically: false;
    manualApplyRequiredLater: true;
    browserStorePreserved: true;
    persistedInBrowser: 'browser_optional_local';
    persistedOnServer: false;
    serverStoragePrepared: false;
  };
  validation: {
    hasRawJson: boolean;
    parseOk: boolean;
    schemaOk: boolean;
    error: string | null;
    itemCount: number;
    hasFilters: boolean;
    hasPersistenceState: boolean;
    hasSafetyState: boolean;
  };
  preview: {
    schema?: string;
    phase?: string;
    exportedAt?: string;
    sourceCount?: number;
    filteredCount?: number;
    persistedOnServer?: boolean;
    externalSharingAllowed?: boolean;
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

export function prepareSecureMasterAnswerLogJsonImport(input: SecureMasterAnswerLogJsonImportInput): SecureMasterAnswerLogJsonImportResult {
  const rawJson = input.rawJson || '';
  let parsed: any = null;
  let parseOk = false;
  let error: string | null = null;

  if (rawJson.trim()) {
    try {
      parsed = JSON.parse(rawJson);
      parseOk = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'JSON parse failed';
    }
  }

  const schemaOk = Boolean(parseOk && parsed?.schema === 'cmt.secureMaster.answerLogList.export.v1');
  const filter = parsed?.mainBrowserStore?.browserStore?.mainSelect?.select?.filter;
  const itemCount = Array.isArray(filter?.items) ? filter.items.length : 0;
  const exportState = parsed?.exportState;
  const safety = parsed?.safety;

  return {
    phase: '138.0',
    label: 'Secure Master Answer Log JSON Import Preparation',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    schemaExpected: 'cmt.secureMaster.answerLogList.export.v1',
    importState: {
      importPrepared: true,
      importUiVisible: true,
      schemaCheckPrepared: true,
      importPreviewPrepared: true,
      applyImportAutomatically: false,
      manualApplyRequiredLater: true,
      browserStorePreserved: true,
      persistedInBrowser: 'browser_optional_local',
      persistedOnServer: false,
      serverStoragePrepared: false,
    },
    validation: {
      hasRawJson: Boolean(rawJson.trim()),
      parseOk,
      schemaOk,
      error,
      itemCount,
      hasFilters: Boolean(filter),
      hasPersistenceState: Boolean(exportState),
      hasSafetyState: Boolean(safety),
    },
    preview: parseOk ? {
      schema: parsed?.schema,
      phase: parsed?.phase,
      exportedAt: parsed?.exportedAt,
      sourceCount: filter?.sourceCount,
      filteredCount: filter?.filteredCount,
      persistedOnServer: exportState?.persistedOnServer,
      externalSharingAllowed: safety?.externalSharingAllowed,
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
    note: 'Phase 138.0 bereitet den lokalen JSON-Import vor. Der Import wird nur geprueft und angezeigt, aber nicht automatisch angewendet.',
  };
}

export function getSecureMasterAnswerLogJsonImportDemo() {
  return prepareSecureMasterAnswerLogJsonImport({
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

write('frontend/app/api/cmt/master/secure/main/log/list/import-json/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportDemo, prepareSecureMasterAnswerLogJsonImport } from '../../../../../../../../lib/cmt-master-answer-log-list-json-import';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(prepareSecureMasterAnswerLogJsonImport({
    rawJson: typeof body?.rawJson === 'string' ? body.rawJson : '',
  }));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/import-json/page.tsx', `'use client';

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
`);

write('README_PHASE138_0.md', `# Phase 138.0 - Secure Master Answer Log JSON Import Preparation

Bereitet lokalen JSON-Import fuer die Haupt-Logliste vor.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-json-import.ts
- API: /api/cmt/master/secure/main/log/list/import-json
- UI: /cmt/master/secure/main/log/list/import-json
- Patch: scripts/p138-0.cjs
- Verify: scripts/v138-0.cjs

Wirkung:

- Import-UI vorbereitet.
- Schema-Pruefung vorbereitet.
- Import Preview vorbereitet.
- Import wird nicht automatisch angewendet.
- Manuelle Anwendung spaeter vorbereitet.
- Browser-Speicher bleibt erhalten.
- Server-Persistenz bleibt false.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- importPrepared = true
- importUiVisible = true
- schemaCheckPrepared = true
- importPreviewPrepared = true
- applyImportAutomatically = false
- manualApplyRequiredLater = true
- browserStorePreserved = true
- persistedInBrowser = browser_optional_local
- persistedOnServer = false
- serverStoragePrepared = false
- externalSharingAllowed = false
`);

write('scripts/v138-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'prepareSecureMasterAnswerLogJsonImport'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', "phase: '138.0'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'importPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'importUiVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'schemaCheckPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'importPreviewPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'manualApplyRequiredLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'browserStorePreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/route.ts', 'prepareSecureMasterAnswerLogJsonImport'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/page.tsx', 'Import Preview vorbereiten'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/page.tsx', 'Validation'],
  ['README_PHASE138_0.md', 'Secure Master Answer Log JSON Import Preparation'],
  ['package.json', 'phase138:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 138.0 Secure Master Answer Log JSON Import Preparation verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase138:0:verify'] = 'node scripts/v138-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 138.0 Secure Master Answer Log JSON Import Preparation patch applied.');
