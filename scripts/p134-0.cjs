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

write('frontend/lib/cmt-master-answer-log-list-main-select.ts', `import { createSecureMasterAnswerLogListFilterSelect, type SecureMasterAnswerLogListFilterSelectResult } from './cmt-master-answer-log-list-filter-select';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogListMainSelectInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogListMainSelectResult = {
  phase: '134.0';
  label: 'Secure Master Main Log List Select Integration';
  select: SecureMasterAnswerLogListFilterSelectResult;
  mainLogListPage: '/cmt/master/secure/main/log/list';
  selectControlPage: '/cmt/master/secure/main/log/list/filter/select';
  optionsControlPage: '/cmt/master/secure/main/log/list/filter/options';
  status: {
    mainLogListSelectIntegrated: true;
    searchVisible: true;
    routeSelectVisible: true;
    intentSelectVisible: true;
    privacySelectVisible: true;
    sourceCountVisible: true;
    filteredCountVisible: true;
    controlPagesPreserved: true;
    usesInMemoryList: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  note: string;
};

export function createSecureMasterAnswerLogListMainSelect(input: SecureMasterAnswerLogListMainSelectInput): SecureMasterAnswerLogListMainSelectResult {
  const select = createSecureMasterAnswerLogListFilterSelect(input);
  return {
    phase: '134.0',
    label: 'Secure Master Main Log List Select Integration',
    select,
    mainLogListPage: '/cmt/master/secure/main/log/list',
    selectControlPage: '/cmt/master/secure/main/log/list/filter/select',
    optionsControlPage: '/cmt/master/secure/main/log/list/filter/options',
    status: {
      mainLogListSelectIntegrated: true,
      searchVisible: true,
      routeSelectVisible: true,
      intentSelectVisible: true,
      privacySelectVisible: true,
      sourceCountVisible: true,
      filteredCountVisible: true,
      controlPagesPreserved: true,
      usesInMemoryList: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    note: 'Phase 134.0 integriert die Select-Filterbedienung direkt in die Haupt-Loglistenansicht. Alles bleibt lokal und in-memory.',
  };
}

export function getSecureMasterAnswerLogListMainSelectDemo() {
  return createSecureMasterAnswerLogListMainSelect({
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

write('frontend/app/api/cmt/master/secure/main/log/list/select/route.ts', `import { NextResponse } from 'next/server';
import { createSecureMasterAnswerLogListMainSelect, getSecureMasterAnswerLogListMainSelectDemo } from '../../../../../../../../lib/cmt-master-answer-log-list-main-select';
import type { PrivacyDecisionOption } from '../../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListMainSelectDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.map((item: any) => ({
    input: typeof item?.input === 'string' ? item.input : '',
    option: typeof item?.option === 'string' && options.includes(item.option) ? item.option : 'local_only',
  }));

  return NextResponse.json(createSecureMasterAnswerLogListMainSelect({
    items,
    search: typeof body?.search === 'string' ? body.search : '',
    route: typeof body?.route === 'string' ? body.route : 'all',
    intent: typeof body?.intent === 'string' ? body.intent : 'all',
    privacyDecision: typeof body?.privacyDecision === 'string' ? body.privacyDecision : 'all',
  }));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/page.tsx', `'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogListMainSelectResult } from '../../../../../../../lib/cmt-master-answer-log-list-main-select';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
  'Wie ist morgen das Wetter?',
  'Baue mir spaeter einen Trading-Agenten.',
].join('\n');

export default function SecureMasterAnswerLogListPage() {
  const [text, setText] = useState(defaults);
  const [search, setSearch] = useState('');
  const [route, setRoute] = useState('all');
  const [intent, setIntent] = useState('all');
  const [privacyDecision, setPrivacyDecision] = useState('all');
  const [result, setResult] = useState<SecureMasterAnswerLogListMainSelectResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function applyMainSelect() {
    setLoading(true);
    try {
      const items = text.split('\n').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/select', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items, search, route, intent, privacyDecision }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  const routeOptions = result?.select.options.routes ?? ['all'];
  const intentOptions = result?.select.options.intents ?? ['all'];
  const privacyOptions = result?.select.options.privacyDecisions ?? ['all'];

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Secure Master Answer Log List</h1>
        <h2>Phase 134.0: Haupt-Logliste mit Select-Filtern</h2>
        <p><strong>Status:</strong> Die Haupt-Loglistenansicht nutzt jetzt die bessere lokale Select-Filterbedienung. Noch keine Persistenz, kein Provider, kein Internet.</p>
        <p>
          <Link href="/cmt/master/secure/main/log/list/filter/select">Select-Kontrollseite</Link> ·{' '}
          <Link href="/cmt/master/secure/main/log/list/filter/options">Options-Kontrollseite</Link> ·{' '}
          <Link href="/cmt/master/secure">Secure Master</Link>
        </p>
      </section>

      <section style={card}>
        <h3>Lokale Log-Eingaben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />

        <h3>Filter</h3>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', maxWidth: 980 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Suche inputPreview" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <select value={route} onChange={(event) => setRoute(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>
            {routeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={intent} onChange={(event) => setIntent(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>
            {intentOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={privacyDecision} onChange={(event) => setPrivacyDecision(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>
            {privacyOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <button onClick={applyMainSelect} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Logliste wird gefiltert...' : 'Haupt-Logliste lokal filtern'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Haupt-Loglistenstatus</h3>
            <ul>
              <li>sourceCount: {result.select.filter.sourceCount}</li>
              <li>filteredCount: {result.select.filter.filteredCount}</li>
              <li>routeOptions: {result.select.options.routes.length}</li>
              <li>intentOptions: {result.select.options.intents.length}</li>
              <li>privacyOptions: {result.select.options.privacyDecisions.length}</li>
              <li>mainLogListSelectIntegrated: {String(result.status.mainLogListSelectIntegrated)}</li>
              <li>controlPagesPreserved: {String(result.status.controlPagesPreserved)}</li>
              <li>persistedInBrowser: {String(result.status.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(result.status.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(result.status.externalSharingAllowed)}</li>
            </ul>
          </article>

          {result.select.filter.items.map((item) => (
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

write('README_PHASE134_0.md', `# Phase 134.0 - Secure Master Main Log List Select Integration

Integriert die lokale Select-Filterbedienung direkt in die Haupt-Loglistenansicht.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-main-select.ts
- API: /api/cmt/master/secure/main/log/list/select
- UI: /cmt/master/secure/main/log/list
- Patch: scripts/p134-0.cjs
- Verify: scripts/v134-0.cjs

Wirkung:

- /cmt/master/secure/main/log/list nutzt jetzt Select-Filter.
- Suche ueber inputPreview bleibt sichtbar.
- Route-Select sichtbar.
- Intent-Select sichtbar.
- Privacy-Select sichtbar.
- Kontrollseiten bleiben erhalten.
- Keine dauerhafte Speicherung.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- lokal testbar
- Haupt-Logliste verbessert
- mainLogListSelectIntegrated = true
- controlPagesPreserved = true
- persistedInBrowser = false
- persistedOnServer = false
- externalSharingAllowed = false
`);

write('scripts/v134-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'createSecureMasterAnswerLogListMainSelect'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', "phase: '134.0'"],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'mainLogListSelectIntegrated: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'controlPagesPreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/select/route.ts', 'createSecureMasterAnswerLogListMainSelect'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'Haupt-Logliste lokal filtern'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'mainLogListSelectIntegrated'],
  ['README_PHASE134_0.md', 'Secure Master Main Log List Select Integration'],
  ['package.json', 'phase134:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 134.0 Secure Master Main Log List Select Integration verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase134:0:verify'] = 'node scripts/v134-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 134.0 Secure Master Main Log List Select Integration patch applied.');
