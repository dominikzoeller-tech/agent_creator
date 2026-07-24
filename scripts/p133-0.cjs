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

write('frontend/lib/cmt-master-answer-log-list-filter-select.ts', `import { filterSecureMasterAnswerLogList, type SecureMasterAnswerLogListFilterResult } from './cmt-master-answer-log-list-filter';
import { deriveSecureMasterAnswerLogListFilterOptions, type SecureMasterAnswerLogListFilterOptionsResult } from './cmt-master-answer-log-list-filter-options';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogListFilterSelectInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogListFilterSelectResult = {
  phaseSelect: '133.0';
  label: 'Secure Master Local Answer Log List Filter Select';
  filter: SecureMasterAnswerLogListFilterResult;
  options: SecureMasterAnswerLogListFilterOptionsResult;
  selectState: {
    routeSelectVisible: true;
    intentSelectVisible: true;
    privacySelectVisible: true;
    searchVisible: true;
    optionsDerivedLocally: true;
    usesInMemoryList: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  note: string;
};

export function createSecureMasterAnswerLogListFilterSelect(input: SecureMasterAnswerLogListFilterSelectInput): SecureMasterAnswerLogListFilterSelectResult {
  const options = deriveSecureMasterAnswerLogListFilterOptions({ items: input.items });
  const filter = filterSecureMasterAnswerLogList(input);

  return {
    phaseSelect: '133.0',
    label: 'Secure Master Local Answer Log List Filter Select',
    filter,
    options,
    selectState: {
      routeSelectVisible: true,
      intentSelectVisible: true,
      privacySelectVisible: true,
      searchVisible: true,
      optionsDerivedLocally: true,
      usesInMemoryList: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    note: 'Phase 133.0 integriert lokal abgeleitete Dropdown-Optionen in eine Filter-Select-Ansicht. Suche bleibt lokal, keine Persistenz, kein Provider, kein Internet, kein Live-Modell.',
  };
}

export function getSecureMasterAnswerLogListFilterSelectDemo() {
  return createSecureMasterAnswerLogListFilterSelect({
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

write('frontend/app/api/cmt/master/secure/main/log/list/filter/select/route.ts', `import { NextResponse } from 'next/server';
import { createSecureMasterAnswerLogListFilterSelect, getSecureMasterAnswerLogListFilterSelectDemo } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter-select';
import type { PrivacyDecisionOption } from '../../../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterSelectDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.map((item: any) => ({
    input: typeof item?.input === 'string' ? item.input : '',
    option: typeof item?.option === 'string' && options.includes(item.option) ? item.option : 'local_only',
  }));

  return NextResponse.json(createSecureMasterAnswerLogListFilterSelect({
    items,
    search: typeof body?.search === 'string' ? body.search : '',
    route: typeof body?.route === 'string' ? body.route : 'all',
    intent: typeof body?.intent === 'string' ? body.intent : 'all',
    privacyDecision: typeof body?.privacyDecision === 'string' ? body.privacyDecision : 'all',
  }));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/filter/select/page.tsx', `'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogListFilterSelectResult } from '../../../../../../../../lib/cmt-master-answer-log-list-filter-select';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
  'Wie ist morgen das Wetter?',
  'Baue mir spaeter einen Trading-Agenten.',
].join('\n');

export default function SecureMasterAnswerLogListFilterSelectPage() {
  const [text, setText] = useState(defaults);
  const [search, setSearch] = useState('');
  const [route, setRoute] = useState('all');
  const [intent, setIntent] = useState('all');
  const [privacyDecision, setPrivacyDecision] = useState('all');
  const [result, setResult] = useState<SecureMasterAnswerLogListFilterSelectResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function applySelectFilter() {
    setLoading(true);
    try {
      const items = text.split('\n').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/filter/select', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items, search, route, intent, privacyDecision }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  const routeOptions = result?.options.routes ?? ['all'];
  const intentOptions = result?.options.intents ?? ['all'];
  const privacyOptions = result?.options.privacyDecisions ?? ['all'];

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 133.0</h1>
        <h2>Secure Master Local Answer Log List Filter Select</h2>
        <p><strong>Status:</strong> Dropdown-Optionen werden lokal abgeleitet und in eine Select-Filteransicht integriert. Noch keine dauerhafte Speicherung.</p>
        <p><Link href="/cmt/master/secure/main/log/list/filter/options">Filter-Optionen öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Prompts zeilenweise eingeben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />

        <h3>Lokale Select-Filter</h3>
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

        <button onClick={applySelectFilter} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Select-Filter wird angewendet...' : 'Dropdown-Filter lokal anwenden'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Select Filter State</h3>
            <ul>
              <li>sourceCount: {result.filter.sourceCount}</li>
              <li>filteredCount: {result.filter.filteredCount}</li>
              <li>routeOptions: {result.options.routes.length}</li>
              <li>intentOptions: {result.options.intents.length}</li>
              <li>privacyOptions: {result.options.privacyDecisions.length}</li>
              <li>routeSelectVisible: {String(result.selectState.routeSelectVisible)}</li>
              <li>intentSelectVisible: {String(result.selectState.intentSelectVisible)}</li>
              <li>privacySelectVisible: {String(result.selectState.privacySelectVisible)}</li>
              <li>persistedInBrowser: {String(result.selectState.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(result.selectState.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(result.selectState.externalSharingAllowed)}</li>
            </ul>
          </article>

          {result.filter.items.map((item) => (
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

write('README_PHASE133_0.md', `# Phase 133.0 - Secure Master Local Answer Log List Filter Select

Integriert lokal abgeleitete Dropdown-Optionen in eine Select-Filteransicht.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-filter-select.ts
- API: /api/cmt/master/secure/main/log/list/filter/select
- UI: /cmt/master/secure/main/log/list/filter/select
- Patch: scripts/p133-0.cjs
- Verify: scripts/v133-0.cjs

Wirkung:

- Route-Filter als Select sichtbar.
- Intent-Filter als Select sichtbar.
- Privacy-Filter als Select sichtbar.
- Options-Ableitung aus Phase 132 wird wiederverwendet.
- Suche ueber inputPreview bleibt erhalten.
- Keine dauerhafte Speicherung.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- lokal testbar
- Select-Filter sichtbar
- Dropdown-Optionen lokal abgeleitet
- persistedInBrowser = false
- persistedOnServer = false
- externalSharingAllowed = false
`);

write('scripts/v133-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'createSecureMasterAnswerLogListFilterSelect'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'deriveSecureMasterAnswerLogListFilterOptions'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', "phaseSelect: '133.0'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'routeSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'intentSelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'privacySelectVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'persistedOnServer: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/select/route.ts', 'createSecureMasterAnswerLogListFilterSelect'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/page.tsx', 'Dropdown-Filter lokal anwenden'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/select/page.tsx', 'Select Filter State'],
  ['README_PHASE133_0.md', 'Secure Master Local Answer Log List Filter Select'],
  ['package.json', 'phase133:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 133.0 Secure Master Local Answer Log List Filter Select verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase133:0:verify'] = 'node scripts/v133-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 133.0 Secure Master Local Answer Log List Filter Select patch applied.');
