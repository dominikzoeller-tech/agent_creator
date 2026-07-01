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
  pkg.scripts["phase12:0:patch"]="node scripts/phase12-0-patch-controlled-agent-runtime-foundation.cjs";
  pkg.scripts["phase12:0:verify"]="node scripts/phase12-0-verify-controlled-agent-runtime-foundation.cjs";
  pkg.scripts["agents:runtime:verify"]="node scripts/phase12-0-verify-controlled-agent-runtime-foundation.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.0 Scripts eingetragen.");
}
const runtimeLib = String.raw`import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import path from "node:path";

export type RuntimeMode = "dry_run" | "test_mode";
export type RuntimeDecision = "allowed_dry_run" | "blocked_disabled" | "blocked_missing_agent" | "blocked_not_active" | "blocked_permission" | "consent_required";

export interface ControlledAgentRuntimeEnvelope {
  id: string;
  timestamp: string;
  mode: RuntimeMode;
  decision: RuntimeDecision;
  agentId?: string;
  agentName?: string;
  requestedAction: string;
  status?: string;
  requiredPermissions: string[];
  grantedPermissions: string[];
  missingPermissions: string[];
  requiresConsent: boolean;
  consentRequired: boolean;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");
}
function registryPath(): string {
  return path.join(dataDir(), "controlled-agent-registry.json");
}
function runtimeLogPath(): string {
  return path.join(dataDir(), "controlled-agent-runtime-envelopes.jsonl");
}
function ensureDataDir(): void {
  mkdirSync(dataDir(), { recursive: true });
}
function readRegistry(): any[] {
  ensureDataDir();
  try {
    const parsed = JSON.parse(readFileSync(registryPath(), "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function makeId(prefix: string): string {
  const now = new Date().toISOString();
  return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8);
}
function appendEnvelope(envelope: ControlledAgentRuntimeEnvelope): void {
  ensureDataDir();
  appendFileSync(runtimeLogPath(), JSON.stringify(envelope) + "\n", "utf8");
}
export function listControlledAgentRuntimeEnvelopes(limit = 100): ControlledAgentRuntimeEnvelope[] {
  ensureDataDir();
  try {
    const raw = readFileSync(runtimeLogPath(), "utf8");
    return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      try { return JSON.parse(line) as ControlledAgentRuntimeEnvelope; } catch { return null; }
    }).filter((entry): entry is ControlledAgentRuntimeEnvelope => Boolean(entry)).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0, Math.max(1, Math.min(limit, 500)));
  } catch { return []; }
}
export function createControlledAgentRuntimeEnvelope(input: { agentId?: string; agentName?: string; requestedAction: string; requiredPermissions?: string[]; mode?: RuntimeMode; metadata?: Record<string, unknown>; }): ControlledAgentRuntimeEnvelope {
  const registry = readRegistry();
  const agent = registry.find((entry) => (input.agentId && entry.id === input.agentId) || (input.agentName && entry.agentName === input.agentName));
  const requiredPermissions = input.requiredPermissions || [];
  const grantedPermissions = Array.isArray(agent?.permissions) ? agent.permissions.filter((p: unknown): p is string => typeof p === "string") : [];
  const missingPermissions = requiredPermissions.filter((permission) => !grantedPermissions.includes(permission));
  let decision: RuntimeDecision = "allowed_dry_run";
  let reason = "Dry-run Runtime Envelope erstellt. Keine echte Tool-Ausführung erlaubt.";
  if (!agent) { decision = "blocked_missing_agent"; reason = "Controlled Agent Registry Entry nicht gefunden."; }
  else if (agent.status === "disabled") { decision = "blocked_disabled"; reason = "Controlled Agent ist disabled."; }
  else if (agent.status !== "active" && agent.status !== "test_mode") { decision = "blocked_not_active"; reason = "Controlled Agent ist nicht active/test_mode."; }
  else if (missingPermissions.length > 0) { decision = "blocked_permission"; reason = "Erforderliche Permissions fehlen."; }
  else if (agent.requiresConsent !== false) { decision = "consent_required"; reason = "Consent wäre vor echter Ausführung erforderlich; Phase 12.0 erlaubt nur Dry-run."; }
  const envelope: ControlledAgentRuntimeEnvelope = {
    id: makeId("runtime-envelope"),
    timestamp: new Date().toISOString(),
    mode: input.mode || "dry_run",
    decision,
    agentId: agent?.id || input.agentId,
    agentName: agent?.agentName || input.agentName,
    requestedAction: input.requestedAction,
    status: agent?.status,
    requiredPermissions,
    grantedPermissions,
    missingPermissions,
    requiresConsent: agent?.requiresConsent !== false,
    consentRequired: agent?.requiresConsent !== false,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    reason,
    metadata: input.metadata,
  };
  appendEnvelope(envelope);
  return envelope;
}
export function summarizeControlledAgentRuntime(envelopes: ControlledAgentRuntimeEnvelope[]) {
  const byDecision: Record<string, number> = {};
  const byMode: Record<string, number> = {};
  for (const envelope of envelopes) {
    byDecision[envelope.decision] = (byDecision[envelope.decision] || 0) + 1;
    byMode[envelope.mode] = (byMode[envelope.mode] || 0) + 1;
  }
  return { total: envelopes.length, byDecision, byMode };
}
`;
const apiRoute = String.raw`import { createControlledAgentRuntimeEnvelope, listControlledAgentRuntimeEnvelopes, summarizeControlledAgentRuntime } from "../../../lib/controlled-agent-runtime-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const envelopes = listControlledAgentRuntimeEnvelopes(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeControlledAgentRuntime(envelopes), envelopes });
  } catch(error){
    const message = error instanceof Error ? error.message : "Controlled Agent Runtime konnte nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const requiredPermissions = Array.isArray(body.requiredPermissions) ? body.requiredPermissions.filter((item: unknown): item is string => typeof item === "string") : [];
    const envelope = createControlledAgentRuntimeEnvelope({
      agentId: typeof body.agentId === "string" ? body.agentId : undefined,
      agentName: typeof body.agentName === "string" ? body.agentName : undefined,
      requestedAction: typeof body.requestedAction === "string" ? body.requestedAction : "dry-run",
      requiredPermissions,
      mode: body.mode === "test_mode" ? "test_mode" : "dry_run",
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });
    return Response.json({ ok:true, envelope });
  } catch(error){
    const message = error instanceof Error ? error.message : "Controlled Agent Runtime Envelope konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Envelope = { id:string; timestamp:string; mode:string; decision:string; agentId?:string; agentName?:string; requestedAction:string; status?:string; reason:string; toolExecutionAllowed:boolean; dryRunOnly:boolean; missingPermissions?:string[] };
export default function AgentRuntimePage(){
  const [envelopes,setEnvelopes]=useState<Envelope[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [error,setError]=useState<string|null>(null);
  const [agentName,setAgentName]=useState("CustomCapabilityAgent");
  const [requestedAction,setRequestedAction]=useState("dry-run analyze requested capability");
  const [permissions,setPermissions]=useState("read_context");
  async function load(){
    setError(null);
    try{
      const res=await fetch("/api/agent-runtime?limit=100", { cache:"no-store" });
      const payload=await res.json();
      if(!res.ok) throw new Error(payload?.error || "Runtime konnte nicht geladen werden.");
      setEnvelopes(Array.isArray(payload.envelopes) ? payload.envelopes : []);
      setSummary(payload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function createEnvelope(){
    const requiredPermissions = permissions.split(",").map((item)=>item.trim()).filter(Boolean);
    const res=await fetch("/api/agent-runtime", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ agentName, requestedAction, requiredPermissions, mode:"dry_run" }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Envelope fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="agent-runtime" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#eef2ff 0%,#f8fafc 100%)", borderColor:"#a5b4fc" }}><h1 className="section-title">Controlled Agent Runtime Foundation</h1><p style={{ lineHeight:1.6 }}>Phase 12.0 erzeugt nur Dry-run Runtime Envelopes. Es wird kein Tool ausgeführt und kein Agent frei gestartet.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Dry-run Envelope erstellen</h2><input className="text-input" value={agentName} onChange={(e)=>setAgentName(e.target.value)} /><input className="text-input" value={requestedAction} onChange={(e)=>setRequestedAction(e.target.value)} /><input className="text-input" value={permissions} onChange={(e)=>setPermissions(e.target.value)} /><button className="primary-button" type="button" onClick={createEnvelope}>Dry-run Envelope erzeugen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Runtime Envelopes</h2>{envelopes.length===0 ? <p>Noch keine Runtime Envelopes.</p> : envelopes.map((env)=><article key={env.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{env.agentName || env.agentId || "unknown-agent"}</strong> <span className="chip">{env.decision}</span> <span className="chip">{env.mode}</span></div><div className="helper-text"><code>{env.id}</code> · {env.timestamp}</div><p><strong>Action:</strong> {env.requestedAction}</p><p><strong>Reason:</strong> {env.reason}</p><p><strong>Tool execution allowed:</strong> {String(env.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(env.dryRunOnly)}</p>{env.missingPermissions?.length ? <p><strong>Missing permissions:</strong> {env.missingPermissions.join(", ")}</p> : null}</article>)}</section></div></main>;
}
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "agent-runtime"')){
    const marker='  { href: "/governance-audit", label: "Audit Trail", key: "governance-audit" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n  { href: "/agent-runtime", label: "Agent Runtime", key: "agent-runtime" },');
    else content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', '  { href: "/agent-runtime", label: "Agent Runtime", key: "agent-runtime" },\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Agent Runtime Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Agent Runtime bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase12-0-controlled-agent-runtime-foundation.md", `# Phase 12.0 – Controlled Agent Runtime Foundation

## Ziel
Eine sichere Runtime-Grundlage für registrierte Controlled Agents schaffen, ohne echte Tool-Ausführung zu erlauben.

## Prinzip
Phase 12.0 erzeugt ausschließlich Runtime Envelopes im Dry-run/Test-Modus.

## Sicherheitsregeln
- toolExecutionAllowed ist immer false.
- dryRunOnly ist immer true.
- disabled Agents werden blockiert.
- fehlende Agents werden blockiert.
- fehlende Permissions werden blockiert.
- requiresConsent führt zu consent_required, aber noch nicht zu echter Ausführung.

## Neue UI/API
- UI: /agent-runtime
- API: /api/agent-runtime
- Store: data/controlled-agent-runtime-envelopes.jsonl

## Nächster Schritt
Phase 12.1 sollte Consent Binding für Runtime Envelopes vorbereiten.
`);
  ensureFile("docs/phase12-controlled-agent-runtime-foundation-runbook.md", `# Runbook – Phase 12.0 Controlled Agent Runtime Foundation

## Patch
\`\`\`powershell
npm run phase12:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase12-0-patch-controlled-agent-runtime-foundation.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase12:0:verify
npm run build
npm run stack:up:detached
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /agent-runtime öffnen.
2. Dry-run Envelope erzeugen.
3. Prüfen: toolExecutionAllowed=false und dryRunOnly=true.
4. /api/agent-runtime prüfen.
`);
}
function patchPackage(){
  const file="package.json"; const pkg=JSON.parse(read(file)); pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase12:0:patch"]="node scripts/phase12-0-patch-controlled-agent-runtime-foundation.cjs";
  pkg.scripts["phase12:0:verify"]="node scripts/phase12-0-verify-controlled-agent-runtime-foundation.cjs";
  pkg.scripts["agents:runtime:verify"]="node scripts/phase12-0-verify-controlled-agent-runtime-foundation.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.0 Scripts eingetragen.");
}
patchPackage();
ensureFile("frontend/lib/controlled-agent-runtime-store.ts", runtimeLib);
ensureFile("frontend/app/api/agent-runtime/route.ts", apiRoute);
ensureFile("frontend/app/agent-runtime/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 12.0 Patch abgeschlossen.");
