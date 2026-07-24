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

write('frontend/lib/cmt-privacy-decision.ts', `import { evaluatePrivacyGate, type PrivacyGateResult } from './cmt-privacy-gate';

export type PrivacyDecisionOption = 'local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel';

export type PrivacyDecisionResult = {
  phase: '121.2';
  label: 'Privacy Gate Decision Flow';
  input: string;
  requestedOption: PrivacyDecisionOption;
  gate: PrivacyGateResult;
  outcome: {
    accepted: boolean;
    mode: 'local_only' | 'anonymized_preview_only' | 'blocked' | 'cancelled';
    message: string;
    nextAction: string;
  };
  safePayloadPreview: string;
  externalSharingAllowed: false;
  liveModelEnabled: false;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function decidePrivacyAction(input: string, option: PrivacyDecisionOption): PrivacyDecisionResult {
  const gate = evaluatePrivacyGate(input);
  let outcome: PrivacyDecisionResult['outcome'];

  if (option === 'cancel') {
    outcome = {
      accepted: true,
      mode: 'cancelled',
      message: 'Vorgang abgebrochen. Keine Verarbeitung und keine Weitergabe.',
      nextAction: 'Eingabe ueberarbeiten oder lokal neu pruefen.',
    };
  } else if (option === 'local_only') {
    outcome = {
      accepted: true,
      mode: 'local_only',
      message: 'Nur lokale Verarbeitung ausgewaehlt. Keine Provider- oder Internet-Weitergabe.',
      nextAction: 'Master-Agent darf lokal antworten oder das lokale Gremium nutzen.',
    };
  } else if (option === 'anonymize_then_send') {
    outcome = {
      accepted: true,
      mode: 'anonymized_preview_only',
      message: 'Anonymisierung vorbereitet. Externe Weitergabe bleibt im aktuellen Modus trotzdem blockiert.',
      nextAction: 'Anonymisierte Vorschau pruefen. Live-Provider erst spaeter nach separater Freigabe aktivieren.',
    };
  } else {
    outcome = {
      accepted: false,
      mode: 'blocked',
      message: 'Direkte externe Freigabe ist in Phase 121.2 noch blockiert.',
      nextAction: 'Stattdessen local_only oder anonymize_then_send waehlen.',
    };
  }

  return {
    phase: '121.2',
    label: 'Privacy Gate Decision Flow',
    input: gate.input,
    requestedOption: option,
    gate,
    outcome,
    safePayloadPreview: option === 'anonymize_then_send' ? gate.anonymizedPreview : gate.input,
    externalSharingAllowed: false,
    liveModelEnabled: false,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getPrivacyDecisionDemo() {
  return decidePrivacyAction('Interne Kalkulation fuer Kunde Muster mit E-Mail test@example.com und Angebot 12345.', 'anonymize_then_send');
}
`);

write('frontend/app/api/cmt/privacy/decision/route.ts', `import { NextResponse } from 'next/server';
import { decidePrivacyAction, getPrivacyDecisionDemo, type PrivacyDecisionOption } from '../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getPrivacyDecisionDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  const requested = typeof body?.option === 'string' && options.includes(body.option)
    ? body.option
    : 'local_only';
  return NextResponse.json(decidePrivacyAction(input, requested));
}
`);

write('frontend/app/cmt/privacy/decision/page.tsx', `'use client';

import { useState } from 'react';
import type { PrivacyDecisionOption, PrivacyDecisionResult } from '../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function PrivacyDecisionPage() {
  const [input, setInput] = useState('Interne Kalkulation fuer Kunde Muster mit E-Mail test@example.com und Angebot 12345.');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [result, setResult] = useState<PrivacyDecisionResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/privacy/decision', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input, option }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 121.2</h1>
        <h2>Privacy Gate Decision Flow</h2>
        <p><strong>Status:</strong> Freigabe-Auswahl lokal testbar. Externe Weitergabe bleibt blockiert.</p>
      </section>

      <section style={card}>
        <h3>Eingabe</h3>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <h3>Option auswählen</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={submit} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Entscheidung prueft...' : 'Entscheidung prüfen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Outcome</h3>
            <p><strong>accepted:</strong> {String(result.outcome.accepted)}</p>
            <p><strong>mode:</strong> {result.outcome.mode}</p>
            <p><strong>message:</strong> {result.outcome.message}</p>
            <p><strong>nextAction:</strong> {result.outcome.nextAction}</p>
          </article>

          <article style={card}>
            <h3>Privacy Gate</h3>
            <p><strong>decision:</strong> {result.gate.decision.decision}</p>
            <p><strong>sensitivity:</strong> {result.gate.detected.sensitivity}</p>
            <p><strong>approval.required:</strong> {String(result.gate.approval.required)}</p>
          </article>

          <article style={card}>
            <h3>Safe Payload Preview</h3>
            <p>{result.safePayloadPreview}</p>
          </article>

          <article style={card}>
            <h3>Safety</h3>
            <ul>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
              <li>providerDispatchAllowed: {String(result.providerDispatchAllowed)}</li>
              <li>networkCallAllowed: {String(result.networkCallAllowed)}</li>
              <li>finalDispatchBlocked: {String(result.finalDispatchBlocked)}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
`);

write('README_PHASE121_2.md', `# Phase 121.2 - Privacy Gate Decision Flow

Baut eine lokale Freigabe-Auswahl fuer das Privacy Gate.

Kurz-Namen:

- Store: frontend/lib/cmt-privacy-decision.ts
- API: /api/cmt/privacy/decision
- UI: /cmt/privacy/decision
- Patch: scripts/p121-2.cjs
- Verify: scripts/v121-2.cjs

Optionen:

- local_only
- anonymize_then_send
- approve_external_send
- cancel

Wichtig:

approve_external_send bleibt blockiert.
externalSharingAllowed bleibt false.
providerDispatchAllowed bleibt false.
networkCallAllowed bleibt false.

Status:

- lokal testbar
- Freigabe-Flow vorbereitet
- keine echte externe Weitergabe
- kein Provider
- kein Internet
- kein Live-Modell
`);

write('scripts/v121-2.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-privacy-decision.ts', 'decidePrivacyAction'],
  ['frontend/lib/cmt-privacy-decision.ts', 'getPrivacyDecisionDemo'],
  ['frontend/lib/cmt-privacy-decision.ts', "phase: '121.2'"],
  ['frontend/lib/cmt-privacy-decision.ts', "label: 'Privacy Gate Decision Flow'"],
  ['frontend/lib/cmt-privacy-decision.ts', "option === 'local_only'"],
  ['frontend/lib/cmt-privacy-decision.ts', "option === 'anonymize_then_send'"],
  ['frontend/lib/cmt-privacy-decision.ts', "Direkte externe Freigabe ist in Phase 121.2 noch blockiert."],
  ['frontend/lib/cmt-privacy-decision.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/privacy/decision/route.ts', 'decidePrivacyAction'],
  ['frontend/app/cmt/privacy/decision/page.tsx', 'Entscheidung prüfen'],
  ['frontend/app/cmt/privacy/decision/page.tsx', 'Safe Payload Preview'],
  ['README_PHASE121_2.md', 'Privacy Gate Decision Flow'],
  ['package.json', 'phase121:2:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 121.2 Privacy Gate Decision Flow verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase121:2:verify'] = 'node scripts/v121-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 121.2 Privacy Gate Decision Flow patch applied.');
