'use client';

import { useEffect, useState } from 'react';
import { SECURE_MASTER_AGENT_LOG_KEY, runSecureMasterLocalAgent, type AgentLog } from '../../../../../lib/cmt-secure-master-agent-mvp';
import { secureMasterProviderGateStatus } from '../../../../../lib/cmt-secure-master-provider-gate';
import { secureMasterProviderConfig } from '../../../../../lib/cmt-secure-master-provider-config';
import { secureMasterProviderSetupPreview } from '../../../../../lib/cmt-secure-master-provider-setup-preview';
import { secureMasterProviderValidationPreview } from '../../../../../lib/cmt-secure-master-provider-validation-preview';
import { secureMasterApprovalDecisionPreview } from '../../../../../lib/cmt-secure-master-approval-decision-preview';
import { secureMasterSprintState, type SecureMasterLocalApproval } from '../../../../../lib/cmt-secure-master-sprint-state';
import { secureMasterLiveGateCheck } from '../../../../../lib/cmt-secure-master-live-gate-check';
import { createSecureMasterProviderDryRun } from '../../../../../lib/cmt-secure-master-provider-dry-run';
import { SECURE_MASTER_DRY_RUN_HISTORY_KEY, createDryRunHistoryItem, type SecureMasterDryRunHistoryItem } from '../../../../../lib/cmt-secure-master-dry-run-history';
import { createSecureMasterDecisionSummary } from '../../../../../lib/cmt-secure-master-decision-summary';
import { createSecureMasterActionPlan } from '../../../../../lib/cmt-secure-master-action-plan';
import { createSecureMasterProviderAdapterDryRun } from '../../../../../lib/cmt-secure-master-provider-adapter-dry-run';
import { SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY, createAdapterDryRunHistoryItem, type SecureMasterAdapterDryRunHistoryItem } from '../../../../../lib/cmt-secure-master-adapter-dry-run-history';
import { createSecureMasterOperatorPanel } from '../../../../../lib/cmt-secure-master-operator-panel';
import { createSecureMasterProviderAdapterPipeline } from '../../../../../lib/cmt-secure-master-provider-adapter-pipeline';
import { createSecureMasterLiveReadinessMatrix } from '../../../../../lib/cmt-secure-master-live-readiness-matrix';
import { secureMasterWorkState } from '../../../../../lib/cmt-secure-master-work-state';
import { secureMasterSecretReadiness } from '../../../../../lib/cmt-secure-master-secret-readiness';
import { secureMasterEnvPreflight } from '../../../../../lib/cmt-secure-master-env-preflight';
import { secureMasterServerProviderConfigPreview } from '../../../../../lib/cmt-secure-master-server-provider-config';
import { secureMasterServerProviderDryRunContract } from '../../../../../lib/cmt-secure-master-server-provider-dry-run';
import { secureMasterServerProviderAdapterDisabled } from '../../../../../lib/cmt-secure-master-server-provider-adapter-disabled';
import { createSecureMasterProviderAdapterContract } from '../../../../../lib/cmt-secure-master-provider-adapter-contract';
import { createProviderAuditHistoryItem, SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY, createSecureMasterProviderAuditEnvelope, type SecureMasterProviderAuditHistoryItem } from '../../../../../lib/cmt-secure-master-provider-audit-envelope';

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
  const [workerTaskGoal, setWorkerTaskGoal] = useState('Build pruefen und Ergebnis fuer den Agenten speichern.');
  const [workerTaskResult, setWorkerTaskResult] = useState<any | null>(null);
  const [workerLastResult, setWorkerLastResult] = useState<any | null>(null);
  const [autoPatchGoal, setAutoPatchGoal] = useState('Mach den Agenten als Arbeitsagent nutzbar und reduziere Dashboard-Ballast.');
  const [autoPatchResult, setAutoPatchResult] = useState<any | null>(null);
  const [selfBuildGoalTop, setSelfBuildGoalTop] = useState('Baue dich selbst fertig zu einem wirklich nutzbaren Arbeitsagenten.');
  const [selfBuildPlanTop, setSelfBuildPlanTop] = useState<any | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [current, setCurrent] = useState<AgentLog | null>(null);
  const [approval, setApproval] = useState<SecureMasterLocalApproval>('local_only');
  const [dryRunResult, setDryRunResult] = useState<ReturnType<typeof createSecureMasterProviderDryRun> | null>(null);
  const [dryRunHistory, setDryRunHistory] = useState<SecureMasterDryRunHistoryItem[]>([]);
  const [adapterDryRun, setAdapterDryRun] = useState<ReturnType<typeof createSecureMasterProviderAdapterDryRun> | null>(null);
  const [adapterDryRunHistory, setAdapterDryRunHistory] = useState<SecureMasterAdapterDryRunHistoryItem[]>([]);
  const [providerAdapterContract, setProviderAdapterContract] = useState<ReturnType<typeof createSecureMasterProviderAdapterContract> | null>(null);
  const [serverDryRunResult, setServerDryRunResult] = useState<any | null>(null);
  const [providerAuditEnvelope, setProviderAuditEnvelope] = useState<ReturnType<typeof createSecureMasterProviderAuditEnvelope> | null>(null);
  const [providerAuditHistory, setProviderAuditHistory] = useState<SecureMasterProviderAuditHistoryItem[]>([]);
  const [serverAdapterDisabledResult, setServerAdapterDisabledResult] = useState<any | null>(null);
  const [secretPreflightResult, setSecretPreflightResult] = useState<any | null>(null);
  const [budgetPreflightResult, setBudgetPreflightResult] = useState<any | null>(null);
  const [liveTestGateResult, setLiveTestGateResult] = useState<any | null>(null);
  const [liveProviderTestResult, setLiveProviderTestResult] = useState<any | null>(null);
  const [livePreflightResult, setLivePreflightResult] = useState<any | null>(null);
  const [liveRunbookResult, setLiveRunbookResult] = useState<any | null>(null);

  useEffect(() => {
    const loaded = readLogs();
    setLogs(loaded);
    setCurrent(loaded[0] ?? null);
    const savedApproval = localStorage.getItem(secureMasterSprintState.localApprovalKey) as SecureMasterLocalApproval | null;
    if (savedApproval === 'local_only' || savedApproval === 'anonymize_then_send' || savedApproval === 'cancel') setApproval(savedApproval);
    try {
      const rawDryRuns = localStorage.getItem(SECURE_MASTER_DRY_RUN_HISTORY_KEY);
      if (rawDryRuns) setDryRunHistory(JSON.parse(rawDryRuns));
    } catch {}
    try {
      const rawAdapterDryRuns = localStorage.getItem(SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY);
      if (rawAdapterDryRuns) setAdapterDryRunHistory(JSON.parse(rawAdapterDryRuns));
    } catch {}
    try {
      const rawAuditHistory = localStorage.getItem(SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY);
      if (rawAuditHistory) setProviderAuditHistory(JSON.parse(rawAuditHistory));
    } catch {}
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

  async function loadLiveRunbook() {
    try {
      const response = await fetch('/api/cmt/master/secure/live-test/runbook');
      setLiveRunbookResult(await response.json());
    } catch (error) {
      setLiveRunbookResult({ ok: false, error: 'live_runbook_failed' });
    }
  }

  async function runLivePreflight() {
    try {
      const response = await fetch('/api/cmt/master/secure/live-test/preflight');
      setLivePreflightResult(await response.json());
    } catch (error) {
      setLivePreflightResult({ ok: false, error: 'live_preflight_failed' });
    }
  }

  async function runLiveProviderTest() {
    try {
      const response = await fetch('/api/cmt/master/secure/live-test/provider', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      setLiveProviderTestResult(await response.json());
    } catch (error) {
      setLiveProviderTestResult({ ok: false, error: 'live_provider_test_failed' });
    }
  }

  async function runLiveTestGate() {
    try {
      const response = await fetch('/api/cmt/master/secure/live-test/gate');
      setLiveTestGateResult(await response.json());
    } catch (error) {
      setLiveTestGateResult({ ok: false, error: 'live_test_gate_failed' });
    }
  }

  async function runBudgetPreflight() {
    try {
      const response = await fetch('/api/cmt/master/secure/budget/preflight');
      setBudgetPreflightResult(await response.json());
    } catch (error) {
      setBudgetPreflightResult({ ok: false, error: 'budget_preflight_failed' });
    }
  }

  async function runSecretPreflight() {
    try {
      const response = await fetch('/api/cmt/master/secure/secret/preflight');
      setSecretPreflightResult(await response.json());
    } catch (error) {
      setSecretPreflightResult({ ok: false, error: 'secret_preflight_failed' });
    }
  }

  async function runServerAdapterDisabled() {
    try {
      const response = await fetch('/api/cmt/master/secure/provider/adapter-disabled', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ inputPreview: input, approvalDecision: approval }),
      });
      setServerAdapterDisabledResult(await response.json());
    } catch (error) {
      setServerAdapterDisabledResult({ ok: false, error: 'server_adapter_disabled_failed' });
    }
  }

  function createProviderAuditEnvelope() {
    const envelope = createSecureMasterProviderAuditEnvelope({ input, approvalDecision: approval, privacyDecision: current?.privacyDecision });
    setProviderAuditEnvelope(envelope);
    const auditHistoryItem = createProviderAuditHistoryItem(envelope);
    const nextAuditHistory = [auditHistoryItem, ...providerAuditHistory].slice(0, 50);
    setProviderAuditHistory(nextAuditHistory);
    localStorage.setItem(SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY, JSON.stringify(nextAuditHistory, null, 2));
  }

  function clearProviderAuditHistory() {
    localStorage.removeItem(SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY);
    setProviderAuditHistory([]);
    setProviderAuditEnvelope(null);
  }

  async function runServerProviderDryRun() {
    try {
      const response = await fetch('/api/cmt/master/secure/provider/dry-run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ inputPreview: input, approvalDecision: approval }),
      });
      setServerDryRunResult(await response.json());
    } catch (error) {
      setServerDryRunResult({ ok: false, error: 'server_dry_run_failed' });
    }
  }

  function createAdapterContract() {
    setProviderAdapterContract(createSecureMasterProviderAdapterContract({ input, approvalDecision: approval, privacyDecision: current?.privacyDecision }));
  }

  function runAdapterDryRun() {
    const result = createSecureMasterProviderAdapterDryRun({ input, approvalDecision: approval, privacyDecision: current?.privacyDecision });
    setAdapterDryRun(result);
    const adapterHistoryItem = createAdapterDryRunHistoryItem(result);
    const nextAdapterHistory = [adapterHistoryItem, ...adapterDryRunHistory].slice(0, 25);
    setAdapterDryRunHistory(nextAdapterHistory);
    localStorage.setItem(SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY, JSON.stringify(nextAdapterHistory, null, 2));
  }

  function clearAdapterDryRunHistory() {
    localStorage.removeItem(SECURE_MASTER_ADAPTER_DRY_RUN_HISTORY_KEY);
    setAdapterDryRunHistory([]);
    setAdapterDryRun(null);
  }

  function runProviderDryRun() {
    const result = createSecureMasterProviderDryRun(input, approval);
    setDryRunResult(result);
    const historyItem = createDryRunHistoryItem(result, input, approval);
    const nextHistory = [historyItem, ...dryRunHistory].slice(0, 25);
    setDryRunHistory(nextHistory);
    localStorage.setItem(SECURE_MASTER_DRY_RUN_HISTORY_KEY, JSON.stringify(nextHistory, null, 2));
  }

  function clearDryRunHistory() {
    localStorage.removeItem(SECURE_MASTER_DRY_RUN_HISTORY_KEY);
    setDryRunHistory([]);
    setDryRunResult(null);
  }

  function chooseApproval(next: SecureMasterLocalApproval) {
    setApproval(next);
    localStorage.setItem(secureMasterSprintState.localApprovalKey, next);
  }

  function clear() {
    localStorage.removeItem(SECURE_MASTER_AGENT_LOG_KEY);
    setLogs([]);
    setCurrent(null);
  }

  const decisionSummary = current ? createSecureMasterDecisionSummary({ intent: current.intent, route: current.route, privacyDecision: current.privacyDecision, approvalDecision: approval }) : null;

  const actionPlan = current ? createSecureMasterActionPlan({ intent: current.intent, route: current.route, privacyDecision: current.privacyDecision, approvalDecision: approval, hasProviderDryRun: Boolean(dryRunResult) }) : null;
  const operatorPanel = createSecureMasterOperatorPanel({ localLogCount: logs.length, providerDryRunCount: dryRunHistory.length, adapterDryRunCount: adapterDryRunHistory.length, approvalDecision: approval, currentRecommendation: decisionSummary?.recommendation, currentRiskLevel: decisionSummary?.riskLevel });
  const providerAdapterPipeline = createSecureMasterProviderAdapterPipeline({ approvalDecision: approval, privacyDecision: current?.privacyDecision, hasAdapterContract: Boolean(providerAdapterContract) });
  const liveReadinessMatrix = createSecureMasterLiveReadinessMatrix({ hasAdapterContract: Boolean(providerAdapterContract), hasAdapterPipeline: true, approvalDecision: approval, providerCallAllowed: false });

  async function runSelfBuildPlanTop() {
  try {
    const response = await fetch('/api/cmt/master/secure/self-build/plan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ goal: selfBuildGoalTop }),
    });
    setSelfBuildPlanTop(await response.json());
  } catch (error) {
    setSelfBuildPlanTop({ ok: false, error: 'self_build_failed' });
  }
}

function copySelfBuildPromptTop() {
  const text = selfBuildPlanTop?.copilotPrompt || '';
  if (text) navigator.clipboard?.writeText(text);
}
async function runAutoPatchBuilder() {
  try {
    const response = await fetch('/api/cmt/master/secure/self-build/autopatch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ goal: autoPatchGoal }),
    });
    setAutoPatchResult(await response.json());
  } catch (error) {
    setAutoPatchResult({ ok: false, error: 'autopatch_failed' });
  }
}

function copyAutoPatchScript() {
  const text = autoPatchResult?.script || '';
  if (text) navigator.clipboard?.writeText(text);
}
async function writeWorkerTask() {
  try {
    const response = await fetch('/api/cmt/master/secure/worker/task', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Agent Worker Aufgabe', goal: workerTaskGoal, commands: ['status', 'build'] }),
    });
    setWorkerTaskResult(await response.json());
  } catch (error) {
    setWorkerTaskResult({ ok: false, error: 'worker_task_write_failed' });
  }
}

async function loadWorkerResult() {
  try {
    const response = await fetch('/api/cmt/master/secure/worker/result');
    setWorkerLastResult(await response.json());
  } catch (error) {
    setWorkerLastResult({ ok: false, error: 'worker_result_load_failed' });
  }
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
        <section style={{ border: '3px solid #22c55e', borderRadius: 18, background: '#052e16', padding: 20 }}>
          <h2>Agent-Selbstbau TOP</h2>
          <p style={{ color: '#bbf7d0' }}>Hier ist der Selbstbau-Modus. Nicht ins normale Fragefeld schreiben: Ziel hier eintragen und Selbstbauplan erzeugen.</p>
          <textarea
            value={selfBuildGoalTop}
            onChange={(event) => setSelfBuildGoalTop(event.target.value)}
            style={{ width: '100%', minHeight: 82, borderRadius: 12, border: '1px solid #22c55e', background: '#020617', color: '#e5e7eb', padding: 12 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <button onClick={runSelfBuildPlanTop} style={{ border: 0, borderRadius: 10, background: '#22c55e', color: '#052e16', padding: '10px 14px', fontWeight: 800 }}>Selbstbauplan erzeugen</button>
            <button onClick={copySelfBuildPromptTop} style={{ border: '1px solid #22c55e', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 14px' }}>Copilot-Prompt kopieren</button>
          </div>
          {selfBuildPlanTop && (
            <div style={{ marginTop: 12, border: '1px solid #166534', borderRadius: 12, background: '#020617', padding: 12 }}>
              <h3>{selfBuildPlanTop.title ?? 'Selbstbauplan'}</h3>
              <p>{selfBuildPlanTop.summary}</p>
              <p>Naechster Patch: <b>{selfBuildPlanTop.nextPatchName}</b> | Prioritaet: <b>{selfBuildPlanTop.priority}</b></p>
              <h4>Dateien</h4>
              <ul>{selfBuildPlanTop.filesToCreateOrEdit?.map((item: any) => <li key={item}>{item}</li>)}</ul>
              <h4>Konkrete Schritte</h4>
              <ul>{selfBuildPlanTop.concreteSteps?.map((item: any) => <li key={item}>{item}</li>)}</ul>
              <h4>Copilot-Prompt</h4>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#0f172a', borderRadius: 10, padding: 12, color: '#cbd5e1' }}>{selfBuildPlanTop.copilotPrompt}</pre>
            </div>
          )}
        </section>


                <section style={{ border: '3px solid #22c55e', borderRadius: 18, background: '#052e16', padding: 20 }}>
          <h2>Agent-Autopatch</h2>
          <p style={{ color: '#bbf7d0' }}>Jetzt praktisch: Der Agent erzeugt einen konkreten Patch-Vorschlag mit Script, Tests und Commit-Message.</p>
          <textarea
            value={autoPatchGoal}
            onChange={(event) => setAutoPatchGoal(event.target.value)}
            style={{ width: '100%', minHeight: 76, borderRadius: 12, border: '1px solid #22c55e', background: '#020617', color: '#e5e7eb', padding: 12 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <button onClick={runAutoPatchBuilder} style={{ border: 0, borderRadius: 10, background: '#22c55e', color: '#052e16', padding: '10px 14px', fontWeight: 800 }}>Autopatch erzeugen</button>
            <button onClick={copyAutoPatchScript} style={{ border: '1px solid #22c55e', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 14px' }}>Patch-Script kopieren</button>
          </div>
          {autoPatchResult && (
            <div style={{ marginTop: 12, border: '1px solid #166534', borderRadius: 12, background: '#020617', padding: 12 }}>
              <h3>{autoPatchResult.title}</h3>
              <p>{autoPatchResult.summary}</p>
              <p>Patch: <b>{autoPatchResult.patchName}</b></p>
              <h4>Dateien</h4>
              <ul>{autoPatchResult.filesToEdit?.map((item: any) => <li key={item}>{item}</li>)}</ul>
              <h4>Testbefehle</h4>
              <ul>{autoPatchResult.testCommands?.map((item: any) => <li key={item}><code>{item}</code></li>)}</ul>
              <p>Commit: <code>{autoPatchResult.commitMessage}</code></p>
              <h4>Script</h4>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#0f172a', borderRadius: 10, padding: 12, color: '#cbd5e1' }}>{autoPatchResult.script}</pre>
            </div>
          )}
        </section>
        <section style={{ border: '3px solid #38bdf8', borderRadius: 18, background: '#082f49', padding: 20 }}>
          <h2>Agent-Worker-Steuerung</h2>
          <p style={{ color: '#bae6fd' }}>Hier verbindet sich die Agent-Seite mit dem lokalen Worker. Aufgabe schreiben, dann im Terminal worker:run ausführen.</p>
          <textarea
            value={workerTaskGoal}
            onChange={(event) => setWorkerTaskGoal(event.target.value)}
            style={{ width: '100%', minHeight: 76, borderRadius: 12, border: '1px solid #38bdf8', background: '#020617', color: '#e5e7eb', padding: 12 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <button onClick={writeWorkerTask} style={{ border: 0, borderRadius: 10, background: '#38bdf8', color: '#082f49', padding: '10px 14px', fontWeight: 800 }}>Worker-Aufgabe schreiben</button>
            <button onClick={loadWorkerResult} style={{ border: '1px solid #38bdf8', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 14px' }}>Worker-Ergebnis laden</button>
          </div>
          <p style={{ color: '#bae6fd', fontSize: 13 }}>Terminal danach: <code>npm run worker:run</code></p>
          {workerTaskResult && (
            <div style={{ marginTop: 12, border: '1px solid #0369a1', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>Task geschrieben: <b>{String(workerTaskResult.ok)}</b></p>
              <p>Pfad: <code>{workerTaskResult.taskPath}</code></p>
              <p>{workerTaskResult.task?.goal}</p>
            </div>
          )}
          {workerLastResult && (
            <div style={{ marginTop: 12, border: '1px solid #0369a1', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>Worker Ergebnis geladen: <b>{String(workerLastResult.ok)}</b></p>
              <p>Build OK: <b>{String(workerLastResult.result?.ok)}</b></p>
              <p>{workerLastResult.result?.message}</p>
              <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 260, overflow: 'auto', background: '#0f172a', borderRadius: 10, padding: 12, color: '#cbd5e1' }}>{workerLastResult.logPreview}</pre>
            </div>
          )}
        </section>
<section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>
          <h2>Operator-Panel</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <p>Lokale Logs: <b>{operatorPanel.localLogCount}</b></p>
            <p>Provider-Dry-Runs: <b>{operatorPanel.providerDryRunCount}</b></p>
            <p>Adapter-Dry-Runs: <b>{operatorPanel.adapterDryRunCount}</b></p>
            <p>Approval: <b>{operatorPanel.approvalDecision}</b></p>
            <p>Empfehlung: <b>{operatorPanel.currentRecommendation}</b></p>
            <p>Risiko: <b>{operatorPanel.currentRiskLevel}</b></p>
            <p>Live-Status: <b>{operatorPanel.liveStatus}</b></p>
            <p>Provider-Call: <b>{String(operatorPanel.providerCallAllowed)}</b></p>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{operatorPanel.nextThreshold}</p>
        </section>

        <section style={{ border: '1px solid #22c55e', borderRadius: 18, background: '#052e16', padding: 20 }}>
          <h2>Arbeitsstatus</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <p>Lokal nutzbar: <b>{String(secureMasterWorkState.localWorkReady)}</b></p>
            <p>Live bereit: <b>{String(secureMasterWorkState.liveReady)}</b></p>
            <p>Hauptseite: <b>{secureMasterWorkState.currentMainPage}</b></p>
            <p>Naechste Schwelle: <b>{secureMasterWorkState.providerAdapterNext ? 'Provider-Adapter vorbereiten' : 'offen'}</b></p>
          </div>
          <p>{secureMasterWorkState.userInstruction}</p>
          <p style={{ color: '#bbf7d0' }}>{secureMasterWorkState.nextThreshold}</p>
          <h3>Jetzt sicher moeglich</h3>
          <ul>{secureMasterWorkState.safeNow.map((item: any) => <li key={item}>{item}</li>)}</ul>
          <h3>Live bleibt blockiert wegen</h3>
          <ul>{secureMasterWorkState.blockedLiveReasons.map((item: any) => <li key={item}>{item}</li>)}</ul>
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
              <span style={{ color: '#94a3b8', fontSize: 12, alignSelf: 'center' }}>Export enthaelt lokale Freigabe + Live-Gate-Snapshot.</span>
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
          <ul>{secureMasterProviderConfig.envKeysRequiredLater.map((item: any) => <li key={item}>{item}</li>)}</ul>
          <h3>Spätere Provider-Optionen</h3>
          <ul>{secureMasterProviderConfig.supportedProvidersLater.map((item: any) => <li key={item}>{item}</li>)}</ul>
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
          <ul>{secureMasterProviderValidationPreview.rules.map((item: any) => <li key={item}>{item}</li>)}</ul>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterProviderValidationPreview.nextStep}</p>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Lokaler Freigabeentscheid</h2>
          <p style={{ color: '#fbbf24' }}>Externe Sendung bleibt blockiert. Diese Auswahl ist nur eine lokale Vorschau.</p>
          <p>Standard: <b>{secureMasterApprovalDecisionPreview.defaultDecision}</b></p>
          <p>Provider-Call blockiert: <b>{String(secureMasterApprovalDecisionPreview.noProviderCall)}</b></p>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {secureMasterApprovalDecisionPreview.allowedDecisions.map((decision: any) => (
              <button key={decision} disabled style={{ textAlign: 'left', border: '1px solid #334155', borderRadius: 12, background: '#020617', color: '#e5e7eb', padding: 12 }}>
                <b>{decision}</b> — {secureMasterApprovalDecisionPreview.explanations[decision as keyof typeof secureMasterApprovalDecisionPreview.explanations]}
              </button>
            ))}
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterApprovalDecisionPreview.nextStep}</p>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Lokale Freigabeauswahl</h2>
          <p style={{ color: '#cbd5e1' }}>Aktuelle Auswahl: <b>{approval}</b>. Die Auswahl wird nur im Browser gespeichert und loest keinen Provider-Call aus.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(['local_only','anonymize_then_send','cancel'] as SecureMasterLocalApproval[]).map((item: any) => (
              <button key={item} onClick={() => chooseApproval(item)} style={{ border: approval === item ? '2px solid #22d3ee' : '1px solid #334155', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>{item}</button>
            ))}
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Provider-Call erlaubt: {String(secureMasterSprintState.providerCallAllowed)} | Externe Sendung erlaubt: {String(secureMasterSprintState.externalSendAllowed)}</p>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Sprint-Readiness Snapshot</h2>
          <p>Lokaler Agent funktioniert: <b>{String(secureMasterSprintState.readinessSnapshot.localAgentWorks)}</b></p>
          <p>Privacy Gate sichtbar: <b>{String(secureMasterSprintState.readinessSnapshot.privacyGateVisible)}</b></p>
          <p>Freigabeentscheidung sichtbar: <b>{String(secureMasterSprintState.readinessSnapshot.approvalDecisionVisible)}</b></p>
          <p>Provider-Konfiguration sichtbar: <b>{String(secureMasterSprintState.readinessSnapshot.providerConfigVisible)}</b></p>
          <p>Provider-Call erlaubt: <b>{String(secureMasterSprintState.readinessSnapshot.providerCallAllowed)}</b></p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterSprintState.readinessSnapshot.nextMilestone}</p>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Schnelltests</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {secureMasterSprintState.quickTests.map((test) => <button key={test} onClick={() => setInput(test)} style={{ border: '1px solid #334155', borderRadius: 999, background: '#020617', color: '#e5e7eb', padding: '6px 10px' }}>{test}</button>)}
          </div>
          <h3>Naechste Aktionen</h3>
          <ul>{secureMasterSprintState.nextActions.map((item: any) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section style={{ border: '1px solid #f97316', borderRadius: 18, background: '#1c1917', padding: 20 }}>
          <h2>Secret-/API-Key-Sicherheit</h2>
          <p style={{ color: '#fbbf24' }}>Noch keine echten API-Keys eingeben, speichern oder verwenden.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            <p>Secret-Eingabe erlaubt: <b>{String(secureMasterSecretReadiness.secretInputAllowed)}</b></p>
            <p>Browser-Speicherung erlaubt: <b>{String(secureMasterSecretReadiness.browserSecretStorageAllowed)}</b></p>
            <p>Repo-Speicherung erlaubt: <b>{String(secureMasterSecretReadiness.repoSecretStorageAllowed)}</b></p>
            <p>Secure Vault spaeter noetig: <b>{String(secureMasterSecretReadiness.secureVaultRequiredLater)}</b></p>
            <p>Provider-Call erlaubt: <b>{String(secureMasterSecretReadiness.providerCallAllowed)}</b></p>
          </div>
          <h3>Jetzt verboten</h3>
          <ul>{secureMasterSecretReadiness.forbiddenNow.map((item: any) => <li key={item}>{item}</li>)}</ul>
          <h3>Spaeter erforderlich</h3>
          <ul>{secureMasterSecretReadiness.requiredLater.map((item: any) => <li key={item}>{item}</li>)}</ul>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterSecretReadiness.nextSafeStep}</p>
        </section>

        <section style={{ border: '1px solid #f97316', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Env-/Git-Ignore-Preflight</h2>
          <p style={{ color: '#fbbf24' }}>Keine echten Secrets eintragen. Dieser Block ist nur Vorbereitung.</p>
          <p>Env-Preflight vorbereitet: <b>{String(secureMasterEnvPreflight.envPreflightPrepared)}</b></p>
          <p>Echte Secrets erlaubt: <b>{String(secureMasterEnvPreflight.realSecretsAllowedNow)}</b></p>
          <p>Provider-Call erlaubt: <b>{String(secureMasterEnvPreflight.providerCallAllowed)}</b></p>
          <h3>Spaeter benoetigte Dateien</h3>
          <ul>{secureMasterEnvPreflight.requiredFilesLater.map((item: any) => <li key={item}>{item}</li>)}</ul>
          <h3>Git-Ignore-Patterns</h3>
          <ul>{secureMasterEnvPreflight.gitIgnorePatternsRequired.map((item: any) => <li key={item}>{item}</li>)}</ul>
          <h3>Preflight-Checks</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {secureMasterEnvPreflight.checks.map((check: any) => (
              <article key={check.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 10 }}>
                <p><b>{check.label}</b> — {check.status}</p>
                <p style={{ color: '#94a3b8' }}>{check.detail}</p>
              </article>
            ))}
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterEnvPreflight.nextSafeStep}</p>
        </section>

        <section style={{ border: '1px solid #38bdf8', borderRadius: 18, background: '#0f172a', padding: 20 }}>
          <h2>Serverseitiger Provider-Config-Stub</h2>
          <p style={{ color: '#cbd5e1' }}>Die Provider-Konfiguration ist nur als blockierter Server-Stub vorbereitet. Der Client liest keine echten Secrets.</p>
          <p>Server-Config vorbereitet: <b>{String(secureMasterServerProviderConfigPreview.serverConfigPrepared)}</b></p>
          <p>Provider aktiv: <b>{String(secureMasterServerProviderConfigPreview.providerEnabled)}</b></p>
          <p>Provider-Call erlaubt: <b>{String(secureMasterServerProviderConfigPreview.providerCallAllowed)}</b></p>
          <p>Live-Modell aktiv: <b>{String(secureMasterServerProviderConfigPreview.liveModelEnabled)}</b></p>
          <p>Client kann Secrets lesen: <b>{String(secureMasterServerProviderConfigPreview.clientCanReadSecrets)}</b></p>
          <h3>Erforderliche ENV-Keys spaeter</h3>
          <ul>{secureMasterServerProviderConfigPreview.requiredEnvKeys.map((item: any) => <li key={item}>{item}</li>)}</ul>
          <h3>Im Client verboten</h3>
          <ul>{secureMasterServerProviderConfigPreview.forbiddenClientKeys.map((item: any) => <li key={item}>{item}</li>)}</ul>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterServerProviderConfigPreview.nextSafeStep}</p>
        </section>

        <section style={{ border: '1px solid #38bdf8', borderRadius: 18, background: '#0f172a', padding: 20 }}>
          <h2>Server-Provider-Dry-Run</h2>
          <p style={{ color: '#cbd5e1' }}>Serverseitiger Dry-Run-Endpunkt ist vorbereitet, aber echter Provider-Call bleibt blockiert.</p>
          <p>Endpoint: <b>{secureMasterServerProviderDryRunContract.endpointPath}</b></p>
          <p>Provider-Call erlaubt: <b>{String(secureMasterServerProviderDryRunContract.providerCallAllowed)}</b></p>
          <p>Secrets akzeptiert: <b>{String(secureMasterServerProviderDryRunContract.secretsAccepted)}</b></p>
          <button onClick={runServerProviderDryRun} style={{ border: '1px solid #22d3ee', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Server-Dry-Run testen</button>
          {serverDryRunResult && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>OK: <b>{String(serverDryRunResult.ok)}</b></p>
              <p>Dry-Run only: <b>{String(serverDryRunResult.dryRunOnly)}</b></p>
              <p>Provider-Call erlaubt: <b>{String(serverDryRunResult.providerCallAllowed)}</b></p>
              <p>{serverDryRunResult?.responsePreview?.message ?? serverDryRunResult?.message ?? 'Keine Antwort.'}</p>
            </div>
          )}
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterServerProviderDryRunContract.nextSafeStep}</p>
        </section>

        <section style={{ border: '1px solid #a78bfa', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Provider-Audit-Envelope</h2>
          <p style={{ color: '#cbd5e1' }}>Audit-Struktur fuer spaetere Provider-Aufrufe. Kein Provider-Call, keine Secrets.</p>
          <button onClick={createProviderAuditEnvelope} style={{ border: '1px solid #a78bfa', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Audit-Envelope erstellen</button>
          {providerAuditEnvelope && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>Audit vorbereitet: <b>{String(providerAuditEnvelope.auditPrepared)}</b></p>
              <p>Request-ID: <b>{providerAuditEnvelope.requestId}</b></p>
              <p>Dispatch Status: <b>{providerAuditEnvelope.dispatchStatus}</b></p>
              <p>Provider-Call erlaubt: <b>{String(providerAuditEnvelope.providerCallAllowed)}</b></p>
              <p>Secrets enthalten: <b>{String(providerAuditEnvelope.secretsIncluded)}</b></p>
              <p>Input Preview: {providerAuditEnvelope.inputPreview}</p>
              <h3>Pflichtfelder spaeter</h3>
              <ul>{providerAuditEnvelope.requiredAuditFieldsLater.map((item: any) => <li key={item}>{item}</li>)}</ul>
              <h3>Redaction Rules</h3>
              <ul>{providerAuditEnvelope.redactionRules.map((item: any) => <li key={item}>{item}</li>)}</ul>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{providerAuditEnvelope.nextSafeStep}</p>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #a78bfa', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Provider-Audit-Verlauf</h2>
          <p style={{ color: '#cbd5e1' }}>Lokaler Verlauf vorbereiteter Audit-Envelopes. Kein Provider-Call, keine Secrets.</p>
          <button onClick={clearProviderAuditHistory} style={{ border: '1px solid #7f1d1d', borderRadius: 10, background: '#020617', color: '#fecaca', padding: '8px 10px' }}>Audit-Verlauf löschen</button>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {providerAuditHistory.length === 0 && <p style={{ color: '#94a3b8' }}>Noch keine Audit-Eintraege.</p>}
            {providerAuditHistory.map((item: any) => (
              <article key={item.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
                <p style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()} | Request: {item.requestId}</p>
                <p>Approval: {item.approvalDecision} | Privacy: {item.privacyDecision} | Dispatch: {item.dispatchStatus}</p>
                <p>{item.inputPreview}</p>
                <p>Provider-Call: {String(item.providerCallAllowed)} | Secrets: {String(item.secretsIncluded)}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ border: '1px solid #38bdf8', borderRadius: 18, background: '#0f172a', padding: 20 }}>
          <h2>Server-Provider-Adapter deaktiviert</h2>
          <p style={{ color: '#cbd5e1' }}>Serverseitiger Adapter-Codepfad ist vorbereitet, bleibt aber hart deaktiviert.</p>
          <p>Endpoint: <b>{secureMasterServerProviderAdapterDisabled.endpointPath}</b></p>
          <p>Adapter aktiv: <b>{String(secureMasterServerProviderAdapterDisabled.adapterEnabled)}</b></p>
          <p>Dispatch erlaubt: <b>{String(secureMasterServerProviderAdapterDisabled.dispatchAllowed)}</b></p>
          <p>Provider-Call erlaubt: <b>{String(secureMasterServerProviderAdapterDisabled.providerCallAllowed)}</b></p>
          <p>Secrets akzeptiert: <b>{String(secureMasterServerProviderAdapterDisabled.secretsAccepted)}</b></p>
          <button onClick={runServerAdapterDisabled} style={{ border: '1px solid #22d3ee', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Deaktivierten Adapter testen</button>
          {serverAdapterDisabledResult && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>OK: <b>{String(serverAdapterDisabledResult.ok)}</b></p>
              <p>Adapter aktiv: <b>{String(serverAdapterDisabledResult.adapterEnabled)}</b></p>
              <p>Dispatch erlaubt: <b>{String(serverAdapterDisabledResult.dispatchAllowed)}</b></p>
              <p>Provider-Call erlaubt: <b>{String(serverAdapterDisabledResult.providerCallAllowed)}</b></p>
              <p>{serverAdapterDisabledResult?.responseEnvelope?.message ?? serverAdapterDisabledResult?.message ?? 'Keine Antwort.'}</p>
            </div>
          )}
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterServerProviderAdapterDisabled.nextSafeStep}</p>
        </section>

        <section style={{ border: '1px solid #f97316', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Secret/Git-Preflight technisch</h2>
          <p style={{ color: '#cbd5e1' }}>Prueft serverseitig `.env.example` und `.gitignore`, liest aber keine echten Secrets.</p>
          <button onClick={runSecretPreflight} style={{ border: '1px solid #f97316', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Secret-Preflight pruefen</button>
          {secretPreflightResult && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>OK: <b>{String(secretPreflightResult.ok)}</b></p>
              <p>Echte Secrets gelesen: <b>{String(secretPreflightResult.realSecretsRead)}</b></p>
              <p>.env.example vorhanden: <b>{String(secretPreflightResult.envExampleExists)}</b></p>
              <p>.gitignore vorhanden: <b>{String(secretPreflightResult.gitIgnoreExists)}</b></p>
              <p>.env abgedeckt: <b>{String(secretPreflightResult.gitIgnoreCoversEnv)}</b></p>
              <p>Key/Secret-Dateien abgedeckt: <b>{String(secretPreflightResult.gitIgnoreCoversKeys)}</b></p>
              {secretPreflightResult.warnings?.length > 0 && <ul>{secretPreflightResult.warnings.map((item: any) => <li key={item}>{item}</li>)}</ul>}
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{secretPreflightResult.nextSafeStep}</p>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #22c55e', borderRadius: 18, background: '#052e16', padding: 20 }}>
          <h2>Budget-/Token-Limit technisch</h2>
          <p style={{ color: '#cbd5e1' }}>Bereitet sichere Kosten- und Token-Grenzen fuer spaetere Live-KI vor. Kein Provider-Call.</p>
          <button onClick={runBudgetPreflight} style={{ border: '1px solid #22c55e', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Budget-Preflight pruefen</button>
          {budgetPreflightResult && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>OK: <b>{String(budgetPreflightResult.ok)}</b></p>
              <p>Provider-Call erlaubt: <b>{String(budgetPreflightResult.providerCallAllowed)}</b></p>
              <p>Live-Modell aktiv: <b>{String(budgetPreflightResult.liveModelEnabled)}</b></p>
              <p>Max Tokens / Request: <b>{budgetPreflightResult.maxTokensPerRequest}</b></p>
              <p>Max Requests / Session: <b>{budgetPreflightResult.maxRequestsPerSession}</b></p>
              <p>Max Kosten / Session EUR: <b>{budgetPreflightResult.maxEstimatedCostPerSessionEur}</b></p>
              <p>Timeout ms: <b>{budgetPreflightResult.timeoutMs}</b></p>
              <p>Hard-Stop aktiv: <b>{String(budgetPreflightResult.hardStopEnabled)}</b></p>
              <h3>Vor Live erforderlich</h3>
              <ul>{budgetPreflightResult.requiredBeforeLive?.map((item: any) => <li key={item}>{item}</li>)}</ul>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{budgetPreflightResult.nextSafeStep}</p>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>
          <h2>Manueller Live-Test-Schalter</h2>
          <p style={{ color: '#fecaca' }}>Live-Test-Gate ist vorbereitet. Echter Live-Test bleibt noch blockiert, bis du explizit freigibst und serverseitige ENV-Werte sauber gesetzt sind.</p>
          <button onClick={runLiveTestGate} style={{ border: '1px solid #ef4444', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Live-Test-Gate pruefen</button>
          {liveTestGateResult && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>Gate vorbereitet: <b>{String(liveTestGateResult.liveTestGatePrepared)}</b></p>
              <p>Live-Test startbar: <b>{String(liveTestGateResult.canStartLiveTest)}</b></p>
              <p>Provider-Call erlaubt: <b>{String(liveTestGateResult.providerCallAllowed)}</b></p>
              <p>Live-Modell aktiv: <b>{String(liveTestGateResult.liveModelEnabled)}</b></p>
              <p>Client-Secrets erlaubt: <b>{String(liveTestGateResult.clientSecretsAllowed)}</b></p>
              <h3>Vor Live-Test erforderlich</h3>
              <ul>{liveTestGateResult.requiredBeforeLiveTest?.map((item: any) => <li key={item}>{item}</li>)}</ul>
              <h3>Aktuelle Blocker</h3>
              <ul>{liveTestGateResult.blockedReasons?.map((item: any) => <li key={item}>{item}</li>)}</ul>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{liveTestGateResult.nextSafeStep}</p>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>
          <h2>Live-Test-Runbook</h2>
          <p style={{ color: '#fecaca' }}>Runbook und ENV-Beispiel fuer den ersten echten Live-Test. Dieser Block aktiviert keinen Provider-Call.</p>
          <button onClick={loadLiveRunbook} style={{ border: '1px solid #ef4444', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Live-Test-Runbook laden</button>
          {liveRunbookResult && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>Runbook vorbereitet: <b>{String(liveRunbookResult.runbookPrepared)}</b></p>
              <p>ENV Beispiel: <b>{liveRunbookResult.envExampleFile}</b></p>
              <p>Docs: <b>{liveRunbookResult.docsFile}</b></p>
              <p>Provider-Call durch diesen Patch erlaubt: <b>{String(liveRunbookResult.providerCallAllowedByThisPatch)}</b></p>
              <p>Client-Secrets erlaubt: <b>{String(liveRunbookResult.clientSecretsAllowed)}</b></p>
              <h3>Manuelle Schritte</h3>
              <ul>{liveRunbookResult.requiredManualSteps?.map((item: any) => <li key={item}>{item}</li>)}</ul>
              <p style={{ color: '#bbf7d0' }}>Sichere erste Frage: {liveRunbookResult.safeFirstQuestion}</p>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{liveRunbookResult.rollbackInstruction}</p>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>
          <h2>Live-Test-Preflight</h2>
          <p style={{ color: '#fecaca' }}>Prueft, ob der echte Live-Test serverseitig freigegeben waere. Es werden keine Secrets angezeigt.</p>
          <button onClick={runLivePreflight} style={{ border: '1px solid #ef4444', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Live-Preflight pruefen</button>
          {livePreflightResult && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>Live-Test vorbereitet: <b>{String(livePreflightResult.liveTestPrepared)}</b></p>
              <p>Live-Call moeglich: <b>{String(livePreflightResult.canAttemptLiveProviderCall)}</b></p>
              <p>Provider-Call erlaubt: <b>{String(livePreflightResult.providerCallAllowed)}</b></p>
              <p>Client-Secrets erlaubt: <b>{String(livePreflightResult.clientSecretsAllowed)}</b></p>
              <p>API-Key serverseitig vorhanden: <b>{String(livePreflightResult.env?.PROVIDER_API_KEY_PRESENT)}</b></p>
              <p>Modell vorhanden: <b>{String(livePreflightResult.env?.PROVIDER_MODEL_PRESENT)}</b></p>
              {livePreflightResult.blockedReasons?.length > 0 && <ul>{livePreflightResult.blockedReasons.map((item: any) => <li key={item}>{item}</li>)}</ul>}
              <p style={{ color: '#bbf7d0' }}>Sichere Testfrage: {livePreflightResult.safeTestQuestion}</p>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{livePreflightResult.nextStep}</p>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>
          <h2>Live-Provider-Test vorbereitet</h2>
          <p style={{ color: '#fecaca' }}>Dies ist der erste echte serverseitige Provider-Testpfad. Er bleibt blockiert, solange die ENV-Gates nicht explizit gesetzt sind.</p>
          <p>Nur harmlose Testfragen verwenden. Keine internen, personenbezogenen oder geheimen Daten senden.</p>
          <button onClick={runLiveProviderTest} style={{ border: '1px solid #ef4444', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Live-Provider-Test ausfuehren</button>
          {liveProviderTestResult && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>OK: <b>{String(liveProviderTestResult.ok)}</b></p>
              <p>Provider-Call versucht: <b>{String(liveProviderTestResult.providerCallAttempted)}</b></p>
              <p>Provider-Call erlaubt: <b>{String(liveProviderTestResult.providerCallAllowed)}</b></p>
              <p>Provider: <b>{liveProviderTestResult.gate?.providerName ?? 'none'}</b> | Modell: <b>{liveProviderTestResult.gate?.modelName ?? 'none'}</b></p>
              {liveProviderTestResult.blockedReasons?.length > 0 && <ul>{liveProviderTestResult.blockedReasons.map((item: any) => <li key={item}>{item}</li>)}</ul>}
              {liveProviderTestResult.answer && <p style={{ color: '#bbf7d0' }}>{liveProviderTestResult.answer}</p>}
              {liveProviderTestResult.error && <p style={{ color: '#fecaca' }}>{liveProviderTestResult.error}</p>}
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>
          <h2>Live-Readiness-Matrix</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>canGoLive: {String(liveReadinessMatrix.canGoLive)}</span>
            <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>localMvpReady: {String(liveReadinessMatrix.localMvpReady)}</span>
            <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>missingCritical: {liveReadinessMatrix.missingCriticalCount}</span>
          </div>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {liveReadinessMatrix.items.map((item: any) => (
              <article key={item.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 10 }}>
                <p><b>{item.ready ? 'OK' : 'FEHLT'}</b> — {item.label}</p>
                <p style={{ color: '#94a3b8' }}>{item.detail}</p>
              </article>
            ))}
          </div>
          <p style={{ color: '#fbbf24' }}>{liveReadinessMatrix.nextSafeStep}</p>
        </section>

        <section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>
          <h2>Provider-Adapter-Pipeline</h2>
          <p style={{ color: '#cbd5e1' }}>Deaktivierte Pipeline fuer spaetere Provider-Aufrufe. Dispatch bleibt blockiert.</p>
          <div style={{ display: 'grid', gap: 10 }}>
            {providerAdapterPipeline.stages.map((stage: any) => (
              <article key={stage.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
                <p><b>{stage.label}</b> — {stage.status}</p>
                <p style={{ color: '#94a3b8' }}>{stage.detail}</p>
              </article>
            ))}
          </div>
          <p style={{ color: '#fbbf24' }}>Current Stage: {providerAdapterPipeline.currentStage}</p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{providerAdapterPipeline.nextSafeStep}</p>
        </section>

        <section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>
          <h2>Provider-Adapter-Contract</h2>
          <p style={{ color: '#cbd5e1' }}>Bereitet den spaeteren Adapter-Codepfad als blockierten Contract vor. Kein Dispatch, kein Provider-Call.</p>
          <button onClick={createAdapterContract} style={{ border: '1px solid #22d3ee', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Adapter-Contract erstellen</button>
          {providerAdapterContract && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>Contract vorbereitet: <b>{String(providerAdapterContract.contractPrepared)}</b></p>
              <p>Dispatch erlaubt: <b>{String(providerAdapterContract.adapterDispatchAllowed)}</b></p>
              <p>Provider-Call erlaubt: <b>{String(providerAdapterContract.providerCallAllowed)}</b></p>
              <p>Provider: <b>{providerAdapterContract.selectedProvider}</b> | Modell: <b>{providerAdapterContract.selectedModel}</b></p>
              <h3>Request Envelope Preview</h3>
              <p>{providerAdapterContract.requestEnvelopePreview.inputPreview}</p>
              <p>Approval: {providerAdapterContract.requestEnvelopePreview.approvalDecision} | Privacy: {providerAdapterContract.requestEnvelopePreview.privacyDecision} | Secrets: {String(providerAdapterContract.requestEnvelopePreview.secretsIncluded)}</p>
              <h3>Response Envelope Preview</h3>
              <p>{providerAdapterContract.responseEnvelopePreview.message}</p>
              <h3>Aktivierungsanforderungen</h3>
              <ul>{providerAdapterContract.activationRequirements.map((item: any) => <li key={item}>{item}</li>)}</ul>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{providerAdapterContract.nextStep}</p>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Provider-Adapter-Dry-Run</h2>
          <p style={{ color: '#cbd5e1' }}>Zeigt den spaeteren Adapter-Umschlag, ohne Dispatch und ohne Provider-Call.</p>
          <button onClick={runAdapterDryRun} style={{ border: '1px solid #22d3ee', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Adapter-Dry-Run erstellen</button>
          {adapterDryRun && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>Adapter vorbereitet: <b>{String(adapterDryRun.adapterPrepared)}</b></p>
              <p>Dispatch erlaubt: <b>{String(adapterDryRun.adapterDispatchAllowed)}</b></p>
              <p>Provider-Call erlaubt: <b>{String(adapterDryRun.providerCallAllowed)}</b></p>
              <p>Provider: <b>{adapterDryRun.providerName}</b> | Modell: <b>{adapterDryRun.modelName}</b></p>
              <h3>Request Preview</h3>
              <p>{adapterDryRun.requestPreview.inputPreview}</p>
              <p>Approval: {adapterDryRun.requestPreview.approvalDecision} | Privacy: {adapterDryRun.requestPreview.privacyMode}</p>
              <h3>Safety Envelope</h3>
              <p>External Sharing: {String(adapterDryRun.safetyEnvelope.externalSharingAllowed)} | Secrets included: {String(adapterDryRun.safetyEnvelope.secretsIncluded)} | Anonymisierung noetig: {String(adapterDryRun.safetyEnvelope.anonymizationRequired)}</p>
              <h3>Response Preview</h3>
              <p>{adapterDryRun.responsePreview.simulatedMessage}</p>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{adapterDryRun.nextStep}</p>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Provider-Dry-Run</h2>
          <p style={{ color: '#cbd5e1' }}>Simuliert die spätere Provider-Schicht, ohne Daten zu senden.</p>
          <button onClick={runProviderDryRun} style={{ border: '1px solid #22d3ee', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Provider-Dry-Run simulieren</button>
          {dryRunResult && (
            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
              <p>Modus: <b>{dryRunResult.mode}</b></p>
              <p>Dry-Run only: <b>{String(dryRunResult.dryRunOnly)}</b></p>
              <p>Provider-Call erlaubt: <b>{String(dryRunResult.providerCallAllowed)}</b></p>
              <p>Provider: <b>{dryRunResult.providerName}</b> | Modell: <b>{dryRunResult.modelName}</b></p>
              <p>{dryRunResult.simulatedAnswer}</p>
              <p style={{ color: '#fbbf24' }}>{dryRunResult.blockedReason}</p>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{dryRunResult.nextStep}</p>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Adapter-Dry-Run-Verlauf</h2>
          <p style={{ color: '#cbd5e1' }}>Lokaler Verlauf simulierter Adapter-Umschlaege. Kein Dispatch, kein Provider-Call.</p>
          <button onClick={clearAdapterDryRunHistory} style={{ border: '1px solid #7f1d1d', borderRadius: 10, background: '#020617', color: '#fecaca', padding: '8px 10px' }}>Adapter-Dry-Run-Verlauf löschen</button>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {adapterDryRunHistory.length === 0 && <p style={{ color: '#94a3b8' }}>Noch keine Adapter-Dry-Runs.</p>}
            {adapterDryRunHistory.map((item: any) => (
              <article key={item.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
                <p style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()} | Approval: {item.approvalDecision} | Privacy: {item.privacyMode} | Provider-Call: {String(item.providerCallAllowed)}</p>
                <p>{item.inputPreview}</p>
                <p>Anonymisierung nötig: {String(item.anonymizationRequired)}</p>
                <p style={{ color: '#cbd5e1' }}>{item.simulatedMessage}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Dry-Run-Verlauf</h2>
          <p style={{ color: '#cbd5e1' }}>Lokaler Verlauf simulierter Provider-Dry-Runs. Keine externe Sendung.</p>
          <button onClick={clearDryRunHistory} style={{ border: '1px solid #7f1d1d', borderRadius: 10, background: '#020617', color: '#fecaca', padding: '8px 10px' }}>Dry-Run-Verlauf löschen</button>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {dryRunHistory.length === 0 && <p style={{ color: '#94a3b8' }}>Noch keine Dry-Runs.</p>}
            {dryRunHistory.map((item: any) => (
              <article key={item.id} style={{ border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>
                <p style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()} | Approval: {item.approvalDecision} | Provider-Call: {String(item.providerCallAllowed)}</p>
                <p>{item.inputPreview}</p>
                <p style={{ color: '#cbd5e1' }}>{item.simulatedAnswer}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Live-Gate Check</h2>
          <p style={{ color: '#fbbf24' }}>{secureMasterLiveGateCheck.blockedReason}</p>
          <p>Live-Gate vorbereitet: <b>{String(secureMasterLiveGateCheck.liveGatePrepared)}</b></p>
          <p>Build muss gruen sein: <b>{String(secureMasterLiveGateCheck.buildMustBeGreen)}</b></p>
          <p>Explizite Freigabe erforderlich: <b>{String(secureMasterLiveGateCheck.approvalMustBeExplicit)}</b></p>
          <p>Provider-Call erlaubt: <b>{String(secureMasterLiveGateCheck.providerCallAllowed)}</b></p>
          <p>Live-Modell erlaubt: <b>{String(secureMasterLiveGateCheck.liveModelAllowed)}</b></p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterLiveGateCheck.nextMilestone}</p>
        </section>

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Voraussetzungen vor Live-KI</h2>
          <p style={{ color: '#cbd5e1' }}>Der Agent darf erst live mit einem Modell arbeiten, wenn diese Punkte erfüllt sind:</p>
          <ul>
            {secureMasterProviderGateStatus.requirements.map((item: any) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        {current && decisionSummary && (
          <section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>
            <h2>Agentenentscheidung</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ background: '#164e63', borderRadius: 999, padding: '6px 10px' }}>Empfehlung: {decisionSummary.recommendation}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Risiko: {decisionSummary.riskLevel}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Provider-Call: {String(decisionSummary.providerCallAllowed)}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Dry-Run only: {String(decisionSummary.dryRunOnly)}</span>
            </div>
            <h3>{decisionSummary.title}</h3>
            <p>{decisionSummary.reason}</p>
            <p style={{ color: '#94a3b8' }}>Nächste beste Aktion: {decisionSummary.nextBestAction}</p>
          </section>
        )}

        {current && actionPlan && (
          <section style={{ border: '1px solid #22c55e', borderRadius: 18, background: '#0f172a', padding: 20 }}>
            <h2>Lokaler Aktionsplan</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ background: '#14532d', borderRadius: 999, padding: '6px 10px' }}>{actionPlan.headline}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Provider-Call: {String(actionPlan.providerCallAllowed)}</span>
              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Dry-Run only: {String(actionPlan.dryRunOnly)}</span>
            </div>
            <p>{actionPlan.summary}</p>
            <h3>Konkrete Schritte</h3>
            <ul>{actionPlan.steps.map((step: any) => <li key={step}>{step}</li>)}</ul>
            <p style={{ color: '#94a3b8' }}>Live-Grenze: {actionPlan.liveBoundary}</p>
          </section>
        )}

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
            <p style={{ color: '#cbd5e1' }}>Aktive lokale Freigabe: <b>{approval}</b>. Provider-Call erlaubt: <b>{String(secureMasterLiveGateCheck.providerCallAllowed)}</b>.</p>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Warum diese Einordnung? {current.reason ?? 'Lokale Regelentscheidung ohne Provider und ohne Internet.'}</p>
            <p style={{ border: '1px solid #334155', background: '#020617', borderRadius: 12, padding: 14 }}>{current.answer}</p>
            <h3>Nächste Haupt-Entscheidung</h3>
            <p style={{ color: '#cbd5e1' }}>Aktuell: lokal testen, Antwortqualität verbessern, Build stabil halten. Live-KI kommt erst nach explizitem Provider-Gate.</p>
            <h3>Nächste Schritte</h3>
            <ul>{current.nextSteps.map((step: any) => <li key={step}>{step}</li>)}</ul>
            {current.committee.length > 0 && <div><h3>5er-Gremium</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>{current.committee.map((member: any) => <article key={member.role} style={{ border: '1px solid #334155', background: '#020617', borderRadius: 12, padding: 12 }}><h4 style={{ color: '#67e8f9' }}>{member.role}</h4><p style={{ color: '#94a3b8', fontSize: 13 }}>{member.focus}</p><p>{member.opinion}</p></article>)}</div></div>}
          </section>
        )}

        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>
          <h2>Lokaler Verlauf</h2>
          <p style={{ color: '#cbd5e1' }}>Speicherort: Browser localStorage. Keine Server-Speicherung.</p>
          {logs.length === 0 && <p>Noch keine lokalen Logs.</p>}
          <div style={{ display: 'grid', gap: 10 }}>
            {logs.map((log: any) => <button key={log.id} onClick={() => setCurrent(log)} style={{ textAlign: 'left', border: '1px solid #334155', background: '#020617', color: '#e5e7eb', borderRadius: 12, padding: 12 }}><div style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(log.createdAt).toLocaleString()} | Intent: {log.intent} | Route: {log.route} | Privacy: {log.privacyDecision}</div><div>{log.inputPreview}</div></button>)}
          </div>
        </section>
      </div>
    </main>
  );
}
