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
  pkg.scripts["phase13:1:patch"]="node scripts/phase13-1-patch-tool-adapter-consent-binding.cjs";
  pkg.scripts["phase13:1:verify"]="node scripts/phase13-1-verify-tool-adapter-consent-binding.cjs";
  pkg.scripts["tools:adapter:consent:verify"]="node scripts/phase13-1-verify-tool-adapter-consent-binding.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 13.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type ToolAdapterConsentBindingStatus = "pending" | "approved" | "denied" | "expired";
export interface ToolAdapterConsentBinding {
  id: string;
  toolExecutionPlanId: string;
  consentRequestId: string;
  status: ToolAdapterConsentBindingStatus;
  source: "tool-adapter-sandbox";
  requestedAt: string;
  decidedAt?: string;
  adapterId?: string;
  adapterName?: string;
  requestedAction?: string;
  consentUrl: string;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function bindingPath(): string { return path.join(dataDir(), "tool-adapter-consent-bindings.json"); }
function plansPath(): string { return path.join(dataDir(), "tool-execution-sandbox-plans.jsonl"); }
function consentPath(): string { return path.join(dataDir(), "tool-consent-requests.json"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); try { readFileSync(bindingPath(), "utf8"); } catch { writeFileSync(bindingPath(), "[]\n", "utf8"); } try { readFileSync(consentPath(), "utf8"); } catch { writeFileSync(consentPath(), "[]\n", "utf8"); } }
function readJsonArray(file: string): any[] { try { const parsed=JSON.parse(readFileSync(file,"utf8")); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function writeJsonArray(file: string, value: any[]): void { ensureStore(); writeFileSync(file, JSON.stringify(value,null,2)+"\n", "utf8"); }
function readJsonl(file: string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
export function listToolAdapterConsentBindings(): ToolAdapterConsentBinding[] { ensureStore(); return readJsonArray(bindingPath()).sort((a,b)=>String(b.requestedAt).localeCompare(String(a.requestedAt))); }
export function createToolAdapterConsentBinding(input: { toolExecutionPlanId: string; metadata?: Record<string, unknown> }): ToolAdapterConsentBinding {
  ensureStore();
  const toolExecutionPlanId=input.toolExecutionPlanId.trim();
  if(!toolExecutionPlanId) throw new Error("toolExecutionPlanId ist erforderlich.");
  const plan = readJsonl(plansPath()).find((entry:any)=>entry && entry.id===toolExecutionPlanId);
  if(!plan) throw new Error("Tool Execution Plan nicht gefunden.");
  const now=new Date().toISOString();
  const consentRequestId=makeId("tool-adapter-consent");
  const binding: ToolAdapterConsentBinding={
    id: makeId("tool-adapter-binding"),
    toolExecutionPlanId,
    consentRequestId,
    status:"pending",
    source:"tool-adapter-sandbox",
    requestedAt:now,
    adapterId: plan.adapterId,
    adapterName: plan.adapterName,
    requestedAction: plan.requestedAction,
    consentUrl:"/tool-consent?requestId="+encodeURIComponent(consentRequestId),
    toolExecutionAllowed:false,
    dryRunOnly:true,
    metadata:{ ...(input.metadata||{}), source:"tool-adapter-sandbox", planDecision: plan.decision, toolExecutionAllowed:false, dryRunOnly:true },
  };
  const consentRequest={
    id: consentRequestId,
    status:"pending",
    toolId:"tool-adapter:"+(plan.adapterName||plan.adapterId||"unknown-adapter"),
    toolName:"Controlled Tool Adapter Sandbox",
    reason:"Tool Adapter Consent Binding für Dry-run Tool Execution Plan. Phase 13.1 erlaubt weiterhin keine echte Tool-Ausführung.",
    userInputPreview:String(plan.requestedAction||"tool-adapter-action").slice(0,240),
    sensitivity:"internal",
    processingMode:"local_only",
    requestedAt:now,
    createdAt:now,
    source:"tool-adapter-sandbox",
    metadata:{ toolExecutionPlanId, bindingId:binding.id, dryRunOnly:true, toolExecutionAllowed:false },
  };
  writeJsonArray(consentPath(), [consentRequest, ...readJsonArray(consentPath())]);
  writeJsonArray(bindingPath(), [binding, ...readJsonArray(bindingPath())]);
  return binding;
}
export function syncToolAdapterConsentBindingStatuses(): ToolAdapterConsentBinding[] {
  const consentRequests=readJsonArray(consentPath());
  const bindings=readJsonArray(bindingPath());
  let changed=false;
  const synced=bindings.map((binding:any)=>{
    const request=consentRequests.find((entry:any)=>entry && entry.id===binding.consentRequestId);
    if(!request || request.status===binding.status) return binding;
    changed=true;
    return { ...binding, status: request.status, decidedAt: request.decidedAt || request.updatedAt || binding.decidedAt };
  });
  if(changed) writeJsonArray(bindingPath(), synced);
  return synced.sort((a:any,b:any)=>String(b.requestedAt).localeCompare(String(a.requestedAt)));
}
export function summarizeToolAdapterConsentBindings(bindings: ToolAdapterConsentBinding[]) { const byStatus: Record<string, number>={}; for(const binding of bindings) byStatus[binding.status]=(byStatus[binding.status]||0)+1; return { total: bindings.length, byStatus }; }
`;
const api = String.raw`import { createToolAdapterConsentBinding, summarizeToolAdapterConsentBindings, syncToolAdapterConsentBindingStatuses } from "../../../lib/tool-adapter-consent-binding-store";
export const dynamic = "force-dynamic";
export async function GET(){
  try{
    const bindings=syncToolAdapterConsentBindingStatuses();
    return Response.json({ ok:true, summary:summarizeToolAdapterConsentBindings(bindings), bindings });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Consent Bindings konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const binding=createToolAdapterConsentBinding({ toolExecutionPlanId: typeof body.toolExecutionPlanId === "string" ? body.toolExecutionPlanId : "", metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok:true, binding });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Consent Binding konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Plan = { id:string; adapterName?:string; decision:string; requestedAction:string };
type Binding = { id:string; toolExecutionPlanId:string; consentRequestId:string; status:string; adapterName?:string; requestedAction?:string; consentUrl:string; requestedAt:string; toolExecutionAllowed:boolean; dryRunOnly:boolean };
export default function ToolAdapterConsentPage(){
  const [plans,setPlans]=useState<Plan[]>([]);
  const [bindings,setBindings]=useState<Binding[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const planRes=await fetch("/api/tool-adapters?limit=100", { cache:"no-store" });
      const planPayload=await planRes.json();
      if(planRes.ok){ const list=Array.isArray(planPayload.plans) ? planPayload.plans : []; setPlans(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
      const bindingRes=await fetch("/api/tool-adapter-consent", { cache:"no-store" });
      const bindingPayload=await bindingRes.json();
      if(!bindingRes.ok) throw new Error(bindingPayload?.error || "Bindings konnten nicht geladen werden.");
      setBindings(Array.isArray(bindingPayload.bindings) ? bindingPayload.bindings : []);
      setSummary(bindingPayload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function createBinding(){
    const res=await fetch("/api/tool-adapter-consent", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ toolExecutionPlanId:selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Binding fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="tool-adapter-consent" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)", borderColor:"#93c5fd" }}><h1 className="section-title">Tool Adapter Consent Binding</h1><p style={{ lineHeight:1.6 }}>Phase 13.1 bindet Dry-run Tool Execution Plans an Consent Requests. Auch nach Approval bleibt echte Tool-Ausführung deaktiviert.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Binding erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{plans.map((plan)=><option key={plan.id} value={plan.id}>{plan.adapterName || "unknown-adapter"} · {plan.decision} · {plan.id}</option>)}</select><button className="primary-button" type="button" onClick={createBinding} disabled={!selected}>Tool Adapter Consent Binding erstellen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Bindings</h2>{bindings.length===0 ? <p>Noch keine Tool Adapter Consent Bindings.</p> : bindings.map((binding)=><article key={binding.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{binding.adapterName || "unknown-adapter"}</strong> <span className="chip">{binding.status}</span></div><div className="helper-text"><code>{binding.id}</code> · {binding.requestedAt}</div><p><strong>Plan:</strong> <code>{binding.toolExecutionPlanId}</code></p><p><strong>Consent Request:</strong> <code>{binding.consentRequestId}</code></p>{binding.requestedAction ? <p><strong>Action:</strong> {binding.requestedAction}</p> : null}<p><strong>Tool execution allowed:</strong> {String(binding.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(binding.dryRunOnly)}</p><a className="nav-link" href={binding.consentUrl}>Consent Request öffnen</a></article>)}</section></div></main>;
}
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "tool-adapter-consent"')){
    const marker='  { href: "/tool-sandbox", label: "Tool Sandbox", key: "tool-sandbox" },';
    const line='  { href: "/tool-adapter-consent", label: "Tool Consent Binding", key: "tool-adapter-consent" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line);
    else content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', line+'\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Tool Adapter Consent Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Tool Adapter Consent bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase13-1-tool-adapter-consent-binding.md", `# Phase 13.1 – Tool Adapter Consent Binding

## Ziel
Dry-run Tool Execution Plans aus Phase 13.0 werden an Consent Requests gebunden.

## Sicherheitsprinzip
Auch wenn ein Tool Adapter Consent Request approved wird, bleibt echte Tool-Ausführung weiterhin deaktiviert.

## Neue UI/API
- UI: /tool-adapter-consent
- API: /api/tool-adapter-consent
- Store: data/tool-adapter-consent-bindings.json
- Consent Requests: data/tool-consent-requests.json

## Flow
1. Tool Execution Plan auswählen.
2. Tool Adapter Consent Binding erzeugen.
3. Tool Consent Request wird mit source tool-adapter-sandbox erstellt.
4. /tool-consent?requestId=<id> öffnen.
5. Status pending/approved/denied/expired wird synchronisiert.

## Nächster Schritt
Phase 13.2 kann Approved Tool Adapter Resume Plan vorbereiten, weiterhin ohne echte Tool-Ausführung.
`);
  ensureFile("docs/phase13-tool-adapter-consent-binding-runbook.md", `# Runbook – Phase 13.1 Tool Adapter Consent Binding

## Patch
\`\`\`powershell
npm run phase13:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase13-1-patch-tool-adapter-consent-binding.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase13:1:verify
npm run build
npm run stack:up:detached
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /tool-sandbox öffnen und Dry-run Plan erzeugen.
2. /tool-adapter-consent öffnen.
3. Plan auswählen und Binding erstellen.
4. Link zu /tool-consent?requestId=<id> öffnen.
5. Approve/Deny testen.
6. /tool-adapter-consent neu laden und Status-Sync prüfen.
`);
}
patchPackage();
ensureFile("frontend/lib/tool-adapter-consent-binding-store.ts", store);
ensureFile("frontend/app/api/tool-adapter-consent/route.ts", api);
ensureFile("frontend/app/tool-adapter-consent/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 13.1 Patch abgeschlossen.");
