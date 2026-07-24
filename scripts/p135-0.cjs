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

write('frontend/lib/cmt-master-answer-log-list-browser-store.ts', `import { createSecureMasterAnswerLogListMainSelect, type SecureMasterAnswerLogListMainSelectResult } from './cmt-master-answer-log-list-main-select';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export const SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY = 'cmt.secureMaster.answerLogList.v1';

export type SecureMasterAnswerLogBrowserStoreInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogBrowserStoreResult = {
  phase: '135.0';
  label: 'Secure Master Browser Log Store Preparation';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  mainSelect: SecureMasterAnswerLogListMainSelectResult;
  browserPersistence: {
    prepared: true;
    localStorageKeyVisible: true;
    canSaveInBrowser: true;
    canLoadFromBrowser: true;
    canClearBrowserLogs: true;
    persistedInBrowser: 'prepared_not_auto_enabled';
    persistedOnServer: false;
    serverStoragePrepared: false;
    exportPreparedLater: true;
  };
  safety: {
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    externalSharingAllowed: false;
    networkCallAllowed: false;
    finalDispatchBlocked: true;
  };
  note: string;
};

export function createSecureMasterAnswerLogBrowserStore(input: SecureMasterAnswerLogBrowserStoreInput): SecureMasterAnswerLogBrowserStoreResult {
  return {
    phase: '135.0',
    label: 'Secure Master Browser Log Store Preparation',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    mainSelect: createSecureMasterAnswerLogListMainSelect(input),
    browserPersistence: {
      prepared: true,
      localStorageKeyVisible: true,
      canSaveInBrowser: true,
      canLoadFromBrowser: true,
      canClearBrowserLogs: true,
      persistedInBrowser: 'prepared_not_auto_enabled',
      persistedOnServer: false,
      serverStoragePrepared: false,
      exportPreparedLater: true,
    },
    safety: {
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      externalSharingAllowed: false,
      networkCallAllowed: false,
      finalDispatchBlocked: true,
    },
    note: 'Phase 135.0 bereitet localStorage fuer die Haupt-Logliste vor. Speicherung bleibt browserseitig optional, Server-Persistenz bleibt false.',
  };
}

export function getSecureMasterAnswerLogBrowserStoreDemo() {
  return createSecureMasterAnswerLogBrowserStore({
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

write('frontend/app/api/cmt/master/secure/main/log/list/browser-store/route.ts', `import { NextResponse } from 'next/server';
import { createSecureMasterAnswerLogBrowserStore, getSecureMasterAnswerLogBrowserStoreDemo } from '../../../../../../../../lib/cmt-master-answer-log-list-browser-store';
import type { PrivacyDecisionOption } from '../../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogBrowserStoreDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.map((item: any) => ({
    input: typeof item?.input === 'string' ? item.input : '',
    option: typeof item?.option === 'string' && options.includes(item.option) ? item.option : 'local_only',
  }));

  return NextResponse.json(createSecureMasterAnswerLogBrowserStore({
    items,
    search: typeof body?.search === 'string' ? body.search : '',
    route: typeof body?.route === 'string' ? body.route : 'all',
    intent: typeof body?.intent === 'string' ? body.intent : 'all',
    privacyDecision: typeof body?.privacyDecision === 'string' ? body.privacyDecision : 'all',
  }));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/browser-store/page.tsx', `'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogBrowserStoreResult } from '../../../../../../../lib/cmt-master-answer-log-list-browser-store';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from '../../../../../../../lib/cmt-master-answer-log-list-browser-store';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
  'Wie ist morgen das Wetter?',
  'Baue mir spaeter einen Trading-Agenten.',
].join('\n');

type StoredPayload = {
  savedAt: string;
  text: string;
  search: string;
  route: string;
  intent: string;
  privacyDecision: string;
};

export default function SecureMasterAnswerLogBrowserStorePage() {
  const [text, setText] = useState(defaults);
  const [search, setSearch] = useState('');
  const [route, setRoute] = useState('all');
  const [intent, setIntent] = useState('all');
  const [privacyDecision, setPrivacyDecision] = useState('all');
  const [result, setResult] = useState<SecureMasterAnswerLogBrowserStoreResult | null>(null);
  const [storedAt, setStoredAt] = useState<string>('nicht geladen');
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  useEffect(() => {
    const raw = window.localStorage.getItem(SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as StoredPayload;
      setText(parsed.text || defaults);
      setSearch(parsed.search || '');
      setRoute(parsed.route || 'all');
      setIntent(parsed.intent || 'all');
      setPrivacyDecision(parsed.privacyDecision || 'all');
      setStoredAt(parsed.savedAt || 'geladen');
    } catch {
      setStoredAt('ungueltiger localStorage-Inhalt');
    }
  }, []);

  async function applyBrowserStore() {
    setLoading(true);
    try {
      const items = text.split('\n').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/browser-store', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items, search, route, intent, privacyDecision }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  function saveLocal() {
    const payload: StoredPayload = {
      savedAt: new Date().toISOString(),
      text,
      search,
      route,
      intent,
      privacyDecision,
    };
    window.localStorage.setItem(SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY, JSON.stringify(payload));
    setStoredAt(payload.savedAt);
  }

  function clearLocal() {
    window.localStorage.removeItem(SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY);
    setStoredAt('geloescht');
  }

  const routeOptions = result?.mainSelect.select.options.routes ?? ['all'];
  const intentOptions = result?.mainSelect.select.options.intents ?? ['all'];
  const privacyOptions = result?.mainSelect.select.options.privacyDecisions ?? ['all'];

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 135.0</h1>
        <h2>Secure Master Browser Log Store Preparation</h2>
        <p><strong>Status:</strong> Browserseitige Speicherung ist vorbereitet. Server-Persistenz bleibt aus.</p>
        <p><strong>Storage Key:</strong> {SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY}</p>
        <p><Link href="/cmt/master/secure/main/log/list">Haupt-Logliste</Link> · <Link href="/cmt/master/secure">Secure Master</Link></p>
      </section>

      <section style={card}>
        <h3>Lokale Log-Eingaben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <h3>Filter</h3>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', maxWidth: 980 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Suche inputPreview" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <select value={route} onChange={(event) => setRoute(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>{routeOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={intent} onChange={(event) => setIntent(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>{intentOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={privacyDecision} onChange={(event) => setPrivacyDecision(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>{privacyOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <button onClick={applyBrowserStore} disabled={loading} style={{ padding: '10px 16px', borderRadius: 10 }}>{loading ? 'wird vorbereitet...' : 'Lokal auswerten'}</button>
          <button onClick={saveLocal} style={{ padding: '10px 16px', borderRadius: 10 }}>In Browser speichern</button>
          <button onClick={clearLocal} style={{ padding: '10px 16px', borderRadius: 10 }}>Browser-Speicher loeschen</button>
        </div>
        <p><strong>localStorage Status:</strong> {storedAt}</p>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Browser Persistence State</h3>
            <ul>
              <li>prepared: {String(result.browserPersistence.prepared)}</li>
              <li>localStorageKeyVisible: {String(result.browserPersistence.localStorageKeyVisible)}</li>
              <li>canSaveInBrowser: {String(result.browserPersistence.canSaveInBrowser)}</li>
              <li>canLoadFromBrowser: {String(result.browserPersistence.canLoadFromBrowser)}</li>
              <li>canClearBrowserLogs: {String(result.browserPersistence.canClearBrowserLogs)}</li>
              <li>persistedInBrowser: {result.browserPersistence.persistedInBrowser}</li>
              <li>persistedOnServer: {String(result.browserPersistence.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(result.safety.externalSharingAllowed)}</li>
            </ul>
          </article>
          <article style={card}>
            <h3>Counts</h3>
            <ul>
              <li>sourceCount: {result.mainSelect.select.filter.sourceCount}</li>
              <li>filteredCount: {result.mainSelect.select.filter.filteredCount}</li>
              <li>routeOptions: {result.mainSelect.select.options.routes.length}</li>
              <li>intentOptions: {result.mainSelect.select.options.intents.length}</li>
              <li>privacyOptions: {result.mainSelect.select.options.privacyDecisions.length}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
`);

write('README_PHASE135_0.md', `# Phase 135.0 - Secure Master Browser Log Store Preparation

Bereitet browserseitige lokale Speicherung fuer die Haupt-Logliste vor.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-browser-store.ts
- API: /api/cmt/master/secure/main/log/list/browser-store
- UI: /cmt/master/secure/main/log/list/browser-store
- Patch: scripts/p135-0.cjs
- Verify: scripts/v135-0.cjs

Wirkung:

- localStorage-Key sichtbar.
- Speichern in Browser vorbereitet.
- Laden aus Browser vorbereitet.
- Loeschen/Reset vorbereitet.
- Server-Persistenz bleibt false.
- Export spaeter vorbereitet.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- lokal testbar
- browserseitige Speicherung vorbereitet
- persistedInBrowser = prepared_not_auto_enabled
- persistedOnServer = false
- canSaveInBrowser = true
- canLoadFromBrowser = true
- canClearBrowserLogs = true
- externalSharingAllowed = false
`);

write('scripts/v135-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'createSecureMasterAnswerLogBrowserStore'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', "phase: '135.0'"],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'canSaveInBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'canLoadFromBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'canClearBrowserLogs: true'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', "persistedInBrowser: 'prepared_not_auto_enabled'"],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/browser-store/route.ts', 'createSecureMasterAnswerLogBrowserStore'],
  ['frontend/app/cmt/master/secure/main/log/list/browser-store/page.tsx', 'In Browser speichern'],
  ['frontend/app/cmt/master/secure/main/log/list/browser-store/page.tsx', 'Browser-Speicher loeschen'],
  ['README_PHASE135_0.md', 'Secure Master Browser Log Store Preparation'],
  ['package.json', 'phase135:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 135.0 Secure Master Browser Log Store Preparation verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase135:0:verify'] = 'node scripts/v135-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 135.0 Secure Master Browser Log Store Preparation patch applied.');
