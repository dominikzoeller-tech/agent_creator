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

write('frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', `import { createSecureMasterAnswerLogBrowserStore, SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY, type SecureMasterAnswerLogBrowserStoreResult } from './cmt-master-answer-log-list-browser-store';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogMainBrowserStoreInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogMainBrowserStoreResult = {
  phase: '136.0';
  label: 'Secure Master Main Log List Browser Store Integration';
  browserStore: SecureMasterAnswerLogBrowserStoreResult;
  mainLogListPage: '/cmt/master/secure/main/log/list';
  browserStoreControlPage: '/cmt/master/secure/main/log/list/browser-store';
  browserStoreStatusPage: '/cmt/master/secure/main/log/list/browser-store/status';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  integration: {
    mainLogListBrowserStoreIntegrated: true;
    saveButtonVisible: true;
    loadOnRefreshPrepared: true;
    resetButtonVisible: true;
    localStorageKeyVisible: true;
    controlPagesPreserved: true;
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
  note: string;
};

export function createSecureMasterAnswerLogMainBrowserStore(input: SecureMasterAnswerLogMainBrowserStoreInput): SecureMasterAnswerLogMainBrowserStoreResult {
  return {
    phase: '136.0',
    label: 'Secure Master Main Log List Browser Store Integration',
    browserStore: createSecureMasterAnswerLogBrowserStore(input),
    mainLogListPage: '/cmt/master/secure/main/log/list',
    browserStoreControlPage: '/cmt/master/secure/main/log/list/browser-store',
    browserStoreStatusPage: '/cmt/master/secure/main/log/list/browser-store/status',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    integration: {
      mainLogListBrowserStoreIntegrated: true,
      saveButtonVisible: true,
      loadOnRefreshPrepared: true,
      resetButtonVisible: true,
      localStorageKeyVisible: true,
      controlPagesPreserved: true,
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
    note: 'Phase 136.0 integriert Speichern, Laden und Reset direkt in die Haupt-Logliste. Speicherung bleibt browserseitig optional und lokal.',
  };
}

export function getSecureMasterAnswerLogMainBrowserStoreDemo() {
  return createSecureMasterAnswerLogMainBrowserStore({
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

write('frontend/app/api/cmt/master/secure/main/log/list/main-browser-store/route.ts', `import { NextResponse } from 'next/server';
import { createSecureMasterAnswerLogMainBrowserStore, getSecureMasterAnswerLogMainBrowserStoreDemo } from '../../../../../../../../lib/cmt-master-answer-log-list-main-browser-store';
import type { PrivacyDecisionOption } from '../../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogMainBrowserStoreDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.map((item: any) => ({
    input: typeof item?.input === 'string' ? item.input : '',
    option: typeof item?.option === 'string' && options.includes(item.option) ? item.option : 'local_only',
  }));

  return NextResponse.json(createSecureMasterAnswerLogMainBrowserStore({
    items,
    search: typeof body?.search === 'string' ? body.search : '',
    route: typeof body?.route === 'string' ? body.route : 'all',
    intent: typeof body?.intent === 'string' ? body.intent : 'all',
    privacyDecision: typeof body?.privacyDecision === 'string' ? body.privacyDecision : 'all',
  }));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/page.tsx', `'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogMainBrowserStoreResult } from '../../../../../../../lib/cmt-master-answer-log-list-main-browser-store';
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

export default function SecureMasterAnswerLogListPage() {
  const [text, setText] = useState(defaults);
  const [search, setSearch] = useState('');
  const [route, setRoute] = useState('all');
  const [intent, setIntent] = useState('all');
  const [privacyDecision, setPrivacyDecision] = useState('all');
  const [result, setResult] = useState<SecureMasterAnswerLogMainBrowserStoreResult | null>(null);
  const [storedAt, setStoredAt] = useState('nicht geladen');
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

  async function applyMainBrowserStore() {
    setLoading(true);
    try {
      const items = text.split('\n').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/main-browser-store', {
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

  function resetLocal() {
    window.localStorage.removeItem(SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY);
    setText(defaults);
    setSearch('');
    setRoute('all');
    setIntent('all');
    setPrivacyDecision('all');
    setStoredAt('geloescht');
  }

  const routeOptions = result?.browserStore.mainSelect.select.options.routes ?? ['all'];
  const intentOptions = result?.browserStore.mainSelect.select.options.intents ?? ['all'];
  const privacyOptions = result?.browserStore.mainSelect.select.options.privacyDecisions ?? ['all'];

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Secure Master Answer Log List</h1>
        <h2>Phase 136.0: Haupt-Logliste mit Browser-Speicher</h2>
        <p><strong>Status:</strong> Speichern, Laden und Reset sind direkt in die Haupt-Logliste integriert. Server-Persistenz bleibt aus.</p>
        <p><strong>Storage Key:</strong> {SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY}</p>
        <p>
          <Link href="/cmt/master/secure/main/log/list/browser-store">Browser-Store-Kontrollseite</Link> ·{' '}
          <Link href="/cmt/master/secure/main/log/list/browser-store/status">Browser-Store-Status</Link> ·{' '}
          <Link href="/cmt/master/secure">Secure Master</Link>
        </p>
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
          <button onClick={applyMainBrowserStore} disabled={loading} style={{ padding: '10px 16px', borderRadius: 10 }}>{loading ? 'Logliste wird gefiltert...' : 'Haupt-Logliste lokal filtern'}</button>
          <button onClick={saveLocal} style={{ padding: '10px 16px', borderRadius: 10 }}>In Browser speichern</button>
          <button onClick={resetLocal} style={{ padding: '10px 16px', borderRadius: 10 }}>Browser-Speicher resetten</button>
        </div>
        <p><strong>localStorage Status:</strong> {storedAt}</p>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Haupt-Loglistenstatus</h3>
            <ul>
              <li>sourceCount: {result.browserStore.mainSelect.select.filter.sourceCount}</li>
              <li>filteredCount: {result.browserStore.mainSelect.select.filter.filteredCount}</li>
              <li>mainLogListBrowserStoreIntegrated: {String(result.integration.mainLogListBrowserStoreIntegrated)}</li>
              <li>saveButtonVisible: {String(result.integration.saveButtonVisible)}</li>
              <li>loadOnRefreshPrepared: {String(result.integration.loadOnRefreshPrepared)}</li>
              <li>resetButtonVisible: {String(result.integration.resetButtonVisible)}</li>
              <li>persistedInBrowser: {result.integration.persistedInBrowser}</li>
              <li>persistedOnServer: {String(result.integration.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(result.safety.externalSharingAllowed)}</li>
            </ul>
          </article>

          {result.browserStore.mainSelect.select.filter.items.map((item) => (
            <article key={item.id} style={card}>
              <h3>{item.id}</h3>
              <ul>
                <li>inputPreview: {item.inputPreview}</li>
                <li>intent: {item.detectedIntent}</li>
                <li>route: {item.finalRoute}</li>
                <li>privacyDecision: {item.privacyDecision}</li>
                <li>badges: {item.badgeSummary.length}</li>
                <li>finalDispatchBlocked: {String(item.safety.finalDispatchBlocked)}</li>
              </ul>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
`);

write('README_PHASE136_0.md', `# Phase 136.0 - Secure Master Main Log List Browser Store Integration

Integriert browserseitige Speicherung direkt in die Haupt-Logliste.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-main-browser-store.ts
- API: /api/cmt/master/secure/main/log/list/main-browser-store
- UI: /cmt/master/secure/main/log/list
- Patch: scripts/p136-0.cjs
- Verify: scripts/v136-0.cjs

Wirkung:

- /cmt/master/secure/main/log/list bekommt Speichern/Laden/Reset.
- Browser-Store-Kontrollseiten bleiben erhalten.
- localStorage-Key sichtbar.
- persistedInBrowser = browser_optional_local.
- persistedOnServer = false.
- serverStoragePrepared = false.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- lokal testbar
- mainLogListBrowserStoreIntegrated = true
- saveButtonVisible = true
- loadOnRefreshPrepared = true
- resetButtonVisible = true
- controlPagesPreserved = true
- externalSharingAllowed = false
`);

write('scripts/v136-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', 'createSecureMasterAnswerLogMainBrowserStore'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', "phase: '136.0'"],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', 'mainLogListBrowserStoreIntegrated: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', 'saveButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', 'loadOnRefreshPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', 'resetButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', "persistedInBrowser: 'browser_optional_local'"],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', 'serverStoragePrepared: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/main-browser-store/route.ts', 'createSecureMasterAnswerLogMainBrowserStore'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'In Browser speichern'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'Browser-Speicher resetten'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'mainLogListBrowserStoreIntegrated'],
  ['README_PHASE136_0.md', 'Secure Master Main Log List Browser Store Integration'],
  ['package.json', 'phase136:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 136.0 Secure Master Main Log List Browser Store Integration verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase136:0:verify'] = 'node scripts/v136-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 136.0 Secure Master Main Log List Browser Store Integration patch applied.');
