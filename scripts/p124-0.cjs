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

write('frontend/lib/cmt-master-quality.ts', `import { askSecureMasterAgent, type SecureMasterAgentResult } from './cmt-master-secure';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterQualityResult = SecureMasterAgentResult & {
  phaseQuality: '124.0';
  qualityLabel: 'Secure Master Local Answer Quality';
  detectedIntent: 'general' | 'live_switch' | 'internal_data' | 'committee_decision' | 'tool_required' | 'agent_builder' | 'project_next_step';
  improvedAnswer: string;
  committeeRolesVisible: boolean;
  localNextSteps: string[];
  missingCapability: string | null;
};

function lower(input: string) {
  return input.toLowerCase();
}

function detectIntent(input: string): SecureMasterQualityResult['detectedIntent'] {
  const q = lower(input);
  if (q.includes('live') || q.includes('freischalten') || q.includes('schalten')) return 'live_switch';
  if (q.includes('intern') || q.includes('kunde') || q.includes('kalkulation') || q.includes('vertraulich')) return 'internal_data';
  if (q.includes('gremium') || q.includes('entscheidung') || q.includes('soll ich') || q.includes('risiko')) return 'committee_decision';
  if (q.includes('wetter') || q.includes('aktuell') || q.includes('online') || q.includes('internet')) return 'tool_required';
  if (q.includes('agent') && (q.includes('bau') || q.includes('erstell') || q.includes('trading') || q.includes('immobilien'))) return 'agent_builder';
  if (q.includes('nächster') || q.includes('naechster') || q.includes('weiter') || q.includes('roadmap')) return 'project_next_step';
  return 'general';
}

function answerForIntent(intent: SecureMasterQualityResult['detectedIntent'], base: SecureMasterAgentResult) {
  if (intent === 'live_switch') {
    return 'Noch nicht live schalten. Der sichere Master-Agent ist lokal testbar, aber Provider, Internetzugriff und Live-Modell sind weiterhin deaktiviert. Erst lokale Antwortqualität, Gremium-Ausgabe und Datenschutzfluss stabilisieren.';
  }
  if (intent === 'internal_data') {
    return 'Interne oder vertrauliche Daten werden lokal durch das Privacy Gate geprüft. Der Agent darf solche Daten aktuell nicht extern weitergeben. Sichere Optionen sind local_only oder anonymize_then_send als Vorschau; approve_external_send bleibt blockiert.';
  }
  if (intent === 'committee_decision') {
    return 'Das ist eine typische Gremiumsfrage. Der Master-Agent sollte lokal das 5er-Gremium sichtbar machen: Visionär, Skeptiker, Umsetzer, Datenschutz & Risiko sowie Wirtschaftlichkeit & Praxisnutzen. Danach folgt eine klare Empfehlung.';
  }
  if (intent === 'tool_required') {
    return 'Für diese Frage fehlt aktuell ein freigegebenes Tool. Wetter, aktuelle Preise, News oder Live-Webdaten können im lokalen Modus nicht sicher beantwortet werden. Der Agent soll das sauber melden und später nach Freigabe ein Tool nutzen.';
  }
  if (intent === 'agent_builder') {
    return 'Das ist ein Kandidat für einen Spezialagenten. Der Master-Agent sollte lokal einen Entwurf vorbereiten: Zweck, Eingaben, Grenzen, Datenschutzregeln, Tools, Testfragen und Freigabepunkte. Noch wird kein Agent produktiv erzeugt.';
  }
  if (intent === 'project_next_step') {
    return 'Der nächste sinnvolle Projektschritt ist lokal: Antwortqualität verbessern, Gremiumsrollen direkt anzeigen und danach Provider-Readiness vorbereiten. Noch kein Live-Modell aktivieren.';
  }
  return 'Der Master-Agent kann diese Frage lokal direkt bearbeiten. Wenn Unsicherheit, Risiko oder Strategie erkennbar wird, routet der Agent zum Gremium. Wenn sensible Daten erkannt werden, greift zuerst das Privacy Gate.';
}

function nextStepsForIntent(intent: SecureMasterQualityResult['detectedIntent']) {
  if (intent === 'live_switch') return ['Nicht live schalten', 'lokal weiter testen', 'Provider weiterhin deaktiviert lassen'];
  if (intent === 'internal_data') return ['Privacy Gate Ergebnis prüfen', 'local_only nutzen', 'Anonymisierungsvorschau prüfen'];
  if (intent === 'committee_decision') return ['5 Rollen anzeigen', 'Risiken sammeln', 'finale Empfehlung ausgeben'];
  if (intent === 'tool_required') return ['Toolbedarf benennen', 'keine Live-Daten erfinden', 'später Tool-Freigabe vorbereiten'];
  if (intent === 'agent_builder') return ['Agentenprofil entwerfen', 'Datenschutzgrenzen definieren', 'Testfragen erstellen'];
  if (intent === 'project_next_step') return ['Antwortqualität verbessern', 'Gremium integrieren', 'Provider-Readiness später vorbereiten'];
  return ['lokal beantworten', 'bei Unsicherheit Gremium nutzen', 'bei sensiblen Daten Privacy Gate nutzen'];
}

function missingCapability(intent: SecureMasterQualityResult['detectedIntent']) {
  if (intent === 'tool_required') return 'Freigegebenes Tool fuer Live-Daten, Web, Wetter oder aktuelle Informationen';
  if (intent === 'live_switch') return 'Live-Modell-Freigabe und Provider-Konfiguration';
  if (intent === 'agent_builder') return 'Produktiver Spezialagenten-Generator';
  return null;
}

export function askSecureMasterQuality(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterQualityResult {
  const base = askSecureMasterAgent(input, option);
  const intent = detectIntent(input);
  return {
    ...base,
    phaseQuality: '124.0',
    qualityLabel: 'Secure Master Local Answer Quality',
    detectedIntent: intent,
    improvedAnswer: answerForIntent(intent, base),
    committeeRolesVisible: intent === 'committee_decision',
    localNextSteps: nextStepsForIntent(intent),
    missingCapability: missingCapability(intent),
  };
}

export function getSecureMasterQualityDemo() {
  return askSecureMasterQuality('Soll ich fuer diese interne Entscheidung das Gremium fragen?', 'local_only');
}
`);

write('frontend/app/api/cmt/master/secure/quality/route.ts', `import { NextResponse } from 'next/server';
import { askSecureMasterQuality, getSecureMasterQualityDemo } from '../../../../../../lib/cmt-master-quality';
import type { PrivacyDecisionOption } from '../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterQualityDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  const option = typeof body?.option === 'string' && options.includes(body.option) ? body.option : 'local_only';
  return NextResponse.json(askSecureMasterQuality(input, option));
}
`);

write('frontend/app/cmt/master/secure/quality/page.tsx', `'use client';

import { useState } from 'react';
import type { SecureMasterQualityResult } from '../../../../../lib/cmt-master-quality';
import type { PrivacyDecisionOption } from '../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function SecureMasterQualityPage() {
  const [input, setInput] = useState('Soll ich fuer diese interne Entscheidung das Gremium fragen?');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [result, setResult] = useState<SecureMasterQualityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure/quality', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input, option }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 124.0</h1>
        <h2>Secure Master Local Answer Quality</h2>
        <p><strong>Status:</strong> Lokale Antwortqualität verbessert. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Frage testen</h3>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={5} style={{ width: '100%', maxWidth: 920, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <h3>Privacy-Option</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Prüft...' : 'Qualitätsantwort testen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Verbesserte Antwort</h3>
            <p>{result.improvedAnswer}</p>
          </article>
          <article style={card}>
            <h3>Erkennung</h3>
            <ul>
              <li>detectedIntent: {result.detectedIntent}</li>
              <li>finalRoute: {result.finalRoute}</li>
              <li>committeeRolesVisible: {String(result.committeeRolesVisible)}</li>
              <li>missingCapability: {result.missingCapability || 'none'}</li>
            </ul>
          </article>
          <article style={card}>
            <h3>Lokale nächste Schritte</h3>
            <ol>{result.localNextSteps.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
          <article style={card}>
            <h3>Safety</h3>
            <ul>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
              <li>liveModelEnabled: {String(result.liveModelEnabled)}</li>
              <li>provider: {result.provider}</li>
              <li>networkCallAllowed: {String(result.networkCallAllowed)}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
`);

write('README_PHASE124_0.md', `# Phase 124.0 - Secure Master Local Answer Quality

Verbessert lokal die Antwortqualitaet des Secure Master Agent.

Kurz-Namen:

- Store: frontend/lib/cmt-master-quality.ts
- API: /api/cmt/master/secure/quality
- UI: /cmt/master/secure/quality
- Patch: scripts/p124-0.cjs
- Verify: scripts/v124-0.cjs

Erkennt lokal:

- live_switch
- internal_data
- committee_decision
- tool_required
- agent_builder
- project_next_step
- general

Status:

- lokal testbar
- bessere lokale Antworten
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v124-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-quality.ts', 'askSecureMasterQuality'],
  ['frontend/lib/cmt-master-quality.ts', 'getSecureMasterQualityDemo'],
  ['frontend/lib/cmt-master-quality.ts', "phaseQuality: '124.0'"],
  ['frontend/lib/cmt-master-quality.ts', "committee_decision"],
  ['frontend/lib/cmt-master-quality.ts', "tool_required"],
  ['frontend/lib/cmt-master-quality.ts', "agent_builder"],
  ['frontend/lib/cmt-master-quality.ts', "Noch nicht live schalten."],
  ['frontend/app/api/cmt/master/secure/quality/route.ts', 'askSecureMasterQuality'],
  ['frontend/app/cmt/master/secure/quality/page.tsx', 'Qualitätsantwort testen'],
  ['frontend/app/cmt/master/secure/quality/page.tsx', 'Verbesserte Antwort'],
  ['README_PHASE124_0.md', 'Secure Master Local Answer Quality'],
  ['package.json', 'phase124:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 124.0 Secure Master Local Answer Quality verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase124:0:verify'] = 'node scripts/v124-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 124.0 Secure Master Local Answer Quality patch applied.');
