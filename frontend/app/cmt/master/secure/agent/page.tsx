'use client';

import { useEffect, useState } from 'react';
import { SECURE_MASTER_AGENT_LOG_KEY, runSecureMasterLocalAgent, type AgentLog } from '../../../../../lib/cmt-secure-master-agent-mvp';
import { secureMasterProviderGateStatus } from '../../../../../lib/cmt-secure-master-provider-gate';

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
            Frage eingeben, lokal prüfen, Routing/Privacy/Gremium sehen und Verlauf im Browser speichern. Kein Provider, kein Internet, keine externe Weitergabe. Dieser Bildschirm ist ab jetzt der Haupttestpunkt für den Master-Agenten.
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
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Live-Schaltung bleibt gesperrt, bis Provider-Gate, Datenschutzfreigabe und Build stabil sind.</p>
            <p>Provider: <b>false</b></p>
            <p>Internet: <b>false</b></p>
            <p>Live-Modell: <b>false</b></p>
            <p>Externe Weitergabe: <b>false</b></p>
            <p>Server-Speicherung: <b>false</b></p>
            <p>Browser-Speicherung: <b>browser_optional_local</b></p>
            <h3 style={{ marginTop: 18 }}>Provider-Gate Vorbereitung</h3>
            <p>Live-Ready: <b>{String(secureMasterProviderGateStatus.readyForLiveModel)}</b></p>
            <p>Freigabe erforderlich: <b>{String(secureMasterProviderGateStatus.approvalRequired)}</b></p>
            <p>Anonymisierung bei internen Daten: <b>{String(secureMasterProviderGateStatus.anonymizationRequiredForInternalData)}</b></p>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterProviderGateStatus.nextReadinessStep}</p>
          </div>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Voraussetzungen vor Live-KI</h2>
          <p style={{ color: '#cbd5e1' }}>Der Agent darf erst live mit einem Modell arbeiten, wenn diese Punkte erfüllt sind:</p>
          <ul>
            {secureMasterProviderGateStatus.requirements.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        {current && (
          <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Arbeitsmodus: {current.modeLabel ?? current.route}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Confidence: {current.confidence ?? 'medium'}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Priorität: {current.priority ?? 'medium'}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Live-Readiness: {current.liveReadiness ?? 'prepare_gate'}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Intent: {current.intent}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Route: {current.route}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Privacy: {current.privacyDecision}</span>
            </div>
            <h2>Lokale Antwort</h2>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Warum diese Einordnung? {current.reason ?? 'Lokale Regelentscheidung ohne Provider und ohne Internet.'}</p>
            <p style={{ border: '1px solid #334155', background: '#020617', borderRadius: 12, padding: 14 }}>{current.answer}</p>
            <h3>Nächste Haupt-Entscheidung</h3>
            <p style={{ color: '#cbd5e1' }}>Aktuell: lokal testen, Antwortqualität verbessern, Build stabil halten. Live-KI kommt erst nach explizitem Provider-Gate.</p>
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
