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

write('frontend/lib/cmt-ask.ts', `export type CommitteeRoleAnswer = {
  role: string;
  stance: 'support' | 'caution' | 'challenge' | 'execute';
  answer: string;
  risk: string;
  action: string;
};

export type CommitteeAskResult = {
  phase: '119.0';
  label: 'Gremium Ask MVP';
  question: string;
  roles: CommitteeRoleAnswer[];
  finalAnswer: {
    headline: string;
    recommendation: string;
    reasoning: string[];
    risks: string[];
    nextActions: string[];
  };
  usableStatus: 'local-testable';
  liveModelEnabled: false;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function normalizeQuestion(question: string) {
  const trimmed = question.trim();
  return trimmed || 'Welche Entscheidung soll das Gremium bewerten?';
}

export function askCommitteeLocal(question: string): CommitteeAskResult {
  const q = normalizeQuestion(question);
  const roles: CommitteeRoleAnswer[] = [
    {
      role: 'Strategie',
      stance: 'support',
      answer: 'Die Frage sollte zuerst nach Ziel, Nutzen und Prioritaet bewertet werden.',
      risk: 'Ohne klares Ziel kann der naechste Schritt technisch richtig, aber strategisch falsch sein.',
      action: 'Formuliere das Ziel in einem Satz und pruefe, ob diese Entscheidung direkt darauf einzahlt.',
    },
    {
      role: 'Risiko',
      stance: 'caution',
      answer: 'Die groessten Risiken liegen in unklaren Annahmen, fehlenden Tests und zu fruehem Live-Schalten.',
      risk: 'Wenn der Agent live geht, bevor der lokale Flow stabil ist, entstehen falsche oder schwer nachvollziehbare Antworten.',
      action: 'Teste zuerst lokal mit 5 echten Fragen und dokumentiere Fehlverhalten.',
    },
    {
      role: 'Umsetzung',
      stance: 'execute',
      answer: 'Der naechste sinnvolle Schritt ist ein kleiner vertikaler End-to-End-Test.',
      risk: 'Zu viele weitere Status- und Guide-Seiten verzoegern den ersten Nutzwert.',
      action: 'Nutze die Ask-Seite, pruefe die Antwortstruktur und sammle Verbesserungen.',
    },
    {
      role: 'Kritik',
      stance: 'challenge',
      answer: 'Die Antwortqualitaet ist noch lokal und regelbasiert. Das ist gut zum Testen des Flows, aber noch kein echter KI-Agent.',
      risk: 'Der Nutzer koennte die lokale Antwort mit einer echten Modellantwort verwechseln.',
      action: 'Kennzeichne klar, dass dieser Stand lokal testbar, aber noch nicht live mit Modell ist.',
    },
  ];

  return {
    phase: '119.0',
    label: 'Gremium Ask MVP',
    question: q,
    roles,
    finalAnswer: {
      headline: 'Lokaler Gremium-Test abgeschlossen.',
      recommendation: 'Jetzt lokal testen, noch nicht live schalten.',
      reasoning: [
        'Die Frage wurde durch mehrere Gremiumsrollen bewertet.',
        'Der komplette Ask-Flow ist erstmals ueber UI und API nutzbar.',
        'Die Antworten sind bewusst lokal und deterministisch, damit der Flow stabil getestet werden kann.',
      ],
      risks: roles.map((role) => role.risk),
      nextActions: [
        'Oeffne /cmt/ask und stelle 5 echte Testfragen.',
        'Pruefe, ob Rollenmeinungen, Risiken und Aktionen sinnvoll angezeigt werden.',
        'Sammle Verbesserungen fuer Phase 119.1.',
      ],
    },
    usableStatus: 'local-testable',
    liveModelEnabled: false,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeAskDemo() {
  return askCommitteeLocal('Wann kann ich den Gremium-Agenten testen und was fehlt noch bis zum Live-Betrieb?');
}
`);

write('frontend/app/api/cmt/ask/route.ts', `import { NextResponse } from 'next/server';
import { askCommitteeLocal, getCommitteeAskDemo } from '../../../../lib/cmt-ask';

export async function GET() {
  return NextResponse.json(getCommitteeAskDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body?.question === 'string' ? body.question : '';
  return NextResponse.json(askCommitteeLocal(question));
}
`);

write('frontend/app/cmt/ask/page.tsx', `'use client';

import { useState } from 'react';
import type { CommitteeAskResult } from '../../../lib/cmt-ask';

export default function CommitteeAskPage() {
  const [question, setQuestion] = useState('Wann kann ich den Gremium-Agenten testen und was fehlt noch bis zum Live-Betrieb?');
  const [result, setResult] = useState<CommitteeAskResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/ask', {
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
        <h1>Phase 119.0</h1>
        <h2>Gremium Ask MVP</h2>
        <p><strong>Status:</strong> Lokal testbar. Noch nicht live mit KI-Modell.</p>
        <p>Hier kannst du den Agenten erstmals mit echten Fragen lokal testen.</p>
      </section>

      <section style={card}>
        <h3>Frage an das Gremium</h3>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 12, borderRadius: 12, border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Gremium denkt lokal...' : 'Gremium fragen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>{result.finalAnswer.headline}</h3>
            <p><strong>Empfehlung:</strong> {result.finalAnswer.recommendation}</p>
            <p><strong>Usable Status:</strong> {result.usableStatus}</p>
          </article>

          <article style={card}>
            <h3>Gremiumsrollen</h3>
            {result.roles.map((role) => (
              <section key={role.role} style={{ borderTop: '1px solid #eee', paddingTop: 10, marginTop: 10 }}>
                <h4>{role.role} - {role.stance}</h4>
                <p>{role.answer}</p>
                <p><strong>Risiko:</strong> {role.risk}</p>
                <p><strong>Aktion:</strong> {role.action}</p>
              </section>
            ))}
          </article>

          <article style={card}>
            <h3>Begruendung</h3>
            <ul>{result.finalAnswer.reasoning.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Naechste Aktionen</h3>
            <ol>{result.finalAnswer.nextActions.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
        </section>
      )}

      <section style={{ marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>provider: none</li>
          <li>modelSelected: none</li>
          <li>liveModelEnabled: false</li>
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

write('README_PHASE119_0.md', `# Phase 119.0 - Gremium Ask MVP

Baut den ersten wirklich lokal testbaren Ask-Flow fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-ask.ts
- API: /api/cmt/ask
- UI: /cmt/ask
- Patch: scripts/p119-0.cjs
- Verify: scripts/v119-0.cjs

Funktion:

- echte Nutzerfrage annehmen
- lokale Gremiumsrollen antworten lassen
- finale Empfehlung, Begruendung, Risiken und naechste Aktionen anzeigen
- klar kennzeichnen: lokal testbar, noch nicht live mit KI-Modell

## Testzeitpunkt

Nach gruenem Build ist der Agent erstmals lokal testbar.

Oeffne:

- /cmt/ask

Noch nicht live schalten. Provider bleibt deaktiviert.
`);

write('scripts/v119-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-ask.ts', 'askCommitteeLocal'],
  ['frontend/lib/cmt-ask.ts', 'getCommitteeAskDemo'],
  ['frontend/lib/cmt-ask.ts', "phase: '119.0'"],
  ['frontend/lib/cmt-ask.ts', "label: 'Gremium Ask MVP'"],
  ['frontend/lib/cmt-ask.ts', "usableStatus: 'local-testable'"],
  ['frontend/lib/cmt-ask.ts', 'liveModelEnabled: false'],
  ['frontend/lib/cmt-ask.ts', "provider: 'none'"],
  ['frontend/lib/cmt-ask.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-ask.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/ask/route.ts', 'askCommitteeLocal'],
  ['frontend/app/cmt/ask/page.tsx', 'Gremium fragen'],
  ['frontend/app/cmt/ask/page.tsx', 'Lokal testbar'],
  ['README_PHASE119_0.md', '/cmt/ask'],
  ['package.json', 'phase119:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 119.0 Gremium Ask MVP verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase119:0:verify'] = 'node scripts/v119-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 119.0 Gremium Ask MVP patch applied.');
