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
  pkg.scripts["phase12:2:patch"]="node scripts/phase12-2-patch-approved-runtime-resume-envelope.cjs";
  pkg.scripts["phase12:2:verify"]="node scripts/phase12-2-verify-approved-runtime-resume-envelope.cjs";
  pkg.scripts["agents:runtime:resume:verify"]="node scripts/phase12-2-verify-approved-runtime-resume-envelope.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.2 Scripts eingetragen.");
}
const resumeStore = String.raw`import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type RuntimeResumeDecision = "resume_dry_run_allowed" | "blocked_missing_binding" | "blocked_not_approved" | "blocked_missing_envelope" | "blocked_tool_execution";
export interface ApprovedRuntimeResumeEnvelope {
  id: string;
  timestamp: string;
  runtimeEnvelopeId: string;
  consentBindingId?: string;
  consentRequestId?: string;
  consentStatus?: string;
  agentId?: string;
  agentName?: string;
  requestedAction?: string;
  decision: RuntimeResumeDecision;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  resumeAllowed: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function runtimePath(): string { return path.join(dataDir(), "controlled-agent-runtime-envelopes.jsonl"); }
function bindingPath(): string { return path.join(dataDir(), "agent-runtime-consent-bindings.json"); }
function consentPath(): string { return path.join(dataDir(), "tool-consent-requests.json"); }
function resumePath(): string { return path.join(dataDir(), "approved-runtime-resume-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonArray(file: string): any[] { try { const parsed = JSON.parse(readFileSync(file, "utf8")); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function appendResume(envelope: ApprovedRuntimeResumeEnvelope): void { ensureStore(); appendFileSync(resumePath(), JSON.stringify(envelope) + "\n", "utf8"); }
export function listApprovedRuntimeResumeEnvelopes(limit = 100): ApprovedRuntimeResumeEnvelope[] { ensureStore(); return readJsonl(resumePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500))); }
export function createApprovedRuntimeResumeEnvelope(input: { runtimeEnvelopeId?: string; consentBindingId?: string; consentRequestId?: string; metadata?: Record<string, unknown> }): ApprovedRuntimeResumeEnvelope {
  ensureStore();
  const runtimeEnvelopes = readJsonl(runtimePath());
  const bindings = readJsonArray(bindingPath());
  const consentRequests = readJsonArray(consentPath());
  const binding = bindings.find((entry:any) =>
    (input.consentBindingId && entry.id === input.consentBindingId) ||
    (input.consentRequestId && entry.consentRequestId === input.consentRequestId) ||
    (input.runtimeEnvelopeId && entry.runtimeEnvelopeId === input.runtimeEnvelopeId)
  );
  const runtimeEnvelopeId = input.runtimeEnvelopeId || binding?.runtimeEnvelopeId;
  const runtimeEnvelope = runtimeEnvelopes.find((entry:any) => entry.id === runtimeEnvelopeId);
  const consentRequestId = input.consentRequestId || binding?.consentRequestId;
  const consentRequest = consentRequests.find((entry:any) => entry.id === consentRequestId);
  let decision: RuntimeResumeDecision = "resume_dry_run_allowed";
  let reason = "Approved Runtime Resume Envelope erstellt. Phase 12.2 erlaubt weiterhin nur Dry-run Resume ohne Tool-Ausführung.";
  if (!binding) { decision = "blocked_missing_binding"; reason = "Runtime Consent Binding nicht gefunden."; }
  else if (!runtimeEnvelope) { decision = "blocked_missing_envelope"; reason = "Runtime Envelope nicht gefunden."; }
  else if ((consentRequest?.status || binding.status) !== "approved") { decision = "blocked_not_approved"; reason = "Consent Binding ist nicht approved."; }
  else if (runtimeEnvelope.toolExecutionAllowed !== false || runtimeEnvelope.dryRunOnly !== true) { decision = "blocked_tool_execution"; reason = "Runtime Envelope verletzt Dry-run Sicherheitsregeln."; }
  const resumeAllowed = decision === "resume_dry_run_allowed";
  const envelope: ApprovedRuntimeResumeEnvelope = {
    id: makeId("runtime-resume"),
    timestamp: new Date().toISOString(),
    runtimeEnvelopeId: runtimeEnvelopeId || "missing-runtime-envelope",
    consentBindingId: binding?.id || input.consentBindingId,
    consentRequestId: consentRequestId,
    consentStatus: consentRequest?.status || binding?.status,
    agentId: runtimeEnvelope?.agentId || binding?.agentId,
    agentName: runtimeEnvelope?.agentName || binding?.agentName,
    requestedAction: runtimeEnvelope?.requestedAction || binding?.requestedAction,
    decision,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    resumeAllowed,
    reason,
    metadata: { ...(input.metadata || {}), source: "approved-runtime-resume", noToolExecution: true },
  };
  appendResume(envelope);
  return envelope;
}
export function summarizeApprovedRuntimeResumeEnvelopes(envelopes: ApprovedRuntimeResumeEnvelope[]) { const byDecision: Record<string, number> = {}; for (const envelope of envelopes) byDecision[envelope.decision] = (byDecision[envelope.decision] || 0) + 1; return { total: envelopes.length, byDecision }; }
`;
const apiRoute = String.raw`import { createApprovedRuntimeResumeEnvelope, listApprovedRuntimeResumeEnvelopes, summarizeApprovedRuntimeResumeEnvelopes } from "../../../lib/approved-runtime-resume-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const envelopes = listApprovedRuntimeResumeEnvelopes(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeApprovedRuntimeResumeEnvelopes(envelopes), envelopes });
  } catch(error){
    const message = error instanceof Error ? error.message : "Approved Runtime Resume Envelopes konnten nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const envelope = createApprovedRuntimeResumeEnvelope({
      runtimeEnvelopeId: typeof body.runtimeEnvelopeId === "string" ? body.runtimeEnvelopeId : undefined,
      consentBindingId: typeof body.consentBindingId === "string" ? body.consentBindingId : undefined,
      consentRequestId: typeof body.consentRequestId === "string" ? body.consentRequestId : undefined,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });
    return Response.json({ ok:true, envelope });
  } catch(error){
    const message = error instanceof Error ? error.message : "Approved Runtime Resume Envelope konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Binding = { id:string; runtimeEnvelopeId:string; consentRequestId:string; status:string; agentName?:string };
type Resume = { id:string; timestamp:string; runtimeEnvelopeId:string; decision:string; agentName?:string; requestedAction?:string; consentStatus?:string; resumeAllowed:boolean; toolExecutionAllowed:boolean; dryRunOnly:boolean; reason:string };
export default function AgentRuntimeResumePage(){
  const [bindings,setBindings]=useState<Binding[]>([]);
  const [resumes,setResumes]=useState<Resume[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const bindingRes=await fetch("/api/agent-runtime-consent", { cache:"no-store" });
      const bindingPayload=await bindingRes.json();
      if(bindingRes.ok){ const list = Array.isArray(bindingPayload.bindings) ? bindingPayload.bindings : []; setBindings(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
      const resumeRes=await fetch("/api/agent-runtime-resume?limit=100", { cache:"no-store" });
      const resumePayload=await resumeRes.json();
      if(!resumeRes.ok) throw new Error(resumePayload?.error || "Resume Envelopes konnten nicht geladen werden.");
      setResumes(Array.isArray(resumePayload.envelopes) ? resumePayload.envelopes : []);
      setSummary(resumePayload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function createResume(){
    const res=await fetch("/api/agent-runtime-resume", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ consentBindingId: selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Resume fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="agent-runtime-resume" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)", borderColor:"#fdba74" }}><h1 className="section-title">Approved Runtime Resume Envelope</h1><p style={{ lineHeight:1.6 }}>Phase 12.2 erstellt Resume Envelopes für approved Runtime Consent Bindings. Es bleibt Dry-run-only und ohne echte Tool-Ausführung.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Resume Envelope erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{bindings.map((binding)=><option key={binding.id} value={binding.id}>{binding.agentName || "unknown-agent"} · {binding.status} · {binding.id}</option>)}</select><button className="primary-button" type="button" onClick={createResume} disabled={!selected}>Approved Runtime Resume Envelope erstellen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Resume Envelopes</h2>{resumes.length===0 ? <p>Noch keine Runtime Resume Envelopes.</p> : resumes.map((resume)=><article key={resume.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{resume.agentName || "unknown-agent"}</strong> <span className="chip">{resume.decision}</span> {resume.consentStatus ? <span className="chip">{resume.consentStatus}</span> : null}</div><div className="helper-text"><code>{resume.id}</code> · {resume.timestamp}</div><p><strong>Envelope:</strong> <code>{resume.runtimeEnvelopeId}</code></p>{resume.requestedAction ? <p><strong>Action:</strong> {resume.requestedAction}</p> : null}<p><strong>Resume allowed:</strong> {String(resume.resumeAllowed)} · <strong>Tool execution allowed:</strong> {String(resume.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(resume.dryRunOnly)}</p><p><strong>Reason:</strong> {resume.reason}</p></article>)}</section></div></main>;
}
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "agent-runtime-resume"')){
    const marker='  { href: "/agent-runtime-consent", label: "Runtime Consent", key: "agent-runtime-consent" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n  { href: "/agent-runtime-resume", label: "Runtime Resume", key: "agent-runtime-resume" },');
    else content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', '  { href: "/agent-runtime-resume", label: "Runtime Resume", key: "agent-runtime-resume" },\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Runtime Resume Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Runtime Resume bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase12-2-approved-runtime-resume-envelope.md", `# Phase 12.2 – Approved Runtime Resume Envelope

## Ziel
Approved Runtime Consent Bindings können in einen Resume Envelope überführt werden.

## Sicherheitsprinzip
Auch bei approved Consent bleibt echte Tool-Ausführung deaktiviert.

## Regeln
- Nur approved Bindings erzeugen resume_dry_run_allowed.
- Pending/denied/expired erzeugen blocked_not_approved.
- Fehlende Bindings/Envelopes werden blockiert.
- toolExecutionAllowed bleibt immer false.
- dryRunOnly bleibt immer true.

## Neue UI/API
- UI: /agent-runtime-resume
- API: /api/agent-runtime-resume
- Store: data/approved-runtime-resume-envelopes.jsonl

## Nächster Schritt
Phase 12.3 kann Runtime Audit Integration und Policy Simulation ergänzen.
`);
  ensureFile("docs/phase12-approved-runtime-resume-envelope-runbook.md", `# Runbook – Phase 12.2 Approved Runtime Resume Envelope

## Patch
\`\`\`powershell
npm run phase12:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase12-2-patch-approved-runtime-resume-envelope.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase12:2:verify
npm run build
npm run stack:up:detached
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /agent-runtime öffnen und Envelope erzeugen.
2. /agent-runtime-consent öffnen und Binding erzeugen.
3. /tool-consent öffnen und Consent Request approved setzen.
4. /agent-runtime-resume öffnen und Resume Envelope erzeugen.
5. Prüfen: toolExecutionAllowed=false und dryRunOnly=true.
`);
}
function patchPackage(){
  const file="package.json"; const pkg=JSON.parse(read(file)); pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase12:2:patch"]="node scripts/phase12-2-patch-approved-runtime-resume-envelope.cjs";
  pkg.scripts["phase12:2:verify"]="node scripts/phase12-2-verify-approved-runtime-resume-envelope.cjs";
  pkg.scripts["agents:runtime:resume:verify"]="node scripts/phase12-2-verify-approved-runtime-resume-envelope.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.2 Scripts eingetragen.");
}
patchPackage();
ensureFile("frontend/lib/approved-runtime-resume-store.ts", resumeStore);
ensureFile("frontend/app/api/agent-runtime-resume/route.ts", apiRoute);
ensureFile("frontend/app/agent-runtime-resume/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 12.2 Patch abgeschlossen.");
