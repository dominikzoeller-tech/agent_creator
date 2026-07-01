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
  pkg.scripts["phase12:1:patch"]="node scripts/phase12-1-patch-runtime-consent-binding.cjs";
  pkg.scripts["phase12:1:verify"]="node scripts/phase12-1-verify-runtime-consent-binding.cjs";
  pkg.scripts["agents:runtime:consent:verify"]="node scripts/phase12-1-verify-runtime-consent-binding.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.1 Scripts eingetragen.");
}
const bindingStore = String.raw`import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type RuntimeConsentBindingStatus = "pending" | "approved" | "denied" | "expired";
export interface RuntimeConsentBinding {
  id: string;
  runtimeEnvelopeId: string;
  consentRequestId: string;
  status: RuntimeConsentBindingStatus;
  source: "agent-runtime";
  requestedAt: string;
  decidedAt?: string;
  agentId?: string;
  agentName?: string;
  requestedAction?: string;
  consentUrl: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function bindingPath(): string { return path.join(dataDir(), "agent-runtime-consent-bindings.json"); }
function runtimePath(): string { return path.join(dataDir(), "controlled-agent-runtime-envelopes.jsonl"); }
function consentPath(): string { return path.join(dataDir(), "tool-consent-requests.json"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); try { readFileSync(bindingPath(), "utf8"); } catch { writeFileSync(bindingPath(), "[]\n", "utf8"); } try { readFileSync(consentPath(), "utf8"); } catch { writeFileSync(consentPath(), "[]\n", "utf8"); } }
function readBindings(): RuntimeConsentBinding[] { ensureStore(); try { const parsed = JSON.parse(readFileSync(bindingPath(), "utf8")); return Array.isArray(parsed) ? parsed.filter((entry: any) => entry && typeof entry.id === "string") : []; } catch { return []; } }
function writeBindings(bindings: RuntimeConsentBinding[]): void { ensureStore(); writeFileSync(bindingPath(), JSON.stringify(bindings, null, 2) + "\n", "utf8"); }
function readConsentRequests(): any[] { ensureStore(); try { const parsed = JSON.parse(readFileSync(consentPath(), "utf8")); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function writeConsentRequests(requests: any[]): void { ensureStore(); writeFileSync(consentPath(), JSON.stringify(requests, null, 2) + "\n", "utf8"); }
function readRuntimeEnvelopes(): any[] { try { const raw = readFileSync(runtimePath(), "utf8"); return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
export function listRuntimeConsentBindings(): RuntimeConsentBinding[] { return readBindings().sort((a,b)=>String(b.requestedAt).localeCompare(String(a.requestedAt))); }
export function createRuntimeConsentBinding(input: { runtimeEnvelopeId: string; metadata?: Record<string, unknown> }): RuntimeConsentBinding {
  ensureStore();
  const runtimeEnvelopeId = input.runtimeEnvelopeId.trim();
  if (!runtimeEnvelopeId) throw new Error("runtimeEnvelopeId ist erforderlich.");
  const envelope = readRuntimeEnvelopes().find((entry) => entry && entry.id === runtimeEnvelopeId);
  if (!envelope) throw new Error("Runtime Envelope nicht gefunden.");
  const now = new Date().toISOString();
  const consentRequestId = makeId("runtime-consent");
  const binding: RuntimeConsentBinding = {
    id: makeId("runtime-binding"),
    runtimeEnvelopeId,
    consentRequestId,
    status: "pending",
    source: "agent-runtime",
    requestedAt: now,
    agentId: envelope.agentId,
    agentName: envelope.agentName,
    requestedAction: envelope.requestedAction,
    consentUrl: "/tool-consent?requestId=" + encodeURIComponent(consentRequestId),
    metadata: { ...(input.metadata || {}), source: "agent-runtime", envelopeDecision: envelope.decision, dryRunOnly: envelope.dryRunOnly, toolExecutionAllowed: envelope.toolExecutionAllowed },
  };
  const consentRequest = {
    id: consentRequestId,
    status: "pending",
    toolId: "agent-runtime:" + (envelope.agentName || envelope.agentId || "unknown-agent"),
    toolName: "Controlled Agent Runtime",
    reason: "Runtime Consent Binding für Dry-run Envelope. Phase 12.1 erlaubt weiterhin keine echte Tool-Ausführung.",
    userInputPreview: String(envelope.requestedAction || "runtime-action").slice(0,240),
    sensitivity: "internal",
    processingMode: "local_only",
    requestedAt: now,
    createdAt: now,
    source: "agent-runtime",
    metadata: { runtimeEnvelopeId, bindingId: binding.id, dryRunOnly: true, toolExecutionAllowed: false },
  };
  writeConsentRequests([consentRequest, ...readConsentRequests()]);
  writeBindings([binding, ...readBindings()]);
  return binding;
}
export function syncRuntimeConsentBindingStatuses(): RuntimeConsentBinding[] {
  const consentRequests = readConsentRequests();
  const bindings = readBindings();
  let changed = false;
  const synced = bindings.map((binding) => {
    const request = consentRequests.find((entry: any) => entry && entry.id === binding.consentRequestId);
    if (!request || request.status === binding.status) return binding;
    changed = true;
    return { ...binding, status: request.status, decidedAt: request.decidedAt || request.updatedAt || binding.decidedAt };
  });
  if (changed) writeBindings(synced);
  return synced.sort((a,b)=>String(b.requestedAt).localeCompare(String(a.requestedAt)));
}
export function summarizeRuntimeConsentBindings(bindings: RuntimeConsentBinding[]) { const byStatus: Record<string, number> = {}; for (const binding of bindings) byStatus[binding.status] = (byStatus[binding.status] || 0) + 1; return { total: bindings.length, byStatus }; }
`;
const apiRoute = String.raw`import { createRuntimeConsentBinding, listRuntimeConsentBindings, summarizeRuntimeConsentBindings, syncRuntimeConsentBindingStatuses } from "../../../lib/agent-runtime-consent-binding-store";
export const dynamic = "force-dynamic";
export async function GET(){
  try{
    const bindings = syncRuntimeConsentBindingStatuses();
    return Response.json({ ok:true, summary: summarizeRuntimeConsentBindings(bindings), bindings });
  } catch(error){
    const message = error instanceof Error ? error.message : "Runtime Consent Bindings konnten nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const binding = createRuntimeConsentBinding({ runtimeEnvelopeId: typeof body.runtimeEnvelopeId === "string" ? body.runtimeEnvelopeId : "", metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok:true, binding });
  } catch(error){
    const message = error instanceof Error ? error.message : "Runtime Consent Binding konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Binding = { id:string; runtimeEnvelopeId:string; consentRequestId:string; status:string; agentName?:string; requestedAction?:string; consentUrl:string; requestedAt:string };
type Envelope = { id:string; agentName?:string; requestedAction:string; decision:string; timestamp:string };
export default function AgentRuntimeConsentPage(){
  const [bindings,setBindings]=useState<Binding[]>([]);
  const [envelopes,setEnvelopes]=useState<Envelope[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const bindingRes=await fetch("/api/agent-runtime-consent", { cache:"no-store" });
      const bindingPayload=await bindingRes.json();
      if(!bindingRes.ok) throw new Error(bindingPayload?.error || "Bindings konnten nicht geladen werden.");
      setBindings(Array.isArray(bindingPayload.bindings) ? bindingPayload.bindings : []);
      setSummary(bindingPayload.summary || null);
      const runtimeRes=await fetch("/api/agent-runtime?limit=100", { cache:"no-store" });
      const runtimePayload=await runtimeRes.json();
      if(runtimeRes.ok){ const list = Array.isArray(runtimePayload.envelopes) ? runtimePayload.envelopes : []; setEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function createBinding(){
    const res=await fetch("/api/agent-runtime-consent", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ runtimeEnvelopeId: selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Binding fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="agent-runtime-consent" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)", borderColor:"#86efac" }}><h1 className="section-title">Runtime Consent Binding</h1><p style={{ lineHeight:1.6 }}>Phase 12.1 bindet Runtime Envelopes an Consent Requests. Auch nach Approval bleibt echte Tool-Ausführung weiterhin deaktiviert.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Binding erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{envelopes.map((env)=><option key={env.id} value={env.id}>{env.agentName || "unknown-agent"} · {env.decision} · {env.id}</option>)}</select><button className="primary-button" type="button" onClick={createBinding} disabled={!selected}>Runtime Consent Binding erstellen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Bindings</h2>{bindings.length===0 ? <p>Noch keine Runtime Consent Bindings.</p> : bindings.map((binding)=><article key={binding.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{binding.agentName || "unknown-agent"}</strong> <span className="chip">{binding.status}</span></div><div className="helper-text"><code>{binding.id}</code> · {binding.requestedAt}</div><p><strong>Envelope:</strong> <code>{binding.runtimeEnvelopeId}</code></p><p><strong>Consent Request:</strong> <code>{binding.consentRequestId}</code></p>{binding.requestedAction ? <p><strong>Action:</strong> {binding.requestedAction}</p> : null}<a className="nav-link" href={binding.consentUrl}>Consent Request öffnen</a></article>)}</section></div></main>;
}
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "agent-runtime-consent"')){
    const marker='  { href: "/agent-runtime", label: "Agent Runtime", key: "agent-runtime" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n  { href: "/agent-runtime-consent", label: "Runtime Consent", key: "agent-runtime-consent" },');
    else content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', '  { href: "/agent-runtime-consent", label: "Runtime Consent", key: "agent-runtime-consent" },\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Runtime Consent Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Runtime Consent bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase12-1-runtime-consent-binding.md", `# Phase 12.1 – Runtime Consent Binding

## Ziel
Runtime Envelopes aus Phase 12.0 werden an Consent Requests gebunden.

## Sicherheitsprinzip
Auch wenn ein Runtime Consent Request approved wird, bleibt echte Tool-Ausführung weiterhin deaktiviert. Phase 12.1 erzeugt nur Binding und Status-Sync.

## Neue UI/API
- UI: /agent-runtime-consent
- API: /api/agent-runtime-consent
- Store: data/agent-runtime-consent-bindings.json
- Consent Requests: data/tool-consent-requests.json

## Flow
1. Runtime Envelope auswählen.
2. Runtime Consent Binding erzeugen.
3. Tool Consent Request wird mit source agent-runtime erstellt.
4. /tool-consent?requestId=<id> kann geöffnet werden.
5. Binding Status synchronisiert pending/approved/denied/expired.

## Nächster Schritt
Phase 12.2 sollte Approved Runtime Resume Envelope vorbereiten, weiterhin ohne echte Tool-Ausführung.
`);
  ensureFile("docs/phase12-runtime-consent-binding-runbook.md", `# Runbook – Phase 12.1 Runtime Consent Binding

## Patch
\`\`\`powershell
npm run phase12:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase12-1-patch-runtime-consent-binding.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase12:1:verify
npm run build
npm run stack:up:detached
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /agent-runtime öffnen und Dry-run Envelope erzeugen.
2. /agent-runtime-consent öffnen.
3. Envelope auswählen und Runtime Consent Binding erstellen.
4. Link zu /tool-consent?requestId=<id> öffnen.
5. Approve/Deny testen.
6. /agent-runtime-consent neu laden und Status-Sync prüfen.
`);
}
function patchPackage(){
  const file="package.json"; const pkg=JSON.parse(read(file)); pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase12:1:patch"]="node scripts/phase12-1-patch-runtime-consent-binding.cjs";
  pkg.scripts["phase12:1:verify"]="node scripts/phase12-1-verify-runtime-consent-binding.cjs";
  pkg.scripts["agents:runtime:consent:verify"]="node scripts/phase12-1-verify-runtime-consent-binding.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.1 Scripts eingetragen.");
}
patchPackage();
ensureFile("frontend/lib/agent-runtime-consent-binding-store.ts", bindingStore);
ensureFile("frontend/app/api/agent-runtime-consent/route.ts", apiRoute);
ensureFile("frontend/app/agent-runtime-consent/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 12.1 Patch abgeschlossen.");
