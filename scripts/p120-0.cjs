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

write('frontend/lib/cmt-master.ts', `import { askCommitteeLocal, type CommitteeAskResult } from './cmt-ask';

export type MasterRouteDecision = {
  route: 'direct' | 'committee' | 'privacy_gate' | 'tool_required' | 'agent_builder';
  reason: string;
  confidence: 'low' | 'medium' | 'high';
};

export type MasterAgentResult = {
  phase: '120.0';
  label: 'Master Agent Router MVP';
  question: string;
  decision: MasterRouteDecision;
  directAnswer: string | null;
  committee: CommitteeAskResult | null;
  privacy: {
    sensitivity: 'public' | 'internal' | 'confidential';
    externalSharingAllowed: false;
    anonymizationRequired: boolean;
    userApprovalRequired: boolean;
  };
  nextActions: string[];
  usableStatus: 'master-router-local-testable';
  liveModelEnabled: false;
  localReasoningOnly: true;
  internetAccessEnabled: false;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function normalizeQuestion(question: string) {
  const trimmed = question.trim();
  return trimmed || 'Was soll der Master-Agent beantworten?';
}

function classifySensitivity(question: string): MasterAgentResult['privacy']['sensitivity'] {
  const q = question.toLowerCase();
  if (q.includes('vertraulich') || q.includes('geheim') || q.includes('angebot') || q.includes('kalkulation')) return 'confidential';
  if (q.includes('intern') || q.includes('kunde') || q.includes('projekt') || q.includes('firma') || q.includes('betriebsintern')) return 'internal';
  return 'public';
}

function decideRoute(question: string, sensitivity: MasterAgentResult['privacy']['sensitivity']): MasterRouteDecision {
  const q = question.toLowerCase();
  if (sensitivity !== 'public') return { route: 'privacy_gate', reason: 'Interne oder vertrauliche Daten erkannt.', confidence: 'high' };
  if (q.includes('wetter') || q.includes('preis aktuell') || q.includes('news') || q.includes('heute') || q.includes('morgen')) return { route: 'tool_required', reason: 'Aktuelle externe Daten waeren noetig, Internet/Tool ist aber deaktiviert.', confidence: 'high' };
  if (q.includes('agent') && (q.includes('bauen') || q.includes('erstellen') || q.includes('spezial') || q.includes('trading') || q.includes('immobilien'))) return { route: 'agent_builder', reason: 'Spezialagenten-Idee erkannt.', confidence: 'high' };
  if (q.includes('soll ich') || q.includes('entscheidung') || q.includes('lohnt') || q.includes('risiko') || q.includes('strategie') || q.includes('priorit')) return { route: 'committee', reason: 'Entscheidungs- oder Risiko-Frage erkannt.', confidence: 'high' };
  return { route: 'direct', reason: 'Keine Gremiumspflicht erkannt; lokale Direktantwort reicht im Testmodus.', confidence: 'medium' };
}

function directLocalAnswer(question: string, decision: MasterRouteDecision) {
  if (decision.route === 'privacy_gate') return 'Ich erkenne interne oder vertrauliche Inhalte. Im aktuellen lokalen Modus sende ich nichts extern. Vor spaeterem Provider-Einsatz brauche ich Anonymisierung oder deine explizite Freigabe.';
  if (decision.route === 'tool_required') return 'Dafuer brauche ich spaeter ein freigegebenes Tool oder Webzugriff. Aktuell sind Internet und Provider deaktiviert, deshalb rate ich nicht.';
  if (decision.route === 'agent_builder') return 'Dafuer kann der Master-Agent spaeter einen Spezialagenten-Entwurf erstellen. Der naechste sichere Schritt ist ein Agentenprofil mit Ziel, Grenzen, Datenquellen und Testfragen.';
  return 'Lokale Direktantwort: Ich kann diese Frage im Testmodus grob beantworten. Fuer echte Wissens- oder Live-Antworten braucht der Master-Agent spaeter Provider, Toolzugriff oder Gremium je nach Risiko.';
}

export function askMasterAgentLocal(question: string): MasterAgentResult {
  const q = normalizeQuestion(question);
  const sensitivity = classifySensitivity(q);
  const decision = decideRoute(q, sensitivity);
  const useCommittee = decision.route === 'committee' || decision.route === 'agent_builder' || decision.route === 'tool_required';
  const committee = useCommittee ? askCommitteeLocal(q) : null;
  const anonymizationRequired = sensitivity !== 'public';
  const userApprovalRequired = sensitivity !== 'public' || decision.route === 'tool_required' || decision.route === 'agent_builder';

  return {
    phase: '120.0',
    label: 'Master Agent Router MVP',
    question: q,
    decision,
    directAnswer: useCommittee ? null : directLocalAnswer(q, decision),
    committee,
    privacy: {
      sensitivity,
      externalSharingAllowed: false,
      anonymizationRequired,
      userApprovalRequired,
    },
    nextActions: [
      'Teste /cmt/master mit direkten Fragen, Entscheidungsfragen und internen Daten.',
      'Pruefe, ob route direct, committee, privacy_gate, tool_required oder agent_builder sinnvoll gesetzt wird.',
      'Danach Master-Agent UI und Haupt-Chat-Integration verbessern.',
    ],
    usableStatus: 'master-router-local-testable',
    liveModelEnabled: false,
    localReasoningOnly: true,
    internetAccessEnabled: false,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getMasterAgentDemo() {
  return askMasterAgentLocal('Soll ich den Gremium-Agenten jetzt live schalten oder erst verbessern?');
}
`);

write('frontend/app/api/cmt/master/route.ts', `import { NextResponse } from 'next/server';
import { askMasterAgentLocal, getMasterAgentDemo } from '../../../../lib/cmt-master';

export async function GET() {
  return NextResponse.json(getMasterAgentDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body?.question === 'string' ? body.question : '';
  return NextResponse.json(askMasterAgentLocal(question));
}
`);

write('frontend/app/cmt/master/page.tsx', `'use client';

import { useState } from 'react';
import type { MasterAgentResult } from '../../../lib/cmt-master';

export default function MasterAgentPage() {
  const [question, setQuestion] = useState('Soll ich den Gremium-Agenten jetzt live schalten oder erst verbessern?');
  const [result, setResult] = useState<MasterAgentResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question }),
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
        <h1>Phase 120.0</h1>
        <h2>Master Agent Router MVP</h2>
        <p><strong>Status:</strong> Master-Router lokal testbar. Noch nicht live mit KI-Modell.</p>
        <p>Der Master-Agent entscheidet lokal: direkt antworten, Gremium fragen, Privacy-Gate, Tool benoetigt oder Spezialagenten-Idee.</p>
      </section>

      <section style={card}>
        <h3>Frage an den Master-Agenten</h3>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Master-Agent routet lokal...' : 'Master-Agent fragen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Routing Entscheidung</h3>
            <p><strong>Frage:</strong> {result.question}</p>
            <p><strong>Route:</strong> {result.decision.route}</p>
            <p><strong>Grund:</strong> {result.decision.reason}</p>
            <p><strong>Confidence:</strong> {result.decision.confidence}</p>
            {result.directAnswer && <p><strong>Direktantwort:</strong> {result.directAnswer}</p>}
          </article>

          <article style={card}>
            <h3>Privacy Gate</h3>
            <ul>
              <li>sensitivity: {result.privacy.sensitivity}</li>
              <li>externalSharingAllowed: {String(result.privacy.externalSharingAllowed)}</li>
              <li>anonymizationRequired: {String(result.privacy.anonymizationRequired)}</li>
              <li>userApprovalRequired: {String(result.privacy.userApprovalRequired)}</li>
            </ul>
          </article>

          {result.committee && (
            <article style={card}>
              <h3>Gremium Ergebnis</h3>
              <p><strong>Intent:</strong> {result.committee.intent}</p>
              <p><strong>Empfehlung:</strong> {result.committee.finalAnswer.recommendation}</p>
              <p><strong>Direktantwort:</strong> {result.committee.finalAnswer.directAnswer}</p>
            </article>
          )}

          <article style={card}>
            <h3>Naechste Aktionen</h3>
            <ol>{result.nextActions.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
        </section>
      )}

      <section style={{ marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>provider: none</li>
          <li>modelSelected: none</li>
          <li>liveModelEnabled: false</li>
          <li>localReasoningOnly: true</li>
          <li>internetAccessEnabled: false</li>
          <li>dryRunOnly: true</li>
          <li>networkCallAllowed: false</li>
          <li>providerDispatchAllowed: false</li>
          <li>finalDispatchBlocked: true</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE120_0.md', `# Phase 120.0 - Master Agent Router MVP

Baut den ersten lokalen Master-Agent-Router.

Kurz-Namen:

- Store: frontend/lib/cmt-master.ts
- API: /api/cmt/master
- UI: /cmt/master
- Patch: scripts/p120-0.cjs
- Verify: scripts/v120-0.cjs

Funktion:

- Frage lokal klassifizieren
- direkt antworten oder Gremium fragen
- interne/vertrauliche Daten als Privacy-Gate erkennen
- Toolbedarf erkennen
- Spezialagenten-Idee erkennen
- weiterhin ohne Provider, ohne Internet, ohne Live-Modell

Testseite:

- /cmt/master

Status:

- master-router-local-testable
- noch nicht live mit KI-Modell
`);

write('scripts/v120-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-master.ts', 'askMasterAgentLocal'],
  ['frontend/lib/cmt-master.ts', 'getMasterAgentDemo'],
  ['frontend/lib/cmt-master.ts', "phase: '120.0'"],
  ['frontend/lib/cmt-master.ts', "label: 'Master Agent Router MVP'"],
  ['frontend/lib/cmt-master.ts', "route: 'privacy_gate'"],
  ['frontend/lib/cmt-master.ts', "route: 'committee'"],
  ['frontend/lib/cmt-master.ts', "route: 'direct'"],
  ['frontend/lib/cmt-master.ts', "usableStatus: 'master-router-local-testable'"],
  ['frontend/lib/cmt-master.ts', 'externalSharingAllowed: false'],
  ['frontend/lib/cmt-master.ts', 'liveModelEnabled: false'],
  ['frontend/app/api/cmt/master/route.ts', 'askMasterAgentLocal'],
  ['frontend/app/cmt/master/page.tsx', 'Master-Agent fragen'],
  ['frontend/app/cmt/master/page.tsx', 'Routing Entscheidung'],
  ['README_PHASE120_0.md', 'Master Agent Router MVP'],
  ['package.json', 'phase120:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 120.0 Master Agent Router MVP verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase120:0:verify'] = 'node scripts/v120-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 120.0 Master Agent Router MVP patch applied.');
