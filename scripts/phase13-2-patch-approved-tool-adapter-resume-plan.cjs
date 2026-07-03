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
  pkg.scripts["phase13:2:patch"]="node scripts/phase13-2-patch-approved-tool-adapter-resume-plan.cjs";
  pkg.scripts["phase13:2:verify"]="node scripts/phase13-2-verify-approved-tool-adapter-resume-plan.cjs";
  pkg.scripts["tools:adapter:resume:verify"]="node scripts/phase13-2-verify-approved-tool-adapter-resume-plan.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 13.2 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type ToolAdapterResumeDecision =
  | "resume_dry_run_allowed"
  | "blocked_missing_binding"
  | "blocked_not_approved"
  | "blocked_missing_plan"
  | "blocked_tool_execution";

export interface ApprovedToolAdapterResumePlan {
  id: string;
  timestamp: string;
  toolExecutionPlanId: string;
  consentBindingId?: string;
  consentRequestId?: string;
  consentStatus?: string;
  adapterId?: string;
  adapterName?: string;
  requestedAction?: string;
  decision: ToolAdapterResumeDecision;
  resumeAllowed: boolean;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function plansPath(): string { return path.join(dataDir(), "tool-execution-sandbox-plans.jsonl"); }
function bindingPath(): string { return path.join(dataDir(), "tool-adapter-consent-bindings.json"); }
function consentPath(): string { return path.join(dataDir(), "tool-consent-requests.json"); }
function resumePath(): string { return path.join(dataDir(), "approved-tool-adapter-resume-plans.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonArray(file: string): any[] { try { const parsed = JSON.parse(readFileSync(file, "utf8")); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function appendResume(plan: ApprovedToolAdapterResumePlan): void { ensureStore(); appendFileSync(resumePath(), JSON.stringify(plan) + "\n", "utf8"); }
export function listApprovedToolAdapterResumePlans(limit = 100): ApprovedToolAdapterResumePlan[] { ensureStore(); return readJsonl(resumePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500))); }
export function createApprovedToolAdapterResumePlan(input: { toolExecutionPlanId?: string; consentBindingId?: string; consentRequestId?: string; metadata?: Record<string, unknown> }): ApprovedToolAdapterResumePlan {
  ensureStore();
  const plans = readJsonl(plansPath());
  const bindings = readJsonArray(bindingPath());
  const consentRequests = readJsonArray(consentPath());
  const binding = bindings.find((entry:any) =>
    (input.consentBindingId && entry.id === input.consentBindingId) ||
    (input.consentRequestId && entry.consentRequestId === input.consentRequestId) ||
    (input.toolExecutionPlanId && entry.toolExecutionPlanId === input.toolExecutionPlanId)
  );
  const toolExecutionPlanId = input.toolExecutionPlanId || binding?.toolExecutionPlanId;
  const plan = plans.find((entry:any)=>entry.id === toolExecutionPlanId);
  const consentRequestId = input.consentRequestId || binding?.consentRequestId;
  const consentRequest = consentRequests.find((entry:any)=>entry.id === consentRequestId);
  let decision: ToolAdapterResumeDecision = "resume_dry_run_allowed";
  let reason = "Approved Tool Adapter Resume Plan erstellt. Phase 13.2 erlaubt weiterhin nur Dry-run Resume ohne Tool-Ausführung.";
  if(!binding){ decision = "blocked_missing_binding"; reason = "Tool Adapter Consent Binding nicht gefunden."; }
  else if(!plan){ decision = "blocked_missing_plan"; reason = "Tool Execution Plan nicht gefunden."; }
  else if((consentRequest?.status || binding.status) !== "approved"){ decision = "blocked_not_approved"; reason = "Tool Adapter Consent Binding ist nicht approved."; }
  else if(plan.toolExecutionAllowed !== false || plan.dryRunOnly !== true){ decision = "blocked_tool_execution"; reason = "Tool Execution Plan verletzt Dry-run Sicherheitsregeln."; }
  const resumeAllowed = decision === "resume_dry_run_allowed";
  const resume: ApprovedToolAdapterResumePlan = {
    id: makeId("tool-adapter-resume"),
    timestamp: new Date().toISOString(),
    toolExecutionPlanId: toolExecutionPlanId || "missing-tool-execution-plan",
    consentBindingId: binding?.id || input.consentBindingId,
    consentRequestId,
    consentStatus: consentRequest?.status || binding?.status,
    adapterId: plan?.adapterId || binding?.adapterId,
    adapterName: plan?.adapterName || binding?.adapterName,
    requestedAction: plan?.requestedAction || binding?.requestedAction,
    decision,
    resumeAllowed,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    reason,
    metadata: { ...(input.metadata || {}), source: "approved-tool-adapter-resume", noToolExecution: true },
  };
  appendResume(resume);
  return resume;
}
export function summarizeApprovedToolAdapterResumePlans(plans: ApprovedToolAdapterResumePlan[]) { const byDecision: Record<string, number> = {}; for(const plan of plans) byDecision[plan.decision] = (byDecision[plan.decision] || 0) + 1; return { total: plans.length, byDecision }; }
`;
const api = String.raw`import { createApprovedToolAdapterResumePlan, listApprovedToolAdapterResumePlans, summarizeApprovedToolAdapterResumePlans } from "../../../lib/approved-tool-adapter-resume-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const plans = listApprovedToolAdapterResumePlans(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeApprovedToolAdapterResumePlans(plans), plans });
  } catch(error){
    const message = error instanceof Error ? error.message : "Approved Tool Adapter Resume Plans konnten nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const plan = createApprovedToolAdapterResumePlan({
      toolExecutionPlanId: typeof body.toolExecutionPlanId === "string" ? body.toolExecutionPlanId : undefined,
      consentBindingId: typeof body.consentBindingId === "string" ? body.consentBindingId : undefined,
      consentRequestId: typeof body.consentRequestId === "string" ? body.consentRequestId : undefined,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });
    return Response.json({ ok:true, plan });
  } catch(error){
    const message = error instanceof Error ? error.message : "Approved Tool Adapter Resume Plan konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Binding = { id:string; toolExecutionPlanId:string; consentRequestId:string; status:string; adapterName?:string };
type Resume = { id:string; timestamp:string; toolExecutionPlanId:string; decision:string; adapterName?:string; requestedAction?:string; consentStatus?:string; resumeAllowed:boolean; toolExecutionAllowed:boolean; dryRunOnly:boolean; reason:string };
export default function ToolAdapterResumePage(){
  const [bindings,setBindings]=useState<Binding[]>([]);
  const [resumes,setResumes]=useState<Resume[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const bindingRes=await fetch("/api/tool-adapter-consent", { cache:"no-store" });
      const bindingPayload=await bindingRes.json();
      if(bindingRes.ok){ const list=Array.isArray(bindingPayload.bindings) ? bindingPayload.bindings : []; setBindings(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
      const resumeRes=await fetch("/api/tool-adapter-resume?limit=100", { cache:"no-store" });
      const resumePayload=await resumeRes.json();
      if(!resumeRes.ok) throw new Error(resumePayload?.error || "Resume Plans konnten nicht geladen werden.");
      setResumes(Array.isArray(resumePayload.plans) ? resumePayload.plans : []);
      setSummary(resumePayload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function createResume(){
    const res=await fetch("/api/tool-adapter-resume", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ consentBindingId:selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Resume fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="tool-adapter-resume" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)", borderColor:"#fdba74" }}><h1 className="section-title">Approved Tool Adapter Resume Plan</h1><p style={{ lineHeight:1.6 }}>Phase 13.2 erstellt Resume Plans für approved Tool Adapter Consent Bindings. Es bleibt Dry-run-only und ohne echte Tool-Ausführung.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Resume Plan erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{bindings.map((binding)=><option key={binding.id} value={binding.id}>{binding.adapterName || "unknown-adapter"} · {binding.status} · {binding.id}</option>)}</select><button className="primary-button" type="button" onClick={createResume} disabled={!selected}>Approved Tool Adapter Resume Plan erstellen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Resume Plans</h2>{resumes.length===0 ? <p>Noch keine Tool Adapter Resume Plans.</p> : resumes.map((resume)=><article key={resume.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{resume.adapterName || "unknown-adapter"}</strong> <span className="chip">{resume.decision}</span> {resume.consentStatus ? <span className="chip">{resume.consentStatus}</span> : null}</div><div className="helper-text"><code>{resume.id}</code> · {resume.timestamp}</div><p><strong>Plan:</strong> <code>{resume.toolExecutionPlanId}</code></p>{resume.requestedAction ? <p><strong>Action:</strong> {resume.requestedAction}</p> : null}<p><strong>Resume allowed:</strong> {String(resume.resumeAllowed)} · <strong>Tool execution allowed:</strong> {String(resume.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(resume.dryRunOnly)}</p><p><strong>Reason:</strong> {resume.reason}</p></article>)}</section></div></main>;
}
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "tool-adapter-resume"')){
    const marker='  { href: "/tool-adapter-consent", label: "Tool Consent Binding", key: "tool-adapter-consent" },';
    const line='  { href: "/tool-adapter-resume", label: "Tool Resume", key: "tool-adapter-resume" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line);
    else content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', line+'\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Tool Adapter Resume Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Tool Adapter Resume bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase13-2-approved-tool-adapter-resume-plan.md", `# Phase 13.2 – Approved Tool Adapter Resume Plan

## Ziel
Approved Tool Adapter Consent Bindings können in einen Resume Plan überführt werden.

## Sicherheitsprinzip
Auch bei approved Consent bleibt echte Tool-Ausführung deaktiviert.

## Regeln
- Nur approved Bindings erzeugen resume_dry_run_allowed.
- Pending/denied/expired erzeugen blocked_not_approved.
- Fehlende Bindings/Plans werden blockiert.
- toolExecutionAllowed bleibt immer false.
- dryRunOnly bleibt immer true.

## Neue UI/API
- UI: /tool-adapter-resume
- API: /api/tool-adapter-resume
- Store: data/approved-tool-adapter-resume-plans.jsonl

## Nächster Schritt
Phase 13.3 kann Tool Adapter Policy Simulation & Audit ergänzen.
`);
  ensureFile("docs/phase13-approved-tool-adapter-resume-plan-runbook.md", `# Runbook – Phase 13.2 Approved Tool Adapter Resume Plan

## Patch
\`\`\`powershell
npm run phase13:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase13-2-patch-approved-tool-adapter-resume-plan.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase13:2:verify
npm run build
npm run stack:up:detached
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /tool-sandbox öffnen und Dry-run Plan erzeugen.
2. /tool-adapter-consent öffnen und Binding erzeugen.
3. /tool-consent öffnen und Consent Request approved setzen.
4. /tool-adapter-resume öffnen und Resume Plan erzeugen.
5. Prüfen: toolExecutionAllowed=false und dryRunOnly=true.
`);
}
patchPackage();
ensureFile("frontend/lib/approved-tool-adapter-resume-store.ts", store);
ensureFile("frontend/app/api/tool-adapter-resume/route.ts", api);
ensureFile("frontend/app/tool-adapter-resume/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 13.2 Patch abgeschlossen.");
