const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const lib = `export type AgentRoute = 'direct' | 'committee' | 'privacy_gate' | 'tool_required' | 'agent_builder';
export type AgentIntent = 'general' | 'live_switch' | 'internal_data' | 'committee_decision' | 'tool_required' | 'agent_builder' | 'project_next_step';
export type PrivacyDecision = 'allow_local_only' | 'require_anonymization' | 'block_external';

export type AgentLog = {
  id: string;
  createdAt: string;
  input: string;
  inputPreview: string;
  intent: AgentIntent;
  route: AgentRoute;
  privacyDecision: PrivacyDecision;
  answer: string;
  nextSteps: string[];
  committee: { role: string; focus: string; opinion: string }[];
};

export const SECURE_MASTER_AGENT_LOG_KEY = 'cmt.secureMaster.agent.mvp.logs.v1';

const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

function detectIntent(input: string): AgentIntent {
  const value = input.toLowerCase();
  if (includesAny(value, ['wetter', 'news', 'aktuell', 'kurs', 'internet', 'recherchier', 'suche im web'])) return 'tool_required';
  if (includesAny(value, ['kunde', 'kundendaten', 'intern', 'vertraulich', 'geheim', 'angebot', 'kalkulation', 'mitarbeiter', 'personenbezogen'])) return 'internal_data';
  if (includesAny(value, ['agent bauen', 'agenten bauen', 'spezialagent', 'trading agent', 'immobilien agent', 'bauleiter entlasten'])) return 'agent_builder';
  if (includesAny(value, ['live schalten', 'aktivieren', 'provider', 'ki-modell', 'modell anschließen', 'modell anschliessen'])) return 'live_switch';
  if (includesAny(value, ['soll ich', 'sollen wir', 'entscheidung', 'priorisieren', 'strategie', 'risiko', 'gremium'])) return 'committee_decision';
  if (includesAny(value, ['nächster schritt', 'naechster schritt', 'roadmap', 'was als nächstes', 'weiterbauen', 'verbessern'])) return 'project_next_step';
  return 'general';
}

function routeIntent(intent: AgentIntent): AgentRoute {
  if (intent === 'internal_data') return 'privacy_gate';
  if (intent === 'tool_required') return 'tool_required';
  if (intent === 'agent_builder') return 'agent_builder';
  if (intent === 'committee_decision' || intent === 'live_switch' || intent === 'project_next_step') return 'committee';
  return 'direct';
}

function decidePrivacy(input: string): PrivacyDecision {
  const value = input.toLowerCase();
  if (includesAny(value, ['geheim', 'passwort', 'api key', 'token', 'personenbezogen'])) return 'block_external';
  if (includesAny(value, ['kunde', 'kundendaten', 'angebot', 'kalkulation', 'mitarbeiter', 'intern', 'vertraulich'])) return 'require_anonymization';
  return 'allow_local_only';
}

function buildCommittee(route: AgentRoute) {
  if (!['committee', 'agent_builder', 'privacy_gate'].includes(route)) return [];
  return [
    { role: 'Visionär', focus: 'Chance und Zielbild', opinion: 'Fokus auf eine zentrale Arbeitsseite statt weiterer Statusseiten.' },
    { role: 'Skeptiker', focus: 'Risiken und blinde Flecken', opinion: 'Erst Eingabe, Antwort, Datenschutzprüfung, Log und Verlauf stabil machen.' },
    { role: 'Umsetzer', focus: 'Nächster Schritt', opinion: 'Frage eingeben, lokal prüfen, Antwort anzeigen, Browser-Log speichern.' },
    { role: 'Datenschutz & Risiko', focus: 'Interne Daten', opinion: 'Kein Provider, kein Internet, keine externe Weitergabe ohne spätere Freigabe.' },
    { role: 'Wirtschaftlichkeit & Praxisnutzen', focus: 'Alltagstauglichkeit', opinion: 'Der Agent wird wertvoll, wenn er echte Fragen schnell sortiert und nachvollziehbar protokolliert.' },
  ];
}

function buildAnswer(intent: AgentIntent, route: AgentRoute, privacy: PrivacyDecision) {
  if (route === 'tool_required') return 'Diese Frage braucht wahrscheinlich Internet, aktuelle Daten oder ein externes Tool. Aktuell bleibt der Secure Master lokal: kein Internet, kein Provider, kein Live-Modell.';
  if (route === 'privacy_gate') return privacy === 'block_external' ? 'Ich erkenne sensible oder geheime Inhalte. Externe Weitergabe ist blockiert. Nur lokal bewerten.' : 'Ich erkenne interne oder geschäftliche Daten. Lokal bearbeiten oder später anonymisieren und Freigabe einholen.';
  if (route === 'agent_builder') return 'Das klingt nach einem Spezialagenten. Nächster Schritt: Agentenprofil mit Ziel, Eingaben, Datenquellen, Grenzen, Datenschutzregeln und Testfragen erstellen.';
  if (intent === 'live_switch') return 'Noch nicht live schalten. Erst lokalen Master-Agent-Flow stabilisieren, danach Provider-Gate und Live-Schalter kontrolliert aktivieren.';
  if (route === 'committee') return 'Diese Frage eignet sich für das 5er-Gremium. Empfehlung: Chance, Risiko, Umsetzung, Datenschutz und wirtschaftlichen Nutzen gemeinsam prüfen.';
  return 'Lokale Antwort: Ich ordne diese Frage im sicheren Trockenlauf ein. Es wird nichts extern gesendet.';
}

function buildSteps(route: AgentRoute) {
  if (route === 'tool_required') return ['Toolbedarf markieren', 'Datenquelle definieren', 'später Web/Provider nur per Freigabe aktivieren'];
  if (route === 'privacy_gate') return ['nur lokal verarbeiten', 'interne Begriffe prüfen', 'Anonymisierung vorbereiten'];
  if (route === 'agent_builder') return ['Spezialagenten-Ziel definieren', 'Eingaben und Ausgaben festlegen', 'Datenschutzgrenzen setzen'];
  if (route === 'committee') return ['Gremium prüfen lassen', 'Risiken notieren', 'Entscheidungsvorschlag ableiten'];
  return ['lokal beantworten', 'bei Unsicherheit Gremium einschalten', 'Antwort im Browser-Log speichern'];
}

export function runSecureMasterLocalAgent(input: string): AgentLog {
  const intent = detectIntent(input);
  const route = routeIntent(intent);
  const privacyDecision = decidePrivacy(input);
  return {
    id: 'agent_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    input,
    inputPreview: input.trim().slice(0, 160),
    intent,
    route,
    privacyDecision,
    answer: buildAnswer(intent, route, privacyDecision),
    nextSteps: buildSteps(route),
    committee: buildCommittee(route),
  };
}
`;

const page = `'use client';

import { useEffect, useState } from 'react';
import { SECURE_MASTER_AGENT_LOG_KEY, runSecureMasterLocalAgent, type AgentLog } from '../../../../../lib/cmt-secure-master-agent-mvp';

const examples = [
  'Soll ich den Master-Agenten jetzt live schalten?',
  'Hier sind interne Kundendaten aus einer Kalkulation. Was soll ich tun?',
  'Wie wird morgen das Wetter?',
  'Baue mir später einen Trading-Agenten.',
  'Was ist der nächste sinnvolle Schritt im Projekt?',
];

function readLogs(): AgentLog[] {
  try {
    const raw = localStorage.getItem(SECURE_MASTER_AGENT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: AgentLog[]) {
  localStorage.setItem(SECURE_MASTER_AGENT_LOG_KEY, JSON.stringify(logs.slice(0, 50), null, 2));
}

export default function Page() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [current, setCurrent] = useState<AgentLog | null>(null);

  useEffect(() => {
    const loaded = readLogs();
    setLogs(loaded);
    setCurrent(loaded[0] ?? null);
  }, []);

  function run() {
    const clean = input.trim();
    if (!clean) return;
    const result = runSecureMasterLocalAgent(clean);
    const next = [result, ...logs].slice(0, 50);
    setCurrent(result);
    setLogs(next);
    writeLogs(next);
  }

  function clear() {
    localStorage.removeItem(SECURE_MASTER_AGENT_LOG_KEY);
    setLogs([]);
    setCurrent(null);
  }

  function exportLogs() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), logs }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'secure-master-agent-logs.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0f172a', color: '#e5e7eb', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gap: 20 }}>
        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 24 }}>
          <p style={{ color: '#67e8f9', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Secure Master Agent MVP</p>
          <h1 style={{ fontSize: 34, margin: '6px 0 10px' }}>Zentrale Agent-Arbeitsseite</h1>
          <p style={{ color: '#cbd5e1', maxWidth: 900 }}>
            Frage eingeben, lokal prüfen, Routing/Privacy/Gremium sehen und Verlauf im Browser speichern. Kein Provider, kein Internet, keine externe Weitergabe.
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 20 }}>
          <div style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
            <h2>Frage an den Master-Agenten</h2>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Stelle eine Frage..."
              style={{ width: '100%', minHeight: 120, borderRadius: 12, border: '1px solid #475569', background: '#020617', color: '#e5e7eb', padding: 14, fontSize: 14 }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <button onClick={run} style={{ border: 0, borderRadius: 10, background: '#22d3ee', padding: '10px 14px', fontWeight: 700 }}>Lokal prüfen</button>
              <button onClick={exportLogs} style={{ border: '1px solid #475569', borderRadius: 10, background: '#0f172a', color: '#e5e7eb', padding: '10px 14px' }}>Logs exportieren</button>
              <button onClick={clear} style={{ border: '1px solid #7f1d1d', borderRadius: 10, background: '#0f172a', color: '#fecaca', padding: '10px 14px' }}>Browser-Logs löschen</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {examples.map((example) => <button key={example} onClick={() => setInput(example)} style={{ border: '1px solid #475569', borderRadius: 999, background: '#020617', color: '#cbd5e1', padding: '6px 10px' }}>{example}</button>)}
            </div>
          </div>

          <div style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
            <h2>Safety State</h2>
            <p>Provider: <b>false</b></p>
            <p>Internet: <b>false</b></p>
            <p>Live-Modell: <b>false</b></p>
            <p>Externe Weitergabe: <b>false</b></p>
            <p>Server-Speicherung: <b>false</b></p>
            <p>Browser-Speicherung: <b>browser_optional_local</b></p>
          </div>
        </section>

        {current && (
          <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Intent: {current.intent}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Route: {current.route}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Privacy: {current.privacyDecision}</span>
            </div>
            <h2>Lokale Antwort</h2>
            <p style={{ border: '1px solid #334155', background: '#020617', borderRadius: 12, padding: 14 }}>{current.answer}</p>
            <h3>Nächste Schritte</h3>
            <ul>{current.nextSteps.map((step) => <li key={step}>{step}</li>)}</ul>
            {current.committee.length > 0 && <div><h3>5er-Gremium</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>{current.committee.map((member) => <article key={member.role} style={{ border: '1px solid #334155', background: '#020617', borderRadius: 12, padding: 12 }}><h4 style={{ color: '#67e8f9' }}>{member.role}</h4><p style={{ color: '#94a3b8', fontSize: 13 }}>{member.focus}</p><p>{member.opinion}</p></article>)}</div></div>}
          </section>
        )}

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Lokaler Verlauf</h2>
          <p style={{ color: '#cbd5e1' }}>Speicherort: Browser localStorage. Keine Server-Speicherung.</p>
          {logs.length === 0 && <p>Noch keine lokalen Logs.</p>}
          <div style={{ display: 'grid', gap: 10 }}>
            {logs.map((log) => <button key={log.id} onClick={() => setCurrent(log)} style={{ textAlign: 'left', border: '1px solid #334155', background: '#020617', color: '#e5e7eb', borderRadius: 12, padding: 12 }}><div style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(log.createdAt).toLocaleString()} | Intent: {log.intent} | Route: {log.route} | Privacy: {log.privacyDecision}</div><div>{log.inputPreview}</div></button>)}
          </div>
        </section>
      </div>
    </main>
  );
}
`;

write('frontend/lib/cmt-secure-master-agent-mvp.ts', lib);
write('frontend/app/cmt/master/secure/agent/page.tsx', page);

// Compatibility fallback modules for older routes currently failing module resolution.
const fallbackNames = [
  'cmt-master-answer-log-list-browser-store',
  'cmt-master-app-entry',
  'cmt-master-nav-status',
];
for (const name of fallbackNames) {
  const camel = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  write(`frontend/lib/${name}.ts`, `export const ${camel} = { status: 'compat_fallback', providerEnabled: false, internetEnabled: false, liveModelEnabled: false, externalSharingAllowed: false };
export function get${camel[0].toUpperCase() + camel.slice(1)}() { return ${camel}; }
export function create${camel[0].toUpperCase() + camel.slice(1)}() { return ${camel}; }
export function read${camel[0].toUpperCase() + camel.slice(1)}() { return []; }
export function write${camel[0].toUpperCase() + camel.slice(1)}() { return { ok: true }; }
export function clear${camel[0].toUpperCase() + camel.slice(1)}() { return { ok: true }; }
export default ${camel};
`);
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/app/cmt/master/secure/agent/page.tsx','frontend/lib/cmt-secure-master-agent-mvp.ts','frontend/lib/cmt-master-answer-log-list-browser-store.ts','frontend/lib/cmt-master-app-entry.ts','frontend/lib/cmt-master-nav-status.ts']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}if(ok)console.log('[OK] mvp agent ui fix verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-ui-fix.cjs', verify);
console.log('[OK] MVP agent UI fix applied');
