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

write('frontend/lib/cmt-ask.ts', `export type CommitteeIntent =
  | 'weather'
  | 'live_switch'
  | 'internal_data'
  | 'agent_builder'
  | 'project_next_step'
  | 'business_decision'
  | 'general';

export type CommitteeRoleAnswer = {
  role: string;
  stance: 'support' | 'caution' | 'challenge' | 'execute' | 'protect';
  answer: string;
  risk: string;
  action: string;
};

export type CommitteeAskResult = {
  phase: '119.1';
  label: 'Gremium Ask MVP Plus';
  question: string;
  intent: CommitteeIntent;
  roles: CommitteeRoleAnswer[];
  finalAnswer: {
    headline: string;
    recommendation: string;
    directAnswer: string;
    reasoning: string[];
    risks: string[];
    nextActions: string[];
  };
  usableStatus: 'local-testable-plus';
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
  return trimmed || 'Welche Entscheidung soll das Gremium bewerten?';
}

function detectIntent(question: string): CommitteeIntent {
  const q = question.toLowerCase();
  if (q.includes('wetter') || q.includes('regen') || q.includes('sonne') || q.includes('temperatur')) return 'weather';
  if (q.includes('live') || q.includes('provider') || q.includes('ki-modell') || q.includes('modell') || q.includes('schalten')) return 'live_switch';
  if (q.includes('intern') || q.includes('vertraulich') || q.includes('kunde') || q.includes('kalkulation') || q.includes('betriebsintern')) return 'internal_data';
  if (q.includes('agent') && (q.includes('bauen') || q.includes('erstellen') || q.includes('spezial') || q.includes('trading') || q.includes('immobilien'))) return 'agent_builder';
  if (q.includes('nächste') || q.includes('naechste') || q.includes('weiter') || q.includes('phase') || q.includes('roadmap')) return 'project_next_step';
  if (q.includes('soll ich') || q.includes('entscheidung') || q.includes('priorität') || q.includes('prioritaet') || q.includes('lohnt')) return 'business_decision';
  return 'general';
}

const intentText: Record<CommitteeIntent, { direct: string; recommendation: string; headline: string }> = {
  weather: {
    headline: 'Wetterfrage erkannt.',
    recommendation: 'Nicht raten. Wetter braucht Web- oder Wetter-Tool-Freigabe.',
    direct: 'Ich kann das Wetter aktuell lokal nicht zuverlässig beantworten, weil Internetzugriff und Wetter-Tool in diesem Agenten noch deaktiviert sind. Der richtige nächste Schritt wäre: Wetter-Tool oder Webzugriff später über ein Freigabe-Gate anschließen.',
  },
  live_switch: {
    headline: 'Live-Schaltungsfrage erkannt.',
    recommendation: 'Noch nicht live schalten. Erst lokale Qualität verbessern und Provider-Gate vorbereiten.',
    direct: 'Der Agent ist jetzt lokal testbar, aber noch nicht live mit KI-Modell. Vor Live-Betrieb brauchen wir bessere frageabhängige Antworten, Datenschutzprüfung, Provider-Konfiguration, Kosten-/Timeout-Schutz und eine klare Freigabe.',
  },
  internal_data: {
    headline: 'Interne oder sensible Daten erkannt.',
    recommendation: 'Nicht ungeprüft an externe Provider senden.',
    direct: 'Bei internen Daten muss der Agent lokal arbeiten, anonymisieren oder zuerst deine Freigabe einholen. Noch ist kein echter Provider aktiv, deshalb bleiben Daten lokal im Testflow.',
  },
  agent_builder: {
    headline: 'Spezialagenten-Idee erkannt.',
    recommendation: 'Spezialagent als Entwurf planen, aber erst nach Freigabe bauen.',
    direct: 'Das ist ein sinnvoller Kandidat für einen Spezialagenten. Der Master-Agent sollte später Agentenprofile, Ziele, Datenquellen, Grenzen und Testfragen vorschlagen, bevor Code erzeugt wird.',
  },
  project_next_step: {
    headline: 'Projekt-/Roadmap-Frage erkannt.',
    recommendation: 'Nächster Schritt: Master-Agent-Router und Datenschutz-Gate vorbereiten.',
    direct: 'Für dieses Projekt ist der nächste sinnvolle Schritt, den Ask-Flow intelligenter zu machen und danach den Master-Agent-Router aufzubauen: direkte Antwort oder Gremium, plus Datenschutzentscheidung.',
  },
  business_decision: {
    headline: 'Entscheidungsfrage erkannt.',
    recommendation: 'Gremium nutzen und danach eine konkrete nächste Aktion wählen.',
    direct: 'Diese Frage passt gut zum Gremium. Der Agent sollte Chancen, Risiken, Umsetzbarkeit, Datenschutz und Wirtschaftlichkeit getrennt bewerten und daraus eine Empfehlung ableiten.',
  },
  general: {
    headline: 'Allgemeine Frage erkannt.',
    recommendation: 'Lokal beantworten, wenn möglich; bei Unsicherheit Gremium oder später Provider nutzen.',
    direct: 'Ich kann die Frage lokal grob einordnen. Für echte Wissensfragen oder aktuelle Daten braucht der Master-Agent später ein Modell, Webzugriff oder ein passendes Tool mit Freigabe.',
  },
};

function buildRoles(intent: CommitteeIntent, question: string): CommitteeRoleAnswer[] {
  const info = intentText[intent];
  return [
    {
      role: 'Visionär',
      stance: 'support',
      answer: intent === 'weather'
        ? 'Ein Wetter-Tool wäre ein guter erster externer Tool-Test, weil der Nutzen sofort sichtbar ist.'
        : 'Die Frage kann genutzt werden, um den Master-Agenten schrittweise nützlicher zu machen.',
      risk: 'Wenn der Agent zu früh zu viel verspricht, entsteht falsches Vertrauen.',
      action: 'Nutzen klar benennen und nur Funktionen anzeigen, die im aktuellen Modus wirklich aktiv sind.',
    },
    {
      role: 'Skeptiker',
      stance: 'challenge',
      answer: 'Die Antwort muss ehrlich markieren, was lokal möglich ist und was noch nicht aktiv ist.',
      risk: intent === 'weather'
        ? 'Ohne Live-Daten wäre jede konkrete Wetterantwort geraten.'
        : 'Ohne klare Grenzen kann der Nutzer lokale Demo-Antworten mit echten KI-Antworten verwechseln.',
      action: 'Antwortquelle, Modus und Grenzen direkt in der Antwort anzeigen.',
    },
    {
      role: 'Umsetzer',
      stance: 'execute',
      answer: 'Der Flow funktioniert technisch. Jetzt muss die Antwort stärker von der Frage abhängen.',
      risk: 'Wenn die Antworten generisch bleiben, bringt der lokale Test wenig Erkenntnis.',
      action: 'Fragetyp erkennen, passende Antwortbausteine wählen und nächste Testfragen sammeln.',
    },
    {
      role: 'Datenschutz & Risiko',
      stance: 'protect',
      answer: intent === 'internal_data'
        ? 'Diese Eingabe muss als sensibel behandelt werden. Externe Weitergabe nur anonymisiert oder nach Freigabe.'
        : 'Provider, Internet und externe Tools bleiben aktuell blockiert.',
      risk: 'Betriebsinterne Daten dürfen später nicht versehentlich an externe Dienste gehen.',
      action: 'Vor Provider-Aktivierung ein Datenklassifizierungs- und Freigabe-Gate bauen.',
    },
    {
      role: 'Wirtschaftlichkeit & Praxisnutzen',
      stance: 'support',
      answer: 'Der nächste Nutzen entsteht, wenn der Agent echte Alltagsfragen unterscheidbar beantwortet.',
      risk: 'Zu viele technische Seiten ohne Nutzwert verlangsamen den Fortschritt.',
      action: 'Mit 10 echten Fragen testen und daraus die wichtigsten Agentenfähigkeiten priorisieren.',
    },
  ];
}

export function askCommitteeLocal(question: string): CommitteeAskResult {
  const q = normalizeQuestion(question);
  const intent = detectIntent(q);
  const info = intentText[intent];
  const roles = buildRoles(intent, q);

  return {
    phase: '119.1',
    label: 'Gremium Ask MVP Plus',
    question: q,
    intent,
    roles,
    finalAnswer: {
      headline: info.headline,
      recommendation: info.recommendation,
      directAnswer: info.direct,
      reasoning: [
        'Die Frage wurde lokal klassifiziert als: ' + intent + '.',
        'Das 5er-Gremium wurde mit Visionär, Skeptiker, Umsetzer, Datenschutz & Risiko sowie Wirtschaftlichkeit & Praxisnutzen ausgeführt.',
        'Es wurden keine Provider-, Internet- oder Modellaufrufe ausgeführt.',
      ],
      risks: roles.map((role) => role.risk),
      nextActions: [
        'Teste mehrere echte Fragen auf /cmt/ask.',
        'Notiere Fragen, bei denen die lokale Antwort noch zu schwach ist.',
        'Danach Master-Agent-Router und Datenschutz-Gate vorbereiten.',
      ],
    },
    usableStatus: 'local-testable-plus',
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

export function getCommitteeAskDemo() {
  return askCommitteeLocal('Soll ich den Gremium-Agenten jetzt live schalten oder erst verbessern?');
}
`);

write('frontend/app/cmt/ask/page.tsx', `'use client';

import { useState } from 'react';
import type { CommitteeAskResult } from '../../../lib/cmt-ask';

export default function CommitteeAskPage() {
  const [question, setQuestion] = useState('Soll ich den Gremium-Agenten jetzt live schalten oder erst verbessern?');
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
        <h1>Phase 119.1</h1>
        <h2>Gremium Ask MVP Plus</h2>
        <p><strong>Status:</strong> Lokal testbar plus. Noch nicht live mit KI-Modell.</p>
        <p>Der Agent erkennt jetzt einfache Fragetypen und nutzt ein 5er-Gremium.</p>
      </section>

      <section style={card}>
        <h3>Frage an den Master-/Gremium-Agenten</h3>
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
            <p><strong>Frage:</strong> {result.question}</p>
            <p><strong>Erkannter Typ:</strong> {result.intent}</p>
            <p><strong>Direktantwort:</strong> {result.finalAnswer.directAnswer}</p>
            <p><strong>Empfehlung:</strong> {result.finalAnswer.recommendation}</p>
            <p><strong>Usable Status:</strong> {result.usableStatus}</p>
          </article>

          <article style={card}>
            <h3>5er-Gremium</h3>
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

write('README_PHASE119_1.md', `# Phase 119.1 - Gremium Ask MVP Plus

Verbessert den lokal testbaren Ask-Flow.

Kurz-Namen:

- Store: frontend/lib/cmt-ask.ts
- API: /api/cmt/ask
- UI: /cmt/ask
- Patch: scripts/p119-1.cjs
- Verify: scripts/v119-1.cjs

Funktion:

- Frage-Typ lokal erkennen
- Wetter, Live-Schaltung, interne Daten, Agentenbau, Roadmap und Entscheidungen unterscheiden
- 5er-Gremium nutzen: Visionaer, Skeptiker, Umsetzer, Datenschutz & Risiko, Wirtschaftlichkeit & Praxisnutzen
- Direktantwort, Empfehlung und Grenzen sichtbar machen

Status:

- lokal testbar plus
- noch nicht live mit KI-Modell
- kein Internetzugriff
- keine Provider-Calls

Testseite:

- /cmt/ask
`);

write('scripts/v119-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-ask.ts', 'CommitteeIntent'],
  ['frontend/lib/cmt-ask.ts', 'detectIntent'],
  ['frontend/lib/cmt-ask.ts', "phase: '119.1'"],
  ['frontend/lib/cmt-ask.ts', "label: 'Gremium Ask MVP Plus'"],
  ['frontend/lib/cmt-ask.ts', "usableStatus: 'local-testable-plus'"],
  ['frontend/lib/cmt-ask.ts', 'Visionär'],
  ['frontend/lib/cmt-ask.ts', 'Skeptiker'],
  ['frontend/lib/cmt-ask.ts', 'Datenschutz & Risiko'],
  ['frontend/lib/cmt-ask.ts', 'internetAccessEnabled: false'],
  ['frontend/lib/cmt-ask.ts', 'liveModelEnabled: false'],
  ['frontend/app/api/cmt/ask/route.ts', 'askCommitteeLocal'],
  ['frontend/app/cmt/ask/page.tsx', '5er-Gremium'],
  ['frontend/app/cmt/ask/page.tsx', 'Erkannter Typ'],
  ['README_PHASE119_1.md', 'Gremium Ask MVP Plus'],
  ['package.json', 'phase119:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 119.1 Gremium Ask MVP Plus verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase119:1:verify'] = 'node scripts/v119-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 119.1 Gremium Ask MVP Plus patch applied.');
