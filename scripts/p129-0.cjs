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

write('frontend/lib/cmt-master-answer-log.ts', `import { askSecureMasterMainView, type SecureMasterMainViewModel } from './cmt-master-main-view-model';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogEntry = {
  id: string;
  phase: '129.0';
  createdAt: string;
  inputPreview: string;
  option: PrivacyDecisionOption;
  detectedIntent: string;
  finalRoute: string;
  privacyDecision: string;
  badgeSummary: string[];
  safety: {
    liveModelEnabled: boolean;
    externalSharingAllowed: boolean;
    networkCallAllowed: boolean;
    providerDispatchAllowed: boolean;
    finalDispatchBlocked: boolean;
  };
  result: SecureMasterMainViewModel;
};

export type SecureMasterAnswerLogResult = {
  phaseLog: '129.0';
  label: 'Secure Master Local Answer Log';
  entry: SecureMasterAnswerLogEntry;
  localOnly: true;
  persistedInBrowser: false;
  persistedOnServer: false;
  note: string;
};

function makeId(input: string, date: Date) {
  const seed = input.trim().slice(0, 32).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'secure-master';
  return 'log-' + date.toISOString().replace(/[^0-9]/g, '').slice(0, 14) + '-' + seed;
}

function badgeSummary(result: SecureMasterMainViewModel) {
  return result.badges.map((badge) => badge.label + '=' + badge.value + ' [' + badge.tone + ']');
}

export function createSecureMasterAnswerLog(input: string, option: PrivacyDecisionOption = 'local_only', now = new Date()): SecureMasterAnswerLogResult {
  const result = askSecureMasterMainView(input, option);
  const entry: SecureMasterAnswerLogEntry = {
    id: makeId(input, now),
    phase: '129.0',
    createdAt: now.toISOString(),
    inputPreview: input.trim().slice(0, 240),
    option,
    detectedIntent: result.detectedIntent,
    finalRoute: result.finalRoute,
    privacyDecision: result.privacy.decision.decision,
    badgeSummary: badgeSummary(result),
    safety: {
      liveModelEnabled: result.liveModelEnabled,
      externalSharingAllowed: result.externalSharingAllowed,
      networkCallAllowed: result.networkCallAllowed,
      providerDispatchAllowed: result.providerDispatchAllowed,
      finalDispatchBlocked: result.finalDispatchBlocked,
    },
    result,
  };

  return {
    phaseLog: '129.0',
    label: 'Secure Master Local Answer Log',
    entry,
    localOnly: true,
    persistedInBrowser: false,
    persistedOnServer: false,
    note: 'Phase 129.0 erzeugt ein lokales Protokollobjekt pro Anfrage. Noch keine dauerhafte Speicherung, kein Provider, kein Internet, kein Live-Modell.',
  };
}

export function getSecureMasterAnswerLogDemo() {
  return createSecureMasterAnswerLog('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?', 'local_only', new Date('2026-07-24T12:00:00.000Z'));
}
`);

write('frontend/app/api/cmt/master/secure/main/log/route.ts', `import { NextResponse } from 'next/server';
import { createSecureMasterAnswerLog, getSecureMasterAnswerLogDemo } from '../../../../../../../lib/cmt-master-answer-log';
import type { PrivacyDecisionOption } from '../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  const option = typeof body?.option === 'string' && options.includes(body.option) ? body.option : 'local_only';
  return NextResponse.json(createSecureMasterAnswerLog(input, option));
}
`);

write('frontend/app/cmt/master/secure/main/log/page.tsx', `'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogResult } from '../../../../../../lib/cmt-master-answer-log';
import type { PrivacyDecisionOption } from '../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function SecureMasterAnswerLogPage() {
  const [input, setInput] = useState('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [log, setLog] = useState<SecureMasterAnswerLogResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function createLog() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure/main/log', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input, option }),
      });
      setLog(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 129.0</h1>
        <h2>Secure Master Local Answer Log</h2>
        <p><strong>Status:</strong> Lokales Protokollobjekt pro Anfrage. Noch keine dauerhafte Speicherung.</p>
        <p><Link href="/cmt/master/secure">Zur Hauptseite</Link></p>
      </section>

      <section style={card}>
        <h3>Log erzeugen</h3>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={5} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <h3>Privacy-Option</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={createLog} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Log wird erzeugt...' : 'Lokales Antwortprotokoll erzeugen'}
        </button>
      </section>

      {log && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Log Entry</h3>
            <ul>
              <li>id: {log.entry.id}</li>
              <li>createdAt: {log.entry.createdAt}</li>
              <li>detectedIntent: {log.entry.detectedIntent}</li>
              <li>finalRoute: {log.entry.finalRoute}</li>
              <li>privacyDecision: {log.entry.privacyDecision}</li>
              <li>option: {log.entry.option}</li>
            </ul>
          </article>

          <article style={card}>
            <h3>Badges</h3>
            <ul>{log.entry.badgeSummary.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Safety</h3>
            <ul>
              <li>liveModelEnabled: {String(log.entry.safety.liveModelEnabled)}</li>
              <li>externalSharingAllowed: {String(log.entry.safety.externalSharingAllowed)}</li>
              <li>networkCallAllowed: {String(log.entry.safety.networkCallAllowed)}</li>
              <li>providerDispatchAllowed: {String(log.entry.safety.providerDispatchAllowed)}</li>
              <li>finalDispatchBlocked: {String(log.entry.safety.finalDispatchBlocked)}</li>
            </ul>
          </article>

          <article style={card}>
            <h3>Persistence</h3>
            <ul>
              <li>localOnly: {String(log.localOnly)}</li>
              <li>persistedInBrowser: {String(log.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(log.persistedOnServer)}</li>
            </ul>
            <p>{log.note}</p>
          </article>
        </section>
      )}
    </main>
  );
}
`);

write('README_PHASE129_0.md', `# Phase 129.0 - Secure Master Local Answer Log

Fuehrt ein lokales Antwortprotokoll fuer den Secure Master ein.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log.ts
- API: /api/cmt/master/secure/main/log
- UI: /cmt/master/secure/main/log
- Patch: scripts/p129-0.cjs
- Verify: scripts/v129-0.cjs

Wirkung:

- Jede Anfrage kann als lokales Log-Objekt erzeugt werden.
- Erfasst Input-Preview, Intent, Route, Privacy-Entscheidung, Badges und Safety State.
- Noch keine dauerhafte Speicherung.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- lokal testbar
- Antwortprotokoll sichtbar
- persistedInBrowser = false
- persistedOnServer = false
- externalSharingAllowed = false
`);

write('scripts/v129-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log.ts', 'createSecureMasterAnswerLog'],
  ['frontend/lib/cmt-master-answer-log.ts', 'getSecureMasterAnswerLogDemo'],
  ['frontend/lib/cmt-master-answer-log.ts', "phaseLog: '129.0'"],
  ['frontend/lib/cmt-master-answer-log.ts', 'badgeSummary'],
  ['frontend/lib/cmt-master-answer-log.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log.ts', 'persistedOnServer: false'],
  ['frontend/app/api/cmt/master/secure/main/log/route.ts', 'createSecureMasterAnswerLog'],
  ['frontend/app/cmt/master/secure/main/log/page.tsx', 'Lokales Antwortprotokoll erzeugen'],
  ['frontend/app/cmt/master/secure/main/log/page.tsx', 'Persistence'],
  ['README_PHASE129_0.md', 'Secure Master Local Answer Log'],
  ['package.json', 'phase129:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 129.0 Secure Master Local Answer Log verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase129:0:verify'] = 'node scripts/v129-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 129.0 Secure Master Local Answer Log patch applied.');
