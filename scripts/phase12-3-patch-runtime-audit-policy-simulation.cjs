const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensureFile(file, content){ if(!exists(file)){ write(file, content); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase12:3:patch"]="node scripts/phase12-3-patch-runtime-audit-policy-simulation.cjs";
  pkg.scripts["phase12:3:verify"]="node scripts/phase12-3-verify-runtime-audit-policy-simulation.cjs";
  pkg.scripts["agents:runtime:policy:verify"]="node scripts/phase12-3-verify-runtime-audit-policy-simulation.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.3 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type RuntimePolicySimulationDecision =
  | "simulation_allowed_dry_run"
  | "blocked_missing_resume"
  | "blocked_resume_not_allowed"
  | "blocked_tool_execution"
  | "blocked_missing_consent"
  | "blocked_policy_violation";

export interface RuntimePolicySimulationResult {
  id: string;
  timestamp: string;
  resumeEnvelopeId?: string;
  runtimeEnvelopeId?: string;
  agentName?: string;
  requestedAction?: string;
  decision: RuntimePolicySimulationDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function resumePath(): string { return path.join(dataDir(), "approved-runtime-resume-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "agent-runtime-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function appendSimulation(result: RuntimePolicySimulationResult): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(result) + "\n", "utf8"); }
export function listRuntimePolicySimulations(limit = 100): RuntimePolicySimulationResult[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500))); }
export function simulateRuntimePolicy(input: { resumeEnvelopeId?: string; metadata?: Record<string, unknown> }): RuntimePolicySimulationResult {
  ensureStore();
  const resumes = readJsonl(resumePath());
  const resume = resumes.find((entry:any) => input.resumeEnvelopeId ? entry.id === input.resumeEnvelopeId : true);
  const checks: Array<{ name: string; passed: boolean; reason: string }> = [];
  checks.push({ name: "resume_exists", passed: Boolean(resume), reason: resume ? "Resume Envelope gefunden." : "Resume Envelope fehlt." });
  checks.push({ name: "resume_allowed", passed: resume?.resumeAllowed === true, reason: resume?.resumeAllowed === true ? "Dry-run Resume ist erlaubt." : "Resume ist nicht erlaubt." });
  checks.push({ name: "tool_execution_blocked", passed: resume?.toolExecutionAllowed === false, reason: resume?.toolExecutionAllowed === false ? "Tool-Ausführung bleibt blockiert." : "Tool-Ausführung wäre nicht blockiert." });
  checks.push({ name: "dry_run_only", passed: resume?.dryRunOnly === true, reason: resume?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name: "consent_approved", passed: resume?.consentStatus === "approved", reason: resume?.consentStatus === "approved" ? "Consent ist approved." : "Consent ist nicht approved." });
  let decision: RuntimePolicySimulationDecision = "simulation_allowed_dry_run";
  let reason = "Policy Simulation erlaubt ausschließlich Dry-run. Keine echte Tool-Ausführung.";
  if (!resume) { decision = "blocked_missing_resume"; reason = "Resume Envelope nicht gefunden."; }
  else if (resume.resumeAllowed !== true) { decision = "blocked_resume_not_allowed"; reason = "Resume Envelope erlaubt keinen Resume."; }
  else if (resume.toolExecutionAllowed !== false || resume.dryRunOnly !== true) { decision = "blocked_tool_execution"; reason = "Dry-run Sicherheitsregeln verletzt."; }
  else if (resume.consentStatus !== "approved") { decision = "blocked_missing_consent"; reason = "Consent ist nicht approved."; }
  else if (checks.some((check) => !check.passed)) { decision = "blocked_policy_violation"; reason = "Mindestens ein Policy Check ist fehlgeschlagen."; }
  const result: RuntimePolicySimulationResult = {
    id: makeId("policy-sim"),
    timestamp: new Date().toISOString(),
    resumeEnvelopeId: resume?.id || input.resumeEnvelopeId,
    runtimeEnvelopeId: resume?.runtimeEnvelopeId,
    agentName: resume?.agentName,
    requestedAction: resume?.requestedAction,
    decision,
    policyChecks: checks,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    simulated: true,
    reason,
    metadata: { ...(input.metadata || {}), source: "runtime-policy-simulation", noToolExecution: true },
  };
  appendSimulation(result);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: result.resumeEnvelopeId,
    status: result.decision,
    riskLevel: "medium",
    summary: "Runtime Policy Simulation: " + result.decision,
    metadata: { source: "phase12.3-runtime-policy-simulation", simulationId: result.id, toolExecutionAllowed: false, dryRunOnly: true },
  });
  return result;
}
export function summarizeRuntimePolicySimulations(results: RuntimePolicySimulationResult[]) { const byDecision: Record<string, number> = {}; for (const result of results) byDecision[result.decision] = (byDecision[result.decision] || 0) + 1; return { total: results.length, byDecision }; }
`;
const api = String.raw`import { listRuntimePolicySimulations, simulateRuntimePolicy, summarizeRuntimePolicySimulations } from "../../../lib/agent-runtime-policy-simulation-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const simulations = listRuntimePolicySimulations(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeRuntimePolicySimulations(simulations), simulations });
  } catch(error){
    const message = error instanceof Error ? error.message : "Runtime Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const simulation = simulateRuntimePolicy({ resumeEnvelopeId: typeof body.resumeEnvelopeId === "string" ? body.resumeEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message = error instanceof Error ? error.message : "Runtime Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Resume = { id:string; agentName?:string; decision:string; consentStatus?:string };
type Simulation = { id:string; timestamp:string; decision:string; resumeEnvelopeId?:string; agentName?:string; requestedAction?:string; reason:string; toolExecutionAllowed:boolean; dryRunOnly:boolean; policyChecks?: Array<{ name:string; passed:boolean; reason:string }> };
export default function AgentRuntimePolicyPage(){
  const [resumes,setResumes]=useState<Resume[]>([]);
  const [simulations,setSimulations]=useState<Simulation[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const resumeRes=await fetch("/api/agent-runtime-resume?limit=100", { cache:"no-store" });
      const resumePayload=await resumeRes.json();
      if(resumeRes.ok){ const list = Array.isArray(resumePayload.envelopes) ? resumePayload.envelopes : []; setResumes(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
      const simRes=await fetch("/api/agent-runtime-policy?limit=100", { cache:"no-store" });
      const simPayload=await simRes.json();
      if(!simRes.ok) throw new Error(simPayload?.error || "Policy Simulations konnten nicht geladen werden.");
      setSimulations(Array.isArray(simPayload.simulations) ? simPayload.simulations : []);
      setSummary(simPayload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function simulate(){
    const res=await fetch("/api/agent-runtime-policy", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ resumeEnvelopeId: selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Simulation fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="agent-runtime-policy" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)", borderColor:"#f9a8d4" }}><h1 className="section-title">Runtime Policy Simulation</h1><p style={{ lineHeight:1.6 }}>Phase 12.3 simuliert Runtime Policy Checks und schreibt Audit Events. Es findet keine echte Tool-Ausführung statt.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Simulation erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{resumes.map((resume)=><option key={resume.id} value={resume.id}>{resume.agentName || "unknown-agent"} · {resume.decision} · {resume.consentStatus || "no-consent"} · {resume.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Runtime Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{simulations.length===0 ? <p>Noch keine Runtime Policy Simulations.</p> : simulations.map((sim)=><article key={sim.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{sim.agentName || "unknown-agent"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div>{sim.requestedAction ? <p><strong>Action:</strong> {sim.requestedAction}</p> : null}<p><strong>Reason:</strong> {sim.reason}</p><p><strong>Tool execution allowed:</strong> {String(sim.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(sim.dryRunOnly)}</p>{sim.policyChecks?.length ? <ul>{sim.policyChecks.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul> : null}</article>)}</section></div></main>;
}
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "agent-runtime-policy"')){
    const marker='  { href: "/agent-runtime-resume", label: "Runtime Resume", key: "agent-runtime-resume" },';
    const line='  { href: "/agent-runtime-policy", label: "Runtime Policy", key: "agent-runtime-policy" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line);
    else content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', line+'\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Runtime Policy Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Runtime Policy bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase12-3-runtime-audit-policy-simulation.md", `# Phase 12.3 – Runtime Audit Integration & Policy Simulation

## Ziel
Runtime Resume Envelopes werden gegen eine Policy-Simulation geprüft und als Governance Audit Event protokolliert.

## Sicherheitsprinzip
Auch erfolgreiche Policy Simulation erlaubt nur Dry-run. Echte Tool-Ausführung bleibt deaktiviert.

## Checks
- resume_exists
- resume_allowed
- tool_execution_blocked
- dry_run_only
- consent_approved

## Neue UI/API
- UI: /agent-runtime-policy
- API: /api/agent-runtime-policy
- Store: data/agent-runtime-policy-simulations.jsonl
- Audit: data/governance-audit.jsonl

## Nächster Schritt
Phase 12.4 kann Runtime Dashboard / Release Smoke für Phase 12 ergänzen.
`);
  ensureFile("docs/phase12-runtime-audit-policy-simulation-runbook.md", `# Runbook – Phase 12.3 Runtime Audit Integration & Policy Simulation

## Patch
\`\`\`powershell
npm run phase12:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase12-3-patch-runtime-audit-policy-simulation.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase12:3:verify
npm run build
npm run stack:up:detached
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /agent-runtime-resume öffnen und Resume Envelope erzeugen.
2. /agent-runtime-policy öffnen.
3. Runtime Policy simulieren.
4. /governance-audit öffnen und Runtime Policy Simulation Event prüfen.
5. Sicherstellen: toolExecutionAllowed=false und dryRunOnly=true.
`);
}
function patchPackage(){
  const file="package.json"; const pkg=JSON.parse(read(file)); pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase12:3:patch"]="node scripts/phase12-3-patch-runtime-audit-policy-simulation.cjs";
  pkg.scripts["phase12:3:verify"]="node scripts/phase12-3-verify-runtime-audit-policy-simulation.cjs";
  pkg.scripts["agents:runtime:policy:verify"]="node scripts/phase12-3-verify-runtime-audit-policy-simulation.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.3 Scripts eingetragen.");
}
patchPackage();
ensureFile("frontend/lib/agent-runtime-policy-simulation-store.ts", store);
ensureFile("frontend/app/api/agent-runtime-policy/route.ts", api);
ensureFile("frontend/app/agent-runtime-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 12.3 Patch abgeschlossen.");
