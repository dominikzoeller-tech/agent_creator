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

write('frontend/lib/cmt-privacy-gate.ts', `import { askMasterAgentLocal, type MasterAgentResult } from './cmt-master';

export type PrivacyGateDecision = {
  decision: 'allow_local_only' | 'require_anonymization' | 'require_user_approval' | 'block_external';
  reason: string;
  recommendedAction: string;
};

export type PrivacyGateResult = {
  phase: '121.0';
  label: 'Privacy Gate MVP';
  input: string;
  master: MasterAgentResult;
  detected: {
    sensitivity: 'public' | 'internal' | 'confidential';
    containsInternalSignals: boolean;
    containsPersonalSignals: boolean;
    containsBusinessSignals: boolean;
    containsSecretSignals: boolean;
  };
  decision: PrivacyGateDecision;
  anonymizedPreview: string;
  approval: {
    required: boolean;
    allowedOptions: ('local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel')[];
    selectedOption: 'local_only';
  };
  externalSharingAllowed: false;
  liveModelEnabled: false;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function hasAny(text: string, words: string[]) {
  const q = text.toLowerCase();
  return words.some((word) => q.includes(word));
}

function redact(text: string) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]')
    .replace(/\b\+?[0-9][0-9\s().-]{6,}\b/g, '[PHONE_OR_NUMBER]')
    .replace(/\b(Kunde|Firma|Projekt|Angebot|Kalkulation)\s+[^,.\n]+/gi, '$1 [REDACTED]');
}

export function evaluatePrivacyGate(input: string): PrivacyGateResult {
  const normalized = input.trim() || 'Welche Daten sollen geprueft werden?';
  const master = askMasterAgentLocal(normalized);
  const containsInternalSignals = hasAny(normalized, ['intern', 'betriebsintern', 'kunde', 'projekt', 'firma']);
  const containsPersonalSignals = hasAny(normalized, ['email', '@', 'telefon', 'adresse', 'mitarbeiter', 'person']);
  const containsBusinessSignals = hasAny(normalized, ['angebot', 'kalkulation', 'preis', 'marge', 'umsatz', 'kosten']);
  const containsSecretSignals = hasAny(normalized, ['geheim', 'vertraulich', 'passwort', 'token', 'api key', 'apikey', 'secret']);
  const sensitivity = containsSecretSignals || master.privacy.sensitivity === 'confidential'
    ? 'confidential'
    : containsInternalSignals || containsPersonalSignals || containsBusinessSignals || master.privacy.sensitivity === 'internal'
      ? 'internal'
      : 'public';

  let decision: PrivacyGateDecision;
  if (sensitivity === 'confidential' || containsSecretSignals) {
    decision = {
      decision: 'block_external',
      reason: 'Vertrauliche oder geheime Inhalte erkannt. Externe Weitergabe bleibt blockiert.',
      recommendedAction: 'Lokal verarbeiten oder sensible Stellen entfernen. Keine Provider-/Internet-Weitergabe.',
    };
  } else if (sensitivity === 'internal' || containsPersonalSignals || containsBusinessSignals) {
    decision = {
      decision: 'require_anonymization',
      reason: 'Interne, personenbezogene oder geschaeftliche Signale erkannt.',
      recommendedAction: 'Vor externer Verarbeitung anonymisieren und danach explizite Freigabe einholen.',
    };
  } else {
    decision = {
      decision: 'allow_local_only',
      reason: 'Keine klar sensiblen Signale erkannt. Im aktuellen Modus dennoch nur lokale Verarbeitung.',
      recommendedAction: 'Lokal beantworten. Provider bleibt bis zur Live-Freigabe deaktiviert.',
    };
  }

  return {
    phase: '121.0',
    label: 'Privacy Gate MVP',
    input: normalized,
    master,
    detected: {
      sensitivity,
      containsInternalSignals,
      containsPersonalSignals,
      containsBusinessSignals,
      containsSecretSignals,
    },
    decision,
    anonymizedPreview: redact(normalized),
    approval: {
      required: decision.decision !== 'allow_local_only',
      allowedOptions: ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'],
      selectedOption: 'local_only',
    },
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

export function getPrivacyGateDemo() {
  return evaluatePrivacyGate('Hier ist eine interne Kalkulation fuer Kunde Muster mit Angebot 12345. Darf der Agent das pruefen?');
}
`);

write('frontend/app/api/cmt/privacy/route.ts', `import { NextResponse } from 'next/server';
import { evaluatePrivacyGate, getPrivacyGateDemo } from '../../../../lib/cmt-privacy-gate';

export async function GET() {
  return NextResponse.json(getPrivacyGateDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  return NextResponse.json(evaluatePrivacyGate(input));
}
`);

write('frontend/app/cmt/privacy/page.tsx', `'use client';

import { useState } from 'react';
import type { PrivacyGateResult } from '../../lib/cmt-privacy-gate';

export default function PrivacyGatePage() {
  const [input, setInput] = useState('Hier ist eine interne Kalkulation fuer Kunde Muster mit Angebot 12345. Darf der Agent das pruefen?');
  const [result, setResult] = useState<PrivacyGateResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/privacy', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await response.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 121.0</h1>
        <h2>Privacy Gate MVP</h2>
        <p><strong>Status:</strong> Datenschutz-Gate lokal testbar. Keine externe Weitergabe.</p>
      </section>

      <section style={card}>
        <h3>Daten / Frage prüfen</h3>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={check} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Privacy Gate prueft...' : 'Privacy Gate prüfen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Entscheidung</h3>
            <p><strong>decision:</strong> {result.decision.decision}</p>
            <p><strong>reason:</strong> {result.decision.reason}</p>
            <p><strong>recommendedAction:</strong> {result.decision.recommendedAction}</p>
          </article>

          <article style={card}>
            <h3>Erkennung</h3>
            <ul>
              <li>sensitivity: {result.detected.sensitivity}</li>
              <li>containsInternalSignals: {String(result.detected.containsInternalSignals)}</li>
              <li>containsPersonalSignals: {String(result.detected.containsPersonalSignals)}</li>
              <li>containsBusinessSignals: {String(result.detected.containsBusinessSignals)}</li>
              <li>containsSecretSignals: {String(result.detected.containsSecretSignals)}</li>
            </ul>
          </article>

          <article style={card}>
            <h3>Anonymisierte Vorschau</h3>
            <p>{result.anonymizedPreview}</p>
          </article>

          <article style={card}>
            <h3>Freigabe</h3>
            <ul>
              <li>required: {String(result.approval.required)}</li>
              <li>selectedOption: {result.approval.selectedOption}</li>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
            </ul>
          </article>
        </section>
      )}

      <section style={{ marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>provider: none</li>
          <li>modelSelected: none</li>
          <li>liveModelEnabled: false</li>
          <li>externalSharingAllowed: false</li>
          <li>networkCallAllowed: false</li>
          <li>providerDispatchAllowed: false</li>
          <li>finalDispatchBlocked: true</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE121_0.md', `# Phase 121.0 - Privacy Gate MVP

Baut ein lokales Datenschutz-Gate mit Freigabe- und Anonymisierungsentscheidung.

Kurz-Namen:

- Store: frontend/lib/cmt-privacy-gate.ts
- API: /api/cmt/privacy
- UI: /cmt/privacy
- Patch: scripts/p121-0.cjs
- Verify: scripts/v121-0.cjs

Funktion:

- interne, personenbezogene, geschaeftliche und geheime Signale erkennen
- Entscheidung treffen: local only, anonymisieren, Freigabe erforderlich oder extern blockieren
- anonymisierte Vorschau anzeigen
- externe Weitergabe immer blockiert halten

Status:

- lokal testbar
- kein Provider
- kein Internet
- kein Live-Modell
- externalSharingAllowed = false
`);

write('scripts/v121-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-privacy-gate.ts', 'evaluatePrivacyGate'],
  ['frontend/lib/cmt-privacy-gate.ts', 'getPrivacyGateDemo'],
  ['frontend/lib/cmt-privacy-gate.ts', "phase: '121.0'"],
  ['frontend/lib/cmt-privacy-gate.ts', "label: 'Privacy Gate MVP'"],
  ['frontend/lib/cmt-privacy-gate.ts', "decision: 'block_external'"],
  ['frontend/lib/cmt-privacy-gate.ts', "decision: 'require_anonymization'"],
  ['frontend/lib/cmt-privacy-gate.ts', 'externalSharingAllowed: false'],
  ['frontend/lib/cmt-privacy-gate.ts', 'liveModelEnabled: false'],
  ['frontend/app/api/cmt/privacy/route.ts', 'evaluatePrivacyGate'],
  ['frontend/app/cmt/privacy/page.tsx', 'Privacy Gate prüfen'],
  ['frontend/app/cmt/privacy/page.tsx', 'Anonymisierte Vorschau'],
  ['README_PHASE121_0.md', 'Privacy Gate MVP'],
  ['package.json', 'phase121:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 121.0 Privacy Gate MVP verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase121:0:verify'] = 'node scripts/v121-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 121.0 Privacy Gate MVP patch applied.');
