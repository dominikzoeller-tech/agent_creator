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
  pkg.scripts["phase13:0:patch"]="node scripts/phase13-0-patch-tool-adapter-registry-sandbox.cjs";
  pkg.scripts["phase13:0:verify"]="node scripts/phase13-0-verify-tool-adapter-registry-sandbox.cjs";
  pkg.scripts["tools:adapter:verify"]="node scripts/phase13-0-verify-tool-adapter-registry-sandbox.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 13.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type ToolAdapterStatus = "draft" | "registered" | "disabled" | "test_mode";
export type ToolExecutionPlanDecision = "plan_created" | "blocked_missing_adapter" | "blocked_disabled" | "blocked_unsafe_input" | "blocked_permission" | "consent_required";

export interface ToolAdapterRegistryEntry {
  id: string;
  status: ToolAdapterStatus;
  adapterName: string;
  displayName: string;
  purpose: string;
  allowedInputKeys: string[];
  allowedOutputKeys: string[];
  requiredPermissions: string[];
  riskLevel: "low" | "medium" | "high";
  requiresConsent: boolean;
  executionMode: "dry_run_only";
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionSandboxPlan {
  id: string;
  timestamp: string;
  adapterId?: string;
  adapterName?: string;
  requestedAction: string;
  sanitizedInput: Record<string, unknown>;
  rejectedInputKeys: string[];
  allowedOutputKeys: string[];
  requiredPermissions: string[];
  decision: ToolExecutionPlanDecision;
  requiresConsent: boolean;
  consentRequired: boolean;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function registryPath(): string { return path.join(dataDir(), "tool-adapter-registry.json"); }
function plansPath(): string { return path.join(dataDir(), "tool-execution-sandbox-plans.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); try { readFileSync(registryPath(), "utf8"); } catch { writeFileSync(registryPath(), "[]\n", "utf8"); } }
function readRegistry(): ToolAdapterRegistryEntry[] { ensureStore(); try { const parsed = JSON.parse(readFileSync(registryPath(), "utf8")); return Array.isArray(parsed) ? parsed.filter((entry:any)=>entry && typeof entry.id === "string") : []; } catch { return []; } }
function writeRegistry(entries: ToolAdapterRegistryEntry[]): void { ensureStore(); writeFileSync(registryPath(), JSON.stringify(entries, null, 2) + "\n", "utf8"); }
function readPlans(limit = 100): ToolExecutionSandboxPlan[] { ensureStore(); try { return readFileSync(plansPath(), "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line) as ToolExecutionSandboxPlan; } catch { return null; } }).filter((entry): entry is ToolExecutionSandboxPlan => Boolean(entry)).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0, Math.max(1, Math.min(limit, 500))); } catch { return []; } }
function appendPlan(plan: ToolExecutionSandboxPlan): void { ensureStore(); appendFileSync(plansPath(), JSON.stringify(plan) + "\n", "utf8"); }
function slug(value: string): string { return value.toLowerCase().replace(/[^a-z0-9äöüß_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "tool-adapter"; }
function makeId(prefix: string, value?: string): string { const now = new Date().toISOString(); return prefix + "-" + slug(value || prefix) + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function redact(value: unknown): unknown { if(typeof value !== "string") return value; return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]").replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]").slice(0, 500); }
function normalizeList(value: unknown): string[] { if(Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").map((item)=>item.trim()).filter(Boolean); if(typeof value === "string") return value.split(",").map((item)=>item.trim()).filter(Boolean); return []; }

export function listToolAdapters(): ToolAdapterRegistryEntry[] { return readRegistry().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)); }
export function registerToolAdapter(input: { adapterName: string; displayName?: string; purpose: string; allowedInputKeys?: unknown; allowedOutputKeys?: unknown; requiredPermissions?: unknown; riskLevel?: "low"|"medium"|"high"; requiresConsent?: boolean; metadata?: Record<string, unknown>; }): ToolAdapterRegistryEntry {
  const now = new Date().toISOString();
  const adapterName = input.adapterName.trim();
  if(!adapterName) throw new Error("adapterName ist erforderlich.");
  const entry: ToolAdapterRegistryEntry = {
    id: makeId("tool-adapter", adapterName),
    status: "test_mode",
    adapterName,
    displayName: input.displayName || adapterName,
    purpose: input.purpose || "Controlled Tool Adapter im Dry-run-Modus.",
    allowedInputKeys: normalizeList(input.allowedInputKeys),
    allowedOutputKeys: normalizeList(input.allowedOutputKeys),
    requiredPermissions: normalizeList(input.requiredPermissions),
    riskLevel: input.riskLevel || "medium",
    requiresConsent: input.requiresConsent !== false,
    executionMode: "dry_run_only",
    createdAt: now,
    updatedAt: now,
    metadata: input.metadata,
  };
  writeRegistry([entry, ...readRegistry()]);
  return entry;
}
export function updateToolAdapterStatus(input: { id: string; status: ToolAdapterStatus }): ToolAdapterRegistryEntry | null {
  const entries = readRegistry();
  const index = entries.findIndex((entry)=>entry.id === input.id);
  if(index < 0) return null;
  entries[index] = { ...entries[index], status: input.status, updatedAt: new Date().toISOString() };
  writeRegistry(entries);
  return entries[index];
}
export function createToolExecutionSandboxPlan(input: { adapterId?: string; adapterName?: string; requestedAction: string; input?: Record<string, unknown>; grantedPermissions?: string[]; metadata?: Record<string, unknown>; }): ToolExecutionSandboxPlan {
  const registry = readRegistry();
  const adapter = registry.find((entry) => (input.adapterId && entry.id === input.adapterId) || (input.adapterName && entry.adapterName === input.adapterName));
  const rawInput = input.input || {};
  const sanitizedInput: Record<string, unknown> = {};
  const rejectedInputKeys: string[] = [];
  const allowedInputKeys = adapter?.allowedInputKeys || [];
  for(const [key, value] of Object.entries(rawInput)) {
    if(allowedInputKeys.includes(key)) sanitizedInput[key] = redact(value);
    else rejectedInputKeys.push(key);
  }
  const grantedPermissions = input.grantedPermissions || [];
  const requiredPermissions = adapter?.requiredPermissions || [];
  const missingPermissions = requiredPermissions.filter((permission) => !grantedPermissions.includes(permission));
  let decision: ToolExecutionPlanDecision = "plan_created";
  let reason = "Dry-run Tool Execution Plan erstellt. Keine echte Tool-Ausführung erlaubt.";
  if(!adapter) { decision = "blocked_missing_adapter"; reason = "Tool Adapter nicht gefunden."; }
  else if(adapter.status === "disabled") { decision = "blocked_disabled"; reason = "Tool Adapter ist disabled."; }
  else if(rejectedInputKeys.length > 0) { decision = "blocked_unsafe_input"; reason = "Input enthält nicht erlaubte Keys."; }
  else if(missingPermissions.length > 0) { decision = "blocked_permission"; reason = "Erforderliche Permissions fehlen."; }
  else if(adapter.requiresConsent !== false) { decision = "consent_required"; reason = "Consent wäre vor echter Tool-Ausführung erforderlich; Phase 13.0 erlaubt nur Dry-run Plan."; }
  const plan: ToolExecutionSandboxPlan = {
    id: makeId("tool-plan", adapter?.adapterName || input.adapterName || input.adapterId || "unknown"),
    timestamp: new Date().toISOString(),
    adapterId: adapter?.id || input.adapterId,
    adapterName: adapter?.adapterName || input.adapterName,
    requestedAction: input.requestedAction,
    sanitizedInput,
    rejectedInputKeys,
    allowedOutputKeys: adapter?.allowedOutputKeys || [],
    requiredPermissions,
    decision,
    requiresConsent: adapter?.requiresConsent !== false,
    consentRequired: adapter?.requiresConsent !== false,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    reason,
    metadata: { ...(input.metadata || {}), missingPermissions, phase: "13.0" },
  };
  appendPlan(plan);
  return plan;
}
export function listToolExecutionSandboxPlans(limit = 100): ToolExecutionSandboxPlan[] { return readPlans(limit); }
export function summarizeToolSandboxPlans(plans: ToolExecutionSandboxPlan[]) { const byDecision: Record<string, number> = {}; for(const plan of plans) byDecision[plan.decision] = (byDecision[plan.decision] || 0) + 1; return { total: plans.length, byDecision }; }
export function summarizeToolAdapters(entries: ToolAdapterRegistryEntry[]) { const byStatus: Record<string, number> = {}; const byRiskLevel: Record<string, number> = {}; for(const entry of entries){ byStatus[entry.status] = (byStatus[entry.status] || 0) + 1; byRiskLevel[entry.riskLevel] = (byRiskLevel[entry.riskLevel] || 0) + 1; } return { total: entries.length, byStatus, byRiskLevel }; }
`;
const api = String.raw`import { createToolExecutionSandboxPlan, listToolAdapters, listToolExecutionSandboxPlans, registerToolAdapter, summarizeToolAdapters, summarizeToolSandboxPlans, updateToolAdapterStatus } from "../../../lib/tool-adapter-registry-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const adapters = listToolAdapters();
    const plans = listToolExecutionSandboxPlans(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, adapterSummary: summarizeToolAdapters(adapters), planSummary: summarizeToolSandboxPlans(plans), adapters, plans });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Registry konnte nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    if(body.action === "plan") {
      const plan = createToolExecutionSandboxPlan({
        adapterId: typeof body.adapterId === "string" ? body.adapterId : undefined,
        adapterName: typeof body.adapterName === "string" ? body.adapterName : undefined,
        requestedAction: typeof body.requestedAction === "string" ? body.requestedAction : "dry-run-tool-plan",
        input: body.input && typeof body.input === "object" ? body.input : {},
        grantedPermissions: Array.isArray(body.grantedPermissions) ? body.grantedPermissions.filter((item: unknown): item is string => typeof item === "string") : [],
        metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
      });
      return Response.json({ ok:true, plan });
    }
    const adapter = registerToolAdapter({
      adapterName: typeof body.adapterName === "string" ? body.adapterName : "",
      displayName: typeof body.displayName === "string" ? body.displayName : undefined,
      purpose: typeof body.purpose === "string" ? body.purpose : "Controlled Tool Adapter im Dry-run-Modus.",
      allowedInputKeys: body.allowedInputKeys,
      allowedOutputKeys: body.allowedOutputKeys,
      requiredPermissions: body.requiredPermissions,
      riskLevel: body.riskLevel === "low" || body.riskLevel === "medium" || body.riskLevel === "high" ? body.riskLevel : undefined,
      requiresConsent: body.requiresConsent === false ? false : true,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });
    return Response.json({ ok:true, adapter });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Aktion fehlgeschlagen.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
export async function PATCH(request: Request){
  try{
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const status = body.status === "draft" || body.status === "registered" || body.status === "disabled" || body.status === "test_mode" ? body.status : null;
    if(!id || !status) return Response.json({ ok:false, error:"id und status draft/registered/disabled/test_mode sind erforderlich." }, { status: 400 });
    const updated = updateToolAdapterStatus({ id, status });
    if(!updated) return Response.json({ ok:false, error:"Tool Adapter nicht gefunden." }, { status: 404 });
    return Response.json({ ok:true, adapter: updated });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Status konnte nicht geändert werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Adapter = { id:string; status:string; adapterName:string; displayName:string; purpose:string; allowedInputKeys:string[]; allowedOutputKeys:string[]; requiredPermissions:string[]; riskLevel:string; requiresConsent:boolean };
type Plan = { id:string; timestamp:string; adapterName?:string; decision:string; requestedAction:string; rejectedInputKeys:string[]; toolExecutionAllowed:boolean; dryRunOnly:boolean; reason:string };
export default function ToolSandboxPage(){
  const [adapters,setAdapters]=useState<Adapter[]>([]);
  const [plans,setPlans]=useState<Plan[]>([]);
  const [adapterSummary,setAdapterSummary]=useState<any>(null);
  const [planSummary,setPlanSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [name,setName]=useState("sample-report-adapter");
  const [purpose,setPurpose]=useState("Dry-run report adapter for controlled sandbox planning.");
  const [inputJson,setInputJson]=useState('{"query":"demo","format":"summary"}');
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const res=await fetch("/api/tool-adapters?limit=100", { cache:"no-store" });
      const payload=await res.json();
      if(!res.ok) throw new Error(payload?.error || "Tool Adapter konnten nicht geladen werden.");
      setAdapters(Array.isArray(payload.adapters) ? payload.adapters : []);
      setPlans(Array.isArray(payload.plans) ? payload.plans : []);
      setAdapterSummary(payload.adapterSummary || null);
      setPlanSummary(payload.planSummary || null);
      if(!selected && payload.adapters?.[0]?.id) setSelected(payload.adapters[0].id);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function register(){
    const res=await fetch("/api/tool-adapters", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ adapterName:name, displayName:name, purpose, allowedInputKeys:["query","format"], allowedOutputKeys:["summary","citations"], requiredPermissions:["read_context"], riskLevel:"medium", requiresConsent:true }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Register fehlgeschlagen"); }
    await load();
  }
  async function plan(){
    let input: Record<string, unknown> = {};
    try { input = JSON.parse(inputJson); } catch { setError("Input JSON ist ungültig."); return; }
    const adapter = adapters.find((entry)=>entry.id===selected);
    const res=await fetch("/api/tool-adapters", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"plan", adapterId:selected, adapterName:adapter?.adapterName, requestedAction:"dry-run tool execution plan", input, grantedPermissions:["read_context"] }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Plan fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="tool-sandbox" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#f0fdfa 0%,#f8fafc 100%)", borderColor:"#5eead4" }}><h1 className="section-title">Controlled Tool Execution Sandbox</h1><p style={{ lineHeight:1.6 }}>Phase 13.0 registriert Tool Adapter und erzeugt Dry-run Tool Execution Plans. Es findet keine echte Tool-Ausführung statt.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Tool Adapter registrieren</h2><input className="text-input" value={name} onChange={(e)=>setName(e.target.value)} /><textarea className="text-area" value={purpose} onChange={(e)=>setPurpose(e.target.value)} /><button className="primary-button" type="button" onClick={register}>Adapter in Test Mode registrieren</button></section><section className="panel-card"><h2>Dry-run Execution Plan</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{adapters.map((adapter)=><option key={adapter.id} value={adapter.id}>{adapter.adapterName} · {adapter.status}</option>)}</select><textarea className="text-area" value={inputJson} onChange={(e)=>setInputJson(e.target.value)} /><button className="primary-button" type="button" onClick={plan} disabled={!selected}>Dry-run Plan erzeugen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify({ adapterSummary, planSummary }, null, 2)}</pre></section><section className="panel-card"><h2>Plans</h2>{plans.length===0 ? <p>Noch keine Tool Execution Plans.</p> : plans.map((item)=><article key={item.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{item.adapterName || "unknown-adapter"}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Action:</strong> {item.requestedAction}</p><p><strong>Reason:</strong> {item.reason}</p><p><strong>Tool execution allowed:</strong> {String(item.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(item.dryRunOnly)}</p>{item.rejectedInputKeys?.length ? <p><strong>Rejected input keys:</strong> {item.rejectedInputKeys.join(", ")}</p> : null}</article>)}</section></div></main>;
}
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "tool-sandbox"')){
    const marker='  { href: "/agent-runtime-dashboard", label: "Runtime Dashboard", key: "agent-runtime-dashboard" },';
    const line='  { href: "/tool-sandbox", label: "Tool Sandbox", key: "tool-sandbox" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line);
    else content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', line+'\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Tool Sandbox Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Tool Sandbox bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase13-0-tool-adapter-registry-sandbox.md", `# Phase 13.0 – Controlled Tool Execution Sandbox / Tool Adapter Registry Foundation

## Ziel
Tool Adapter registrieren und Dry-run Tool Execution Plans erzeugen, ohne echte Tool-Ausführung zu erlauben.

## Sicherheitsregeln
- toolExecutionAllowed ist immer false.
- dryRunOnly ist immer true.
- executionMode ist dry_run_only.
- Nicht erlaubte Input Keys werden rejected.
- Secrets werden redacted.
- Consent-Pflicht wird erkannt, aber keine echte Ausführung gestartet.

## Neue UI/API
- UI: /tool-sandbox
- API: /api/tool-adapters
- Store: data/tool-adapter-registry.json
- Plans: data/tool-execution-sandbox-plans.jsonl

## Nächster Schritt
Phase 13.1 kann Tool Adapter Consent Binding vorbereiten.
`);
  ensureFile("docs/phase13-tool-adapter-registry-sandbox-runbook.md", `# Runbook – Phase 13.0 Tool Adapter Registry Sandbox

## Patch
\`\`\`powershell
npm run phase13:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase13-0-patch-tool-adapter-registry-sandbox.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase13:0:verify
npm run build
npm run stack:up:detached
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /tool-sandbox öffnen.
2. Adapter registrieren.
3. Dry-run Plan erzeugen.
4. Prüfen: toolExecutionAllowed=false und dryRunOnly=true.
`);
}
function patchPackage(){
  const file="package.json"; const pkg=JSON.parse(read(file)); pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase13:0:patch"]="node scripts/phase13-0-patch-tool-adapter-registry-sandbox.cjs";
  pkg.scripts["phase13:0:verify"]="node scripts/phase13-0-verify-tool-adapter-registry-sandbox.cjs";
  pkg.scripts["tools:adapter:verify"]="node scripts/phase13-0-verify-tool-adapter-registry-sandbox.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 13.0 Scripts eingetragen.");
}
patchPackage();
ensureFile("frontend/lib/tool-adapter-registry-store.ts", store);
ensureFile("frontend/app/api/tool-adapters/route.ts", api);
ensureFile("frontend/app/tool-sandbox/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 13.0 Patch abgeschlossen.");
