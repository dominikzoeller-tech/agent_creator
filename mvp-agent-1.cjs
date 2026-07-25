const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const lib = String.raw`export type SecureMasterAgentRoute =
  | 'direct'
  | 'committee'
  | 'privacy_gate'
  | 'tool_required'
  | 'agent_builder';

export type SecureMasterAgentIntent =
  | 'general'
  | 'live_switch'
  | 'internal_data'
  | 'committee_decision'
  | 'tool_required'
  | 'agent_builder'
  | 'project_next_step';

export type SecureMasterPrivacyDecision =
  | 'allow_local_only'
  | 'require_anonymization'
  | 'block_external';

export type SecureMasterSafetyState = {
  providerEnabled: false;
  internetEnabled: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  persistedOnServer: false;
  persistedInBrowser: 'browser_optional_local';
};

export type SecureMasterCommitteeMember = {
  role: string;
  focus: string;
  opinion: string;
};

export type SecureMasterAgentLog = {
  id: string;
  createdAt: string;
  input: string;
  inputPreview: string;
  intent: SecureMasterAgentIntent;
  route: SecureMasterAgentRoute;
  privacyDecision: SecureMasterPrivacyDecision;
  answer: string;
  nextSteps: string[];
  committee: SecureMasterCommitteeMember[];
  safetyState: SecureMasterSafetyState;
};

export const SECURE_MASTER_AGENT_LOG_KEY = 'cmt.secureMaster.agent.mvp.logs.v1';

export const secureMasterSafetyState: SecureMasterSafetyState = {
  providerEnabled: false,
  internetEnabled: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  persistedOnServer: false,
  persistedInBrowser: 'browser_optional_local',
};

function normalize(input: string): string {
  return input.toLowerCase().trim();
}

function includesAny(input: string, terms: string[]): boolean {
  return terms.some((term) => input.includes(term));
}

export function detectSecureMasterIntent(input: string): SecureMasterAgentIntent {
  const value = normalize(input);

  if (includesAny(value, ['wetter', 'news', 'aktuell', 'kurs', 'preis heute', 'internet', 'recherchier', 'suche im web'])) {
    return 'tool_required';
  }

  if (includesAny(value, ['kundendaten', 'kunde ', 'intern', 'vertraulich', 'geheim', 'angebot', 'kalkulation', 'mitarbeiter', 'personendaten'])) {
    return 'internal_data';
  }

  if (includesAny(value, ['agent bauen', 'agenten bauen', 'spezialagent', 'trading agent', 'immobilien agent', 'bauleiter entlasten'])) {
    return 'agent_builder';
  }

  if (includesAny(value, ['live schalten', 'aktivieren', 'provider', 'ki-modell', 'modell anschliessen', 'modell anschließen'])) {
    return 'live_switch';
  }

  if (includesAny(value, ['soll ich', 'sollen wir', 'entscheidung', 'priorisieren', 'strategie', 'risiko', 'gremium'])) {
    return 'committee_decision';
  }

  if (includesAny(value, ['nächster schritt', 'naechster schritt', 'roadmap', 'was als nächstes', 'weiterbauen', 'verbessern'])) {
    return 'project_next_step';
  }

  return 'general';
}

export function routeSecureMasterAgent(intent: SecureMasterAgentIntent): SecureMasterAgentRoute {
  if (intent === 'internal_data') return 'privacy_gate';
  if (intent === 'tool_required') return 'tool_required';
  if (intent === 'agent_builder') return 'agent_builder';
  if (intent === 'committee_decision' || intent === 'live_switch' || intent === 'project_next_step') return 'committee';
  return 'direct';
}

export function decidePrivacy(input: string): SecureMasterPrivacyDecision {
  const value = normalize(input);
  if (includesAny(value, ['geheim', 'passwort', 'api key', 'token', 'privat', 'personenbezogen'])) {
    return 'block_external';
  }
  if (includesAny(value, ['kunde', 'kundendaten', 'angebot', 'kalkulation', 'mitarbeiter', 'intern', 'vertraulich'])) {
    return 'require_anonymization';
  }
  return 'allow_local_only';
}

function buildCommittee(input: string, route: SecureMasterAgentRoute): SecureMasterCommitteeMember[] {
  if (route !== 'committee' && route !== 'agent_builder' && route !== 'privacy_gate') return [];

  return [
    {
      role: 'Visionär',
      focus: 'Chance und Zielbild',
      opinion: 'Der Master-Agent sollte auf eine zentrale Arbeitsseite fokussiert werden. Erst wenn der lokale Ablauf klar funktioniert, lohnt sich Live-KI.',
    },
    {
      role: 'Skeptiker',
      focus: 'Risiken und blinde Flecken',
      opinion: 'Nicht weiter neue Statusseiten bauen. Erst prüfen, ob Eingabe, Antwort, Datenschutzprüfung, Log und Verlauf in einem Flow sauber zusammenspielen.',
    },
    {
      role: 'Umsetzer',
      focus: 'Nächster konkreter Schritt',
      opinion: 'Eine einfache Agentenseite nutzen: Frage eingeben, lokal prüfen, Antwort anzeigen, Log im Browser speichern.',
    },
    {
      role: 'Datenschutz & Risiko',
      focus: 'Interne Daten und externe Weitergabe',
      opinion: 'Provider, Internet und externe Weitergabe bleiben blockiert. Interne Daten werden nur lokal verarbeitet oder später anonymisiert nach Freigabe.',
    },
    {
      role: 'Wirtschaftlichkeit & Praxisnutzen',
      focus: 'Nutzen im Alltag',
      opinion: 'Der Agent wird erst wertvoll, wenn er schnell echte Fragen sortiert, Entscheidungen vorbereitet und nachvollziehbare Logs erzeugt.',
    },
  ];
}

function buildAnswer(input: string, intent: SecureMasterAgentIntent, route: SecureMasterAgentRoute, privacyDecision: SecureMasterPrivacyDecision): string {
  if (!input.trim()) return 'Bitte eine Frage eingeben.';

  if (route === 'tool_required') {
    return 'Diese Frage benötigt wahrscheinlich Internet, aktuelle Daten oder ein externes Tool. Aktuell bleibt der Secure Master lokal: kein Internet, kein Provider, kein Live-Modell. Ich kann lokal erklären, welche Daten fehlen und wie ein Tool später sicher angebunden wird.';
  }

  if (route === 'privacy_gate') {
    return privacyDecision === 'block_external'
      ? 'Ich erkenne sensible oder geheime Inhalte. Externe Weitergabe ist blockiert. Diese Eingabe darf aktuell nur lokal bewertet werden.'
      : 'Ich erkenne interne oder geschäftliche Daten. Der sichere Weg ist: lokal bearbeiten oder vor einer späteren externen Modellnutzung anonymisieren und Freigabe einholen.';
  }

  if (route === 'agent_builder') {
    return 'Das klingt nach einem möglichen Spezialagenten. Ich würde zuerst ein Agentenprofil erstellen: Ziel, Eingaben, Datenquellen, Grenzen, Datenschutzregeln, Testfragen und Freigabepunkte. Aktuell wird noch kein Agent automatisch gebaut.';
  }

  if (intent === 'live_switch') {
    return 'Noch nicht live schalten. Der lokale Master-Agent-Flow sollte zuerst stabil sein: Eingabe, Datenschutzprüfung, lokale Antwort, Gremium bei Bedarf, Log, Verlauf und Export. Danach Provider-Gate und Live-Schalter kontrolliert aktivieren.';
  }

  if (route === 'committee') {
    return 'Diese Frage eignet sich für das 5er-Gremium. Lokale Empfehlung: Entscheidung nicht isoliert treffen, sondern Chance, Risiko, Umsetzung, Datenschutz und wirtschaftlichen Nutzen gemeinsam prüfen.';
  }

  return 'Lokale Antwort: Ich kann diese Frage im sicheren Trockenlauf einordnen. Aktuell wird nichts extern gesendet. Für echte KI-Antworten brauchen wir später ein freigegebenes Provider-Gate.';
}

function buildNextSteps(intent: SecureMasterAgentIntent, route: SecureMasterAgentRoute): string[] {
  if (route === 'tool_required') {
    return ['Toolbedarf markieren', 'Datenquelle definieren', 'später Web/Provider nur per Freigabe aktivieren'];
  }
  if (route === 'privacy_gate') {
    return ['nur lokal verarbeiten', 'interne Begriffe prüfen', 'Anonymisierung vorbereiten', 'vor externer Nutzung Freigabe verlangen'];
  }
  if (route === 'agent_builder') {
    return ['Spezialagenten-Ziel definieren', 'Eingaben und Ausgaben festlegen', 'Datenschutzgrenzen setzen', 'Testfragen sammeln'];
  }
  if (route === 'committee') {
    return ['Gremium prüfen lassen', 'Risiken notieren', 'Entscheidungsvorschlag ableiten', 'nächsten konkreten Schritt wählen'];
  }
  return ['lokal beantworten', 'bei Unsicherheit Gremium einschalten', 'Antwort im Browser-Log speichern'];
}

export function runSecureMasterLocalAgent(input: string): SecureMasterAgentLog {
  const intent = detectSecureMasterIntent(input);
  const route = routeSecureMasterAgent(intent);
  const privacyDecision = decidePrivacy(input);
  const committee = buildCommittee(input, route);

  return {
    id: 'agent_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    input,
    inputPreview: input.trim().slice(0, 160),
    intent,
    route,
    privacyDecision,
    answer: buildAnswer(input, intent, route, privacyDecision),
    nextSteps: buildNextSteps(intent, route),
    committee,
    safetyState: secureMasterSafetyState,
  };
}
`;

const page = String.raw`'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  SECURE_MASTER_AGENT_LOG_KEY,
  runSecureMasterLocalAgent,
  type SecureMasterAgentLog,
} from '@/lib/cmt-secure-master-agent-mvp';

const examples = [
  'Soll ich den Master-Agenten jetzt live schalten?',
  'Hier sind interne Kundendaten aus einer Kalkulation. Was soll ich tun?',
  'Wie wird morgen das Wetter?',
  'Baue mir später einen Trading-Agenten.',
  'Was ist der nächste sinnvolle Schritt im Projekt?',
];

function readLogs(): SecureMasterAgentLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SECURE_MASTER_AGENT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: SecureMasterAgentLog[]) {
  window.localStorage.setItem(SECURE_MASTER_AGENT_LOG_KEY, JSON.stringify(logs.slice(0, 50), null, 2));
}

export default function SecureMasterAgentMvpPage() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<SecureMasterAgentLog[]>([]);
  const [current, setCurrent] = useState<SecureMasterAgentLog | null>(null);

  useEffect(() => {
    const loaded = readLogs();
    setLogs(loaded);
    setCurrent(loaded[0] ?? null);
  }, []);

  const safety = useMemo(() => current?.safetyState, [current]);

  function runAgent() {
    const clean = input.trim();
    if (!clean) return;
    const result = runSecureMasterLocalAgent(clean);
    const nextLogs = [result, ...logs].slice(0, 50);
    setCurrent(result);
    setLogs(nextLogs);
    writeLogs(nextLogs);
  }

  function clearLogs() {
    window.localStorage.removeItem(SECURE_MASTER_AGENT_LOG_KEY);
    setLogs([]);
    setCurrent(null);
  }

  function exportLogs() {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: 'secure_master_agent_mvp_local_browser',
      storageKey: SECURE_MASTER_AGENT_LOG_KEY,
      logs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'secure-master-agent-logs.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-cyan-300">Secure Master Agent MVP</p>
              <h1 className="mt-1 text-3xl font-semibold">Zentrale Agent-Arbeitsseite</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Diese Seite ersetzt den weiteren Status-/Entry-/Handoff-Ausbau. Hier testest du den lokalen Master-Agent-Flow: Frage eingeben, Safety-Check, Routing, Gremium bei Bedarf, lokaler Verlauf.
              </p>
            </div>
            <div className="grid gap-2 text-xs text-slate-200">
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1">lokal testbar</span>
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1">kein Live-Modell</span>
              <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1">keine externe Weitergabe</span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold">Frage an den Master-Agenten</h2>
            <textarea
              className="mt-4 min-h-36 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100 outline-none focus:border-cyan-400"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Stelle eine Frage, z. B. Soll ich den Agenten live schalten?"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={runAgent} className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
                Lokal prüfen
              </button>
              <button onClick={exportLogs} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300">
                Logs exportieren
              </button>
              <button onClick={clearLogs} className="rounded-xl border border-rose-700 px-4 py-2 text-sm text-rose-200 hover:border-rose-300">
                Browser-Logs löschen
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  onClick={() => setInput(example)}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold">Safety State</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <div>Provider: <strong>{String(safety?.providerEnabled ?? false)}</strong></div>
              <div>Internet: <strong>{String(safety?.internetEnabled ?? false)}</strong></div>
              <div>Live-Modell: <strong>{String(safety?.liveModelEnabled ?? false)}</strong></div>
              <div>Externe Weitergabe: <strong>{String(safety?.externalSharingAllowed ?? false)}</strong></div>
              <div>Server-Speicherung: <strong>{String(safety?.persistedOnServer ?? false)}</strong></div>
              <div>Browser-Speicherung: <strong>{safety?.persistedInBrowser ?? 'browser_optional_local'}</strong></div>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Status: Dieser MVP arbeitet lokal. Er ruft kein Modell auf, nutzt kein Internet und sendet keine Daten extern.
            </p>
          </div>
        </section>

        {current && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-800 px-3 py-1">Intent: {current.intent}</span>
              <span className="rounded-full bg-slate-800 px-3 py-1">Route: {current.route}</span>
              <span className="rounded-full bg-slate-800 px-3 py-1">Privacy: {current.privacyDecision}</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">Lokale Antwort</h2>
            <p className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">{current.answer}</p>

            <h3 className="mt-5 font-semibold">Nächste Schritte</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {current.nextSteps.map((step) => <li key={step}>{step}</li>)}
            </ul>

            {current.committee.length > 0 && (
              <div className="mt-5">
                <h3 className="font-semibold">5er-Gremium</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {current.committee.map((member) => (
                    <article key={member.role} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <h4 className="font-semibold text-cyan-200">{member.role}</h4>
                      <p className="mt-1 text-xs text-slate-400">{member.focus}</p>
                      <p className="mt-2 text-sm text-slate-300">{member.opinion}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">Lokaler Verlauf</h2>
          <p className="mt-1 text-sm text-slate-400">Speicherort: Browser localStorage. Keine Server-Speicherung.</p>
          <div className="mt-4 grid gap-3">
            {logs.length === 0 && <p className="text-sm text-slate-400">Noch keine lokalen Logs.</p>}
            {logs.map((log) => (
              <button
                key={log.id}
                onClick={() => setCurrent(log)}
                className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-left hover:border-cyan-400"
              >
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                  <span>Intent: {log.intent}</span>
                  <span>Route: {log.route}</span>
                  <span>Privacy: {log.privacyDecision}</span>
                </div>
                <p className="mt-2 text-sm text-slate-200">{log.inputPreview}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
`;

const verify = String.raw`const fs = require('fs');
const path = require('path');
const root = process.cwd();
const must = [
  'frontend/lib/cmt-secure-master-agent-mvp.ts',
  'frontend/app/cmt/master/secure/agent/page.tsx',
  'scripts/mvp-agent-1.cjs',
  'scripts/v-mvp-agent-1.cjs',
];
let ok = true;
for (const rel of must) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error('[missing]', rel);
    ok = false;
  } else {
    console.log('[ok]', rel);
  }
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const key of ['mvp:verify', 'agent:mvp:verify']) {
  if (!pkg.scripts || !pkg.scripts[key]) {
    console.error('[missing script]', key);
    ok = false;
  } else {
    console.log('[ok script]', key, '=>', pkg.scripts[key]);
  }
}
const page = fs.readFileSync(path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx'), 'utf8');
for (const token of ['Zentrale Agent-Arbeitsseite', 'Lokal prüfen', '5er-Gremium', 'keine externe Weitergabe']) {
  if (!page.includes(token)) {
    console.error('[missing token]', token);
    ok = false;
  }
}
if (!ok) process.exit(1);
console.log('[OK] mvp agent verify passed');
`;

write('frontend/lib/cmt-secure-master-agent-mvp.ts', lib);
write('frontend/app/cmt/master/secure/agent/page.tsx', page);
write('scripts/mvp-agent-1.cjs', fs.readFileSync(__filename, 'utf8'));
write('scripts/v-mvp-agent-1.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp:verify'] = 'node scripts/v-mvp-agent-1.cjs';
pkg.scripts['agent:mvp:verify'] = 'node scripts/v-mvp-agent-1.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write]', 'package.json scripts mvp:verify agent:mvp:verify');
console.log('[OK] MVP agent patch applied');
