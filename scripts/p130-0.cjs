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

write('frontend/lib/cmt-master-answer-log-list.ts', `import { createSecureMasterAnswerLog, type SecureMasterAnswerLogEntry } from './cmt-master-answer-log';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogListItem = Pick<SecureMasterAnswerLogEntry,
  'id' | 'createdAt' | 'inputPreview' | 'option' | 'detectedIntent' | 'finalRoute' | 'privacyDecision' | 'badgeSummary' | 'safety'
>;

export type SecureMasterAnswerLogListResult = {
  phaseList: '130.0';
  label: 'Secure Master In-Memory Answer Log List';
  items: SecureMasterAnswerLogListItem[];
  count: number;
  localOnly: true;
  persistedInBrowser: false;
  persistedOnServer: false;
  note: string;
  safety: {
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
};

export function createSecureMasterAnswerLogList(inputs: { input: string; option?: PrivacyDecisionOption }[]): SecureMasterAnswerLogListResult {
  const items = inputs.map((item, index) => {
    const result = createSecureMasterAnswerLog(
      item.input,
      item.option ?? 'local_only',
      new Date(Date.UTC(2026, 6, 24, 12, index, 0))
    );
    const entry = result.entry;
    return {
      id: entry.id,
      createdAt: entry.createdAt,
      inputPreview: entry.inputPreview,
      option: entry.option,
      detectedIntent: entry.detectedIntent,
      finalRoute: entry.finalRoute,
      privacyDecision: entry.privacyDecision,
      badgeSummary: entry.badgeSummary,
      safety: entry.safety,
    };
  });

  return {
    phaseList: '130.0',
    label: 'Secure Master In-Memory Answer Log List',
    items,
    count: items.length,
    localOnly: true,
    persistedInBrowser: false,
    persistedOnServer: false,
    note: 'Phase 130.0 zeigt mehrere lokale Log-Objekte als In-Memory-Liste. Keine dauerhafte Speicherung, kein Provider, kein Internet, kein Live-Modell.',
    safety: {
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
  };
}

export function getSecureMasterAnswerLogListDemo() {
  return createSecureMasterAnswerLogList([
    { input: 'Was kannst du als Secure Master aktuell?', option: 'local_only' },
    { input: 'Soll ich den Secure Master Agent jetzt live schalten?', option: 'local_only' },
    { input: 'Hier sind interne Kundendaten. Was darfst du damit machen?', option: 'local_only' },
    { input: 'Soll ich fuer diese Entscheidung das Gremium fragen?', option: 'local_only' },
  ]);
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/route.ts', `import { NextResponse } from 'next/server';
import { createSecureMasterAnswerLogList, getSecureMasterAnswerLogListDemo } from '../../../../../../../../lib/cmt-master-answer-log-list';
import type { PrivacyDecisionOption } from '../../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.map((item: any) => ({
    input: typeof item?.input === 'string' ? item.input : '',
    option: typeof item?.option === 'string' && options.includes(item.option) ? item.option : 'local_only',
  }));
  return NextResponse.json(createSecureMasterAnswerLogList(items));
}
`);

write('frontend/app/cmt/master/secure/main/log/list/page.tsx', `'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogListResult } from '../../../../../../../lib/cmt-master-answer-log-list';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
].join('\n');

export default function SecureMasterAnswerLogListPage() {
  const [text, setText] = useState(defaults);
  const [list, setList] = useState<SecureMasterAnswerLogListResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function createList() {
    setLoading(true);
    try {
      const items = text.split('\n').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      setList(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 130.0</h1>
        <h2>Secure Master In-Memory Answer Log List</h2>
        <p><strong>Status:</strong> Mehrere lokale Log-Objekte als In-Memory-Liste. Noch keine dauerhafte Speicherung.</p>
        <p><Link href="/cmt/master/secure/main/log">Einzelnes Answer Log</Link></p>
      </section>

      <section style={card}>
        <h3>Prompts zeilenweise eingeben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <br />
        <button onClick={createList} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Logliste wird erzeugt...' : 'In-Memory-Logliste erzeugen'}
        </button>
      </section>

      {list && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>List State</h3>
            <ul>
              <li>count: {list.count}</li>
              <li>localOnly: {String(list.localOnly)}</li>
              <li>persistedInBrowser: {String(list.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(list.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(list.safety.externalSharingAllowed)}</li>
            </ul>
            <p>{list.note}</p>
          </article>

          {list.items.map((item) => (
            <article key={item.id} style={card}>
              <h3>{item.id}</h3>
              <ul>
                <li>createdAt: {item.createdAt}</li>
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

write('README_PHASE130_0.md', `# Phase 130.0 - Secure Master In-Memory Answer Log List

Fuehrt eine lokale In-Memory-Logliste fuer mehrere Secure-Master-Anfragen ein.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list.ts
- API: /api/cmt/master/secure/main/log/list
- UI: /cmt/master/secure/main/log/list
- Patch: scripts/p130-0.cjs
- Verify: scripts/v130-0.cjs

Wirkung:

- Mehrere lokale Answer-Log-Objekte koennen als Liste angezeigt werden.
- Die Liste nutzt das bestehende Einzel-Log aus Phase 129.
- Keine dauerhafte Speicherung.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- lokal testbar
- In-Memory-Logliste sichtbar
- persistedInBrowser = false
- persistedOnServer = false
- externalSharingAllowed = false
`);

write('scripts/v130-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list.ts', 'createSecureMasterAnswerLogList'],
  ['frontend/lib/cmt-master-answer-log-list.ts', 'getSecureMasterAnswerLogListDemo'],
  ['frontend/lib/cmt-master-answer-log-list.ts', "phaseList: '130.0'"],
  ['frontend/lib/cmt-master-answer-log-list.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list.ts', 'persistedOnServer: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/route.ts', 'createSecureMasterAnswerLogList'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'In-Memory-Logliste erzeugen'],
  ['frontend/app/cmt/master/secure/main/log/list/page.tsx', 'List State'],
  ['README_PHASE130_0.md', 'Secure Master In-Memory Answer Log List'],
  ['package.json', 'phase130:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 130.0 Secure Master In-Memory Answer Log List verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase130:0:verify'] = 'node scripts/v130-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 130.0 Secure Master In-Memory Answer Log List patch applied.');
