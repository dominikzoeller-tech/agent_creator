'use client';

import { useEffect, useState } from 'react';
import { SECURE_MASTER_AGENT_LOG_KEY, runSecureMasterLocalAgent, type AgentLog } from '../../../../../lib/cmt-secure-master-agent-mvp';
import { secureMasterProviderGateStatus } from '../../../../../lib/cmt-secure-master-provider-gate';
import { secureMasterProviderConfig } from '../../../../../lib/cmt-secure-master-provider-config';
import { secureMasterProviderSetupPreview } from '../../../../../lib/cmt-secure-master-provider-setup-preview';
import { secureMasterProviderValidationPreview } from '../../../../../lib/cmt-secure-master-provider-validation-preview';
import { secureMasterApprovalDecisionPreview } from '../../../../../lib/cmt-secure-master-approval-decision-preview';

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
          <h2>Provider-Konfiguration</h2>
          <p style={{ color: '#cbd5e1' }}>Vorbereitet, aber blockiert. Es wird kein Provider aufgerufen.</p>
          <p>Provider aktiv: <b>{String(secureMasterProviderConfig.providerEnabled)}</b></p>
          <p>Ausgewählter Provider: <b>{secureMasterProviderConfig.selectedProvider}</b></p>
          <p>Ausgewähltes Modell: <b>{secureMasterProviderConfig.selectedModel}</b></p>
          <p>Blockadegrund: {secureMasterProviderConfig.activationBlockedReason}</p>
          <p>Nächster Schritt: {secureMasterProviderConfig.nextStep}</p>
          <h3>Spätere ENV-Keys</h3>
          <ul>{secureMasterProviderConfig.envKeysRequiredLater.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>Spätere Provider-Optionen</h3>
          <ul>{secureMasterProviderConfig.supportedProvidersLater.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Provider-Setup Vorschau</h2>
          <p style={{ color: '#fbbf24' }}>{secureMasterProviderSetupPreview.warning}</p>
          <div style={{ display: 'grid', gap: 10, maxWidth: 620 }}>
            <label>Provider <input disabled placeholder='none' style={{ width: '100%', padding: 10, borderRadius: 8, background: '#020617', color: '#94a3b8', border: '1px solid #334155' }} /></label>
            <label>Model <input disabled placeholder='none' style={{ width: '100%', padding: 10, borderRadius: 8, background: '#020617', color: '#94a3b8', border: '1px solid #334155' }} /></label>
            <label>API-Key Platzhalter <input disabled placeholder='nicht eingeben' style={{ width: '100%', padding: 10, borderRadius: 8, background: '#020617', color: '#94a3b8', border: '1px solid #334155' }} /></label>
            <label>Budget/Token-Limit <input disabled placeholder='später' style={{ width: '100%', padding: 10, borderRadius: 8, background: '#020617', color: '#94a3b8', border: '1px solid #334155' }} /></label>
          </div>
          <p>Speichern erlaubt: <b>{String(secureMasterProviderSetupPreview.saveEnabled)}</b></p>
          <p>Aktivieren erlaubt: <b>{String(secureMasterProviderSetupPreview.activationEnabled)}</b></p>
          <p>Secrets persistieren: <b>{String(!secureMasterProviderSetupPreview.noSecretPersistence)}</b></p>
          <p>Provider-Call: <b>{String(!secureMasterProviderSetupPreview.noProviderCall)}</b></p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterProviderSetupPreview.nextStep}</p>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Provider-Validierung Vorschau</h2>
          <p style={{ color: '#fbbf24' }}>{secureMasterProviderValidationPreview.blockerSummary}</p>
          <p>Validierung vorbereitet: <b>{String(secureMasterProviderValidationPreview.validationPrepared)}</b></p>
          <p>Secrets speichern erlaubt: <b>{String(secureMasterProviderValidationPreview.canPersistSecrets)}</b></p>
          <p>Provider-Call erlaubt: <b>{String(secureMasterProviderValidationPreview.canCallProvider)}</b></p>
          <p>Live-Aktivierung erlaubt: <b>{String(secureMasterProviderValidationPreview.liveActivationAllowed)}</b></p>
          <h3>Validierungsregeln</h3>
          <ul>{secureMasterProviderValidationPreview.rules.map((item) => <li key={item}>{item}</li>)}</ul>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterProviderValidationPreview.nextStep}</p>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Lokaler Freigabeentscheid</h2>
          <p style={{ color: '#fbbf24' }}>Externe Sendung bleibt blockiert. Diese Auswahl ist nur eine lokale Vorschau.</p>
          <p>Standard: <b>{secureMasterApprovalDecisionPreview.defaultDecision}</b></p>
          <p>Provider-Call blockiert: <b>{String(secureMasterApprovalDecisionPreview.noProviderCall)}</b></p>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {secureMasterApprovalDecisionPreview.allowedDecisions.map((decision) => (
              <button key={decision} disabled style={{ textAlign: 'left', border: '1px solid #334155', borderRadius: 12, background: '#020617', color: '#e5e7eb', padding: 12 }}>
                <b>{decision}</b> — {secureMasterApprovalDecisionPreview.explanations[decision]}
              </button>
            ))}
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterApprovalDecisionPreview.nextStep}</p>
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
