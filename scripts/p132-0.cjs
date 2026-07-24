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

write('frontend/lib/cmt-master-answer-log-list-filter-options.ts', `import { createSecureMasterAnswerLogList, type SecureMasterAnswerLogListItem } from './cmt-master-answer-log-list';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogListFilterOptionsInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
};

export type SecureMasterAnswerLogListFilterOptionsResult = {
  phaseOptions: '132.0';
  label: 'Secure Master Local Answer Log List Filter Options';
  sourceCount: number;
  routes: string[];
  intents: string[];
  privacyDecisions: string[];
  items: SecureMasterAnswerLogListItem[];
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

function uniqueSorted(values: string[]) {
  return ['all', ...Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))];
}

export function deriveSecureMasterAnswerLogListFilterOptions(input: SecureMasterAnswerLogListFilterOptionsInput): SecureMasterAnswerLogListFilterOptionsResult {
  const list = createSecureMasterAnswerLogList(input.items);

  return {
    phaseOptions: '132.0',
    label: 'Secure Master Local Answer Log List Filter Options',
    sourceCount: list.count,
    routes: uniqueSorted(list.items.map((item) => item.finalRoute)),
    intents: uniqueSorted(list.items.map((item) => item.detectedIntent)),
    privacyDecisions: uniqueSorted(list.items.map((item) => item.privacyDecision)),
    items: list.items,
    localOnly: true,
    persistedInBrowser: false,
    persistedOnServer: false,
    safety: {
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    note: 'Phase 132.0 leitet lokale Dropdown-Optionen aus der In-Memory-Logliste ab. Keine dauerhafte Speicherung, kein Provider, kein Internet, kein Live-Modell.',
  };
}

export function getSecureMasterAnswerLogListFilterOptionsDemo() {
  return deriveSecureMasterAnswerLogListFilterOptions({
    items: [
      { input: 'Was kannst du als Secure Master aktuell?', option: 'local_only' },
      { input: 'Soll ich den Secure Master Agent jetzt live schalten?', option: 'local_only' },
      { input: 'Hier sind interne Kundendaten. Was darfst du damit machen?', option: 'local_only' },
      { input: 'Soll ich fuer diese Entscheidung das Gremium fragen?', option: 'local_only' },
      { input: 'Wie ist morgen das Wetter?', option: 'local_only' },
      { input: 'Baue mir spaeter einen Trading-Agenten.', option: 'local_only' },
    ],
  });
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/filter/options/route.ts', `import { NextResponse } from 'next/server';
import { deriveSecureMasterAnswerLogListFilterOptions, getSecureMasterAnswerLogListFilterOptionsDemo } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-options';
import type { PrivacyDecisionOption } from '../../../../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterOptionsDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.map((item: any) => ({
    input: typeof item?.input === 'string' ? item.input : '',
    option: typeof item?.option === 'string' && options.includes(item.option) ? item.option : 'local_only',
  }));
  return NextResponse.json(deriveSecureMasterAnswerLogListFilterOptions({ items }));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/filter/options/page.tsx', `'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogListFilterOptionsResult } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter-options';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
  'Wie ist morgen das Wetter?',
  'Baue mir spaeter einen Trading-Agenten.',
].join('\n');

export default function SecureMasterAnswerLogListFilterOptionsPage() {
  const [text, setText] = useState(defaults);
  const [result, setResult] = useState<SecureMasterAnswerLogListFilterOptionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function deriveOptions() {
    setLoading(true);
    try {
      const items = text.split('\n').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/filter/options', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 132.0</h1>
        <h2>Secure Master Local Answer Log List Filter Options</h2>
        <p><strong>Status:</strong> Lokale Dropdown-Optionen werden aus der In-Memory-Logliste abgeleitet. Noch keine dauerhafte Speicherung.</p>
        <p><Link href="/cmt/master/secure/main/log/list/filter">Zur Filteransicht</Link></p>
      </section>

      <section style={card}>
        <h3>Prompts zeilenweise eingeben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <br />
        <button onClick={deriveOptions} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Optionen werden abgeleitet...' : 'Dropdown-Optionen lokal ableiten'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Options State</h3>
            <ul>
              <li>sourceCount: {result.sourceCount}</li>
              <li>routes: {result.routes.length}</li>
              <li>intents: {result.intents.length}</li>
              <li>privacyDecisions: {result.privacyDecisions.length}</li>
              <li>persistedInBrowser: {String(result.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(result.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(result.safety.externalSharingAllowed)}</li>
            </ul>
            <p>{result.note}</p>
          </article>

          <article style={card}>
            <h3>Route Dropdown Options</h3>
            <ul>{result.routes.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Intent Dropdown Options</h3>
            <ul>{result.intents.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Privacy Dropdown Options</h3>
            <ul>{result.privacyDecisions.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </section>
      )}
    </main>
  );
}
`);

write('README_PHASE132_0.md', `# Phase 132.0 - Secure Master Local Answer Log List Filter Options

Leitet lokale Dropdown-Optionen aus der In-Memory-Logliste ab.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-filter-options.ts
- API: /api/cmt/master/secure/main/log/list/filter/options
- UI: /cmt/master/secure/main/log/list/filter/options
- Patch: scripts/p132-0.cjs
- Verify: scripts/v132-0.cjs

Wirkung:

- verfügbare Routes werden aus Logs abgeleitet.
- verfügbare Intents werden aus Logs abgeleitet.
- verfügbare Privacy-Entscheidungen werden aus Logs abgeleitet.
- Dropdown-Option all wird immer vorangestellt.
- Keine dauerhafte Speicherung.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- lokal testbar
- Dropdown-Optionen sichtbar
- sourceCount sichtbar
- persistedInBrowser = false
- persistedOnServer = false
- externalSharingAllowed = false
`);

write('scripts/v132-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'deriveSecureMasterAnswerLogListFilterOptions'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'getSecureMasterAnswerLogListFilterOptionsDemo'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', "phaseOptions: '132.0'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'routes: uniqueSorted'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'intents: uniqueSorted'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'privacyDecisions: uniqueSorted'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'persistedOnServer: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/options/route.ts', 'deriveSecureMasterAnswerLogListFilterOptions'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/options/page.tsx', 'Dropdown-Optionen lokal ableiten'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/options/page.tsx', 'Options State'],
  ['README_PHASE132_0.md', 'Secure Master Local Answer Log List Filter Options'],
  ['package.json', 'phase132:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 132.0 Secure Master Local Answer Log List Filter Options verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase132:0:verify'] = 'node scripts/v132-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 132.0 Secure Master Local Answer Log List Filter Options patch applied.');
