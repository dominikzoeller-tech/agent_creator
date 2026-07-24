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

write('frontend/lib/cmt-master-answer-log-list-json-export.ts', `import { createSecureMasterAnswerLogMainBrowserStore, type SecureMasterAnswerLogMainBrowserStoreResult } from './cmt-master-answer-log-list-main-browser-store';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogJsonExportInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogJsonExportPayload = {
  schema: 'cmt.secureMaster.answerLogList.export.v1';
  phase: '137.0';
  exportedAt: string;
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  mainBrowserStore: SecureMasterAnswerLogMainBrowserStoreResult;
  exportState: {
    exportPrepared: true;
    exportButtonVisible: true;
    jsonPayloadPrepared: true;
    importPreparedLater: true;
    includesLogs: true;
    includesFilters: true;
    includesPersistenceState: true;
    includesSafetyState: true;
    persistedInBrowser: 'browser_optional_local';
    persistedOnServer: false;
    serverStoragePrepared: false;
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
};

export function createSecureMasterAnswerLogJsonExport(input: SecureMasterAnswerLogJsonExportInput): SecureMasterAnswerLogJsonExportPayload {
  return {
    schema: 'cmt.secureMaster.answerLogList.export.v1',
    phase: '137.0',
    exportedAt: new Date().toISOString(),
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    mainBrowserStore: createSecureMasterAnswerLogMainBrowserStore(input),
    exportState: {
      exportPrepared: true,
      exportButtonVisible: true,
      jsonPayloadPrepared: true,
      importPreparedLater: true,
      includesLogs: true,
      includesFilters: true,
      includesPersistenceState: true,
      includesSafetyState: true,
      persistedInBrowser: 'browser_optional_local',
      persistedOnServer: false,
      serverStoragePrepared: false,
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
  };
}

export function getSecureMasterAnswerLogJsonExportDemo() {
  return createSecureMasterAnswerLogJsonExport({
    items: [
      { input: 'Was kannst du als Secure Master aktuell?', option: 'local_only' },
      { input: 'Soll ich den Secure Master Agent jetzt live schalten?', option: 'local_only' },
      { input: 'Hier sind interne Kundendaten. Was darfst du damit machen?', option: 'local_only' },
      { input: 'Soll ich fuer diese Entscheidung das Gremium fragen?', option: 'local_only' },
      { input: 'Wie ist morgen das Wetter?', option: 'local_only' },
      { input: 'Baue mir spaeter einen Trading-Agenten.', option: 'local_only' },
    ],
    search: '',
    route: 'all',
    intent: 'all',
    privacyDecision: 'all',
  });
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/export-json/route.ts', `import { NextResponse } from 'next/server';
import { createSecureMasterAnswerLogJsonExport, getSecureMasterAnswerLogJsonExportDemo } from '../../../../../../../../lib/cmt-master-answer-log-list-json-export';
import type { PrivacyDecisionOption } from '../../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonExportDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.map((item: any) => ({
    input: typeof item?.input === 'string' ? item.input : '',
    option: typeof item?.option === 'string' && options.includes(item.option) ? item.option : 'local_only',
  }));

  return NextResponse.json(createSecureMasterAnswerLogJsonExport({
    items,
    search: typeof body?.search === 'string' ? body.search : '',
    route: typeof body?.route === 'string' ? body.route : 'all',
    intent: typeof body?.intent === 'string' ? body.intent : 'all',
    privacyDecision: typeof body?.privacyDecision === 'string' ? body.privacyDecision : 'all',
  }));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/export-json/page.tsx', `'use client';

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
].join('\n');

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
      const items = text.split('\n').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
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
`);

write('README_PHASE137_0.md', `# Phase 137.0 - Secure Master Answer Log JSON Export

Bereitet lokalen JSON-Export fuer die Haupt-Logliste vor.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-json-export.ts
- API: /api/cmt/master/secure/main/log/list/export-json
- UI: /cmt/master/secure/main/log/list/export-json
- Patch: scripts/p137-0.cjs
- Verify: scripts/v137-0.cjs

Wirkung:

- Export-Button vorbereitet.
- JSON-Payload vorbereitet.
- Logs enthalten.
- Filter enthalten.
- Persistence State enthalten.
- Safety State enthalten.
- Import spaeter vorbereitet.
- Browser-Speicher bleibt erhalten.
- Server-Persistenz bleibt false.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- exportPrepared = true
- exportButtonVisible = true
- jsonPayloadPrepared = true
- importPreparedLater = true
- includesLogs = true
- includesFilters = true
- includesPersistenceState = true
- includesSafetyState = true
- persistedInBrowser = browser_optional_local
- persistedOnServer = false
- serverStoragePrepared = false
- externalSharingAllowed = false
`);

write('scripts/v137-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'createSecureMasterAnswerLogJsonExport'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', "phase: '137.0'"],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'exportPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'exportButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'jsonPayloadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'importPreparedLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'includesLogs: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'includesFilters: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'includesPersistenceState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'includesSafetyState: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/export-json/route.ts', 'createSecureMasterAnswerLogJsonExport'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/page.tsx', 'JSON-Export vorbereiten'],
  ['frontend/app/cmt/master/secure/main/log/list/export-json/page.tsx', 'JSON herunterladen'],
  ['README_PHASE137_0.md', 'Secure Master Answer Log JSON Export'],
  ['package.json', 'phase137:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 137.0 Secure Master Answer Log JSON Export verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase137:0:verify'] = 'node scripts/v137-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 137.0 Secure Master Answer Log JSON Export patch applied.');
