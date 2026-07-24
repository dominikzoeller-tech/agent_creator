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

write('frontend/lib/cmt-master-answer-log-list-filter.ts', `import { createSecureMasterAnswerLogList, type SecureMasterAnswerLogListItem } from './cmt-master-answer-log-list';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogListFilterInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
  search?: string;
  route?: string;
  intent?: string;
  privacyDecision?: string;
};

export type SecureMasterAnswerLogListFilterResult = {
  phaseFilter: '131.0';
  label: 'Secure Master Local Answer Log List Filter';
  sourceCount: number;
  filteredCount: number;
  items: SecureMasterAnswerLogListItem[];
  filters: {
    search: string;
    route: string;
    intent: string;
    privacyDecision: string;
  };
  localOnly: true;
  persistedInBrowser: false;
  persistedOnServer: false;
  safety: {
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  note: string;
};

function matchText(value: string, filter: string) {
  if (!filter.trim()) return true;
  return value.toLowerCase().includes(filter.trim().toLowerCase());
}

function matchExactOrAll(value: string, filter: string) {
  if (!filter.trim() || filter === 'all') return true;
  return value === filter;
}

export function filterSecureMasterAnswerLogList(input: SecureMasterAnswerLogListFilterInput): SecureMasterAnswerLogListFilterResult {
  const list = createSecureMasterAnswerLogList(input.items);
  const search = input.search ?? '';
  const route = input.route ?? 'all';
  const intent = input.intent ?? 'all';
  const privacyDecision = input.privacyDecision ?? 'all';

  const items = list.items.filter((item) => {
    return matchText(item.inputPreview, search)
      && matchExactOrAll(item.finalRoute, route)
      && matchExactOrAll(item.detectedIntent, intent)
      && matchExactOrAll(item.privacyDecision, privacyDecision);
  });

  return {
    phaseFilter: '131.0',
    label: 'Secure Master Local Answer Log List Filter',
    sourceCount: list.count,
    filteredCount: items.length,
    items,
    filters: { search, route, intent, privacyDecision },
    localOnly: true,
    persistedInBrowser: false,
    persistedOnServer: false,
    safety: {
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    note: 'Phase 131.0 filtert die lokale In-Memory-Logliste nach Suche, Route, Intent und Privacy-Entscheidung. Keine dauerhafte Speicherung, kein Provider, kein Internet, kein Live-Modell.',
  };
}

export function getSecureMasterAnswerLogListFilterDemo() {
  return filterSecureMasterAnswerLogList({
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

write('frontend/app/api/cmt/master/secure/main/log/list/filter/route.ts', `import { NextResponse } from 'next/server';
import { filterSecureMasterAnswerLogList, getSecureMasterAnswerLogListFilterDemo } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter';
import type { PrivacyDecisionOption } from '../../../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.map((item: any) => ({
    input: typeof item?.input === 'string' ? item.input : '',
    option: typeof item?.option === 'string' && options.includes(item.option) ? item.option : 'local_only',
  }));
  return NextResponse.json(filterSecureMasterAnswerLogList({
    items,
    search: typeof body?.search === 'string' ? body.search : '',
    route: typeof body?.route === 'string' ? body.route : 'all',
    intent: typeof body?.intent === 'string' ? body.intent : 'all',
    privacyDecision: typeof body?.privacyDecision === 'string' ? body.privacyDecision : 'all',
  }));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/filter/page.tsx', `'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogListFilterResult } from '../../../../../../../../lib/cmt-master-answer-log-list-filter';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
  'Wie ist morgen das Wetter?',
  'Baue mir spaeter einen Trading-Agenten.',
].join('\n');

export default function SecureMasterAnswerLogListFilterPage() {
  const [text, setText] = useState(defaults);
  const [search, setSearch] = useState('');
  const [route, setRoute] = useState('all');
  const [intent, setIntent] = useState('all');
  const [privacyDecision, setPrivacyDecision] = useState('all');
  const [result, setResult] = useState<SecureMasterAnswerLogListFilterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function filterList() {
    setLoading(true);
    try {
      const items = text.split('\n').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/filter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items, search, route, intent, privacyDecision }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 131.0</h1>
        <h2>Secure Master Local Answer Log List Filter</h2>
        <p><strong>Status:</strong> Lokale Suche und Filter fuer die In-Memory-Logliste. Noch keine dauerhafte Speicherung.</p>
        <p><Link href="/cmt/master/secure/main/log/list">Zur Logliste</Link></p>
      </section>

      <section style={card}>
        <h3>Prompts zeilenweise eingeben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />

        <h3>Filter</h3>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', maxWidth: 980 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Suche inputPreview" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <input value={route} onChange={(event) => setRoute(event.target.value)} placeholder="Route oder all" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <input value={intent} onChange={(event) => setIntent(event.target.value)} placeholder="Intent oder all" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <input value={privacyDecision} onChange={(event) => setPrivacyDecision(event.target.value)} placeholder="Privacy oder all" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
        </div>

        <button onClick={filterList} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Filter wird angewendet...' : 'Logliste lokal filtern'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Filter State</h3>
            <ul>
              <li>sourceCount: {result.sourceCount}</li>
              <li>filteredCount: {result.filteredCount}</li>
              <li>search: {result.filters.search || '(leer)'}</li>
              <li>route: {result.filters.route}</li>
              <li>intent: {result.filters.intent}</li>
              <li>privacyDecision: {result.filters.privacyDecision}</li>
              <li>persistedInBrowser: {String(result.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(result.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(result.safety.externalSharingAllowed)}</li>
            </ul>
          </article>

          {result.items.map((item) => (
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

write('README_PHASE131_0.md', `# Phase 131.0 - Secure Master Local Answer Log List Filter

Fuehrt lokale Suche und Filter fuer die In-Memory-Logliste ein.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-filter.ts
- API: /api/cmt/master/secure/main/log/list/filter
- UI: /cmt/master/secure/main/log/list/filter
- Patch: scripts/p131-0.cjs
- Verify: scripts/v131-0.cjs

Wirkung:

- Logliste kann lokal nach inputPreview gesucht werden.
- Logliste kann nach Route, Intent und Privacy-Entscheidung gefiltert werden.
- Keine dauerhafte Speicherung.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- lokal testbar
- lokale Suche sichtbar
- lokale Filter sichtbar
- persistedInBrowser = false
- persistedOnServer = false
- externalSharingAllowed = false
`);

write('scripts/v131-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', 'filterSecureMasterAnswerLogList'],
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', 'getSecureMasterAnswerLogListFilterDemo'],
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', "phaseFilter: '131.0'"],
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', 'persistedOnServer: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/route.ts', 'filterSecureMasterAnswerLogList'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/page.tsx', 'Logliste lokal filtern'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/page.tsx', 'Filter State'],
  ['README_PHASE131_0.md', 'Secure Master Local Answer Log List Filter'],
  ['package.json', 'phase131:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 131.0 Secure Master Local Answer Log List Filter verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase131:0:verify'] = 'node scripts/v131-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 131.0 Secure Master Local Answer Log List Filter patch applied.');
