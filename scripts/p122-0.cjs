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

write('frontend/lib/cmt-master-secure.ts', `import { askMasterAgentLocal, type MasterAgentResult } from './cmt-master';
import { evaluatePrivacyGate, type PrivacyGateResult } from './cmt-privacy-gate';
import { decidePrivacyAction, type PrivacyDecisionOption, type PrivacyDecisionResult } from './cmt-privacy-decision';

export type SecureMasterAgentResult = {
  phase: '122.0';
  label: 'Secure Master Agent MVP';
  input: string;
  requestedPrivacyOption: PrivacyDecisionOption;
  privacy: PrivacyGateResult;
  privacyDecision: PrivacyDecisionResult;
  master: MasterAgentResult;
  finalRoute: 'direct' | 'committee' | 'privacy_gate' | 'tool_required' | 'agent_builder';
  userVisibleAnswer: string;
  blocksExternalSharing: true;
  requiresUserApproval: boolean;
  suggestedOpenPages: string[];
  externalSharingAllowed: false;
  liveModelEnabled: false;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function answerForRoute(master: MasterAgentResult, privacy: PrivacyGateResult, decision: PrivacyDecisionResult) {
  if (decision.outcome.mode === 'blocked') {
    return 'Externe Weitergabe ist blockiert. Der Master-Agent verarbeitet diese Eingabe nur lokal oder nach Anonymisierungsvorschau.';
  }
  if (decision.outcome.mode === 'cancelled') {
    return 'Der Vorgang wurde abgebrochen. Es findet keine Verarbeitung und keine Weitergabe statt.';
  }
  if (privacy.decision.decision === 'block_external') {
    return 'Der Master-Agent hat vertrauliche/geheime Signale erkannt. Es wird nur lokal verarbeitet. Keine Provider-, Internet- oder externe Weitergabe.';
  }
  if (privacy.decision.decision === 'require_anonymization') {
    return 'Der Master-Agent hat interne, personenbezogene oder geschäftliche Signale erkannt. Erst anonymisieren bzw. lokal verarbeiten. Externe Weitergabe bleibt deaktiviert.';
  }
  if (master.route === 'committee') {
    return 'Der Master-Agent würde lokal das 5er-Gremium einbeziehen, weil die Frage nach Entscheidung, Risiko oder Strategie klingt.';
  }
  if (master.route === 'tool_required') {
    return 'Der Master-Agent erkennt Toolbedarf. Für aktuelle Live-Daten wäre später ein freigegebenes Tool nötig. Aktuell keine Internet-/Provider-Nutzung.';
  }
  if (master.route === 'agent_builder') {
    return 'Der Master-Agent erkennt Potenzial für einen Spezialagenten und kann lokal einen Agenten-Entwurf vorbereiten.';
  }
  return 'Der Master-Agent beantwortet diese Eingabe lokal direkt. Kein Provider, kein Internet und keine externe Weitergabe.';
}

export function askSecureMasterAgent(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterAgentResult {
  const normalized = input.trim() || 'Was soll der Master-Agent pruefen?';
  const privacy = evaluatePrivacyGate(normalized);
  const privacyDecision = decidePrivacyAction(normalized, option);
  const master = askMasterAgentLocal(normalized);
  const finalRoute = privacy.approval.required || privacy.decision.decision !== 'allow_local_only'
    ? 'privacy_gate'
    : master.route;

  return {
    phase: '122.0',
    label: 'Secure Master Agent MVP',
    input: normalized,
    requestedPrivacyOption: option,
    privacy,
    privacyDecision,
    master,
    finalRoute,
    userVisibleAnswer: answerForRoute(master, privacy, privacyDecision),
    blocksExternalSharing: true,
    requiresUserApproval: privacy.approval.required,
    suggestedOpenPages: ['/cmt/master', '/cmt/privacy', '/cmt/privacy/decision', '/cmt/ask'],
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

export function getSecureMasterDemo() {
  return askSecureMasterAgent('Soll ich diese interne Kalkulation fuer Kunde Muster mit dem Gremium pruefen?', 'local_only');
}
`);

write('frontend/app/api/cmt/master/secure/route.ts', `import { NextResponse } from 'next/server';
import { askSecureMasterAgent, getSecureMasterDemo } from '../../../../../lib/cmt-master-secure';
import type { PrivacyDecisionOption } from '../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  const option = typeof body?.option === 'string' && options.includes(body.option)
    ? body.option
    : 'local_only';
  return NextResponse.json(askSecureMasterAgent(input, option));
}
`);

write('frontend/app/cmt/master/secure/page.tsx', `'use client';

import { useState } from 'react';
import type { SecureMasterAgentResult } from '../../../../lib/cmt-master-secure';
import type { PrivacyDecisionOption } from '../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function SecureMasterAgentPage() {
  const [input, setInput] = useState('Soll ich diese interne Kalkulation fuer Kunde Muster mit dem Gremium pruefen?');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [result, setResult] = useState<SecureMasterAgentResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure', {
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
        <h1>Phase 122.0</h1>
        <h2>Secure Master Agent MVP</h2>
        <p><strong>Status:</strong> Master-Agent + Privacy-Gate lokal zusammengeführt. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Frage an den sicheren Master-Agenten</h3>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 920, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <h3>Privacy-Option</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Master-Agent prüft...' : 'Master-Agent fragen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Antwort</h3>
            <p>{result.userVisibleAnswer}</p>
          </article>

          <article style={card}>
            <h3>Routing</h3>
            <ul>
              <li>finalRoute: {result.finalRoute}</li>
              <li>master.route: {result.master.route}</li>
              <li>requiresUserApproval: {String(result.requiresUserApproval)}</li>
              <li>requestedPrivacyOption: {result.requestedPrivacyOption}</li>
            </ul>
          </article>

          <article style={card}>
            <h3>Privacy Gate</h3>
            <ul>
              <li>privacy.decision: {result.privacy.decision.decision}</li>
              <li>sensitivity: {result.privacy.detected.sensitivity}</li>
              <li>decisionFlow.mode: {result.privacyDecision.outcome.mode}</li>
              <li>decisionFlow.message: {result.privacyDecision.outcome.message}</li>
            </ul>
          </article>

          <article style={card}>
            <h3>Safety State</h3>
            <ul>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
              <li>liveModelEnabled: {String(result.liveModelEnabled)}</li>
              <li>provider: {result.provider}</li>
              <li>modelSelected: {result.modelSelected}</li>
              <li>networkCallAllowed: {String(result.networkCallAllowed)}</li>
              <li>providerDispatchAllowed: {String(result.providerDispatchAllowed)}</li>
              <li>finalDispatchBlocked: {String(result.finalDispatchBlocked)}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
`);

write('README_PHASE122_0.md', `# Phase 122.0 - Secure Master Agent MVP

Fuehrt Master-Agent-Router und Privacy-Gate lokal zusammen.

Kurz-Namen:

- Store: frontend/lib/cmt-master-secure.ts
- API: /api/cmt/master/secure
- UI: /cmt/master/secure
- Patch: scripts/p122-0.cjs
- Verify: scripts/v122-0.cjs

Funktion:

- jede Eingabe durch Privacy Gate pruefen
- Privacy Decision Flow beruecksichtigen
- danach Master-Agent Route bestimmen
- bei sensiblen Daten automatisch auf privacy_gate routen
- externe Weitergabe weiterhin blockieren

Status:

- lokal testbar
- Master-Agent und Datenschutz-Gate integriert
- kein Provider
- kein Internet
- kein Live-Modell
- externalSharingAllowed = false
`);

write('scripts/v122-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-master-secure.ts', 'askSecureMasterAgent'],
  ['frontend/lib/cmt-master-secure.ts', 'getSecureMasterDemo'],
  ['frontend/lib/cmt-master-secure.ts', "phase: '122.0'"],
  ['frontend/lib/cmt-master-secure.ts', "label: 'Secure Master Agent MVP'"],
  ['frontend/lib/cmt-master-secure.ts', "finalRoute = privacy.approval.required"],
  ['frontend/lib/cmt-master-secure.ts', 'externalSharingAllowed: false'],
  ['frontend/lib/cmt-master-secure.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/master/secure/route.ts', 'askSecureMasterAgent'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Master-Agent fragen'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Privacy Gate'],
  ['README_PHASE122_0.md', 'Secure Master Agent MVP'],
  ['package.json', 'phase122:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 122.0 Secure Master Agent MVP verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase122:0:verify'] = 'node scripts/v122-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 122.0 Secure Master Agent MVP patch applied.');
