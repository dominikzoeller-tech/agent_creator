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
  pkg.scripts["phase11:6:patch"]="node scripts/phase11-6-patch-controlled-agent-registry-activation.cjs";
  pkg.scripts["phase11:6:verify"]="node scripts/phase11-6-verify-controlled-agent-registry-activation.cjs";
  pkg.scripts["agents:registry:verify"]="node scripts/phase11-6-verify-controlled-agent-registry-activation.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 11.6 Scripts eingetragen.");
}
const rootRegistry = String.raw`import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type ControlledAgentStatus = "registered" | "disabled" | "test_mode" | "active";
export interface ControlledAgentRegistryEntry {
  id: string;
  status: ControlledAgentStatus;
  agentName: string;
  purpose: string;
  source: "agent-blueprint" | "manual-ui";
  blueprintProposalId?: string;
  requestedCapability?: string;
  allowedTools: string[];
  permissions: string[];
  riskLevel: "low" | "medium" | "high";
  requiresConsent: boolean;
  createdAt: string;
  updatedAt: string;
  activationNote?: string;
  metadata?: Record<string, unknown>;
}
function getDataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");
}
function getFilePath(): string {
  return path.join(getDataDir(), "controlled-agent-registry.json");
}
function ensureStore(): void {
  mkdirSync(getDataDir(), { recursive: true });
  try { readFileSync(getFilePath(), "utf8"); } catch { writeFileSync(getFilePath(), "[]\n", "utf8"); }
}
function readEntries(): ControlledAgentRegistryEntry[] {
  ensureStore();
  try {
    const parsed = JSON.parse(readFileSync(getFilePath(), "utf8")) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is ControlledAgentRegistryEntry => Boolean(entry && typeof entry === "object" && typeof (entry as ControlledAgentRegistryEntry).id === "string")) : [];
  } catch { return []; }
}
function writeEntries(entries: ControlledAgentRegistryEntry[]): void {
  ensureStore();
  writeFileSync(getFilePath(), JSON.stringify(entries, null, 2) + "\n", "utf8");
}
function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9äöüß_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "controlled-agent";
}
function idFor(agentName: string, timestamp: string): string {
  return "agent-" + slug(agentName) + "-" + timestamp.replace(/[^0-9]/g, "").slice(0, 14);
}
export function registerControlledAgentFromBlueprint(input: {
  agentName: string;
  purpose: string;
  blueprintProposalId?: string;
  requestedCapability?: string;
  allowedTools?: string[];
  permissions?: string[];
  riskLevel?: "low" | "medium" | "high";
  activationNote?: string;
  metadata?: Record<string, unknown>;
}): ControlledAgentRegistryEntry {
  const now = new Date().toISOString();
  const agentName = input.agentName.trim();
  if (!agentName) throw new Error("agentName ist erforderlich.");
  const entries = readEntries();
  const id = idFor(agentName, now);
  const entry: ControlledAgentRegistryEntry = {
    id,
    status: "test_mode",
    agentName,
    purpose: input.purpose || "Kontrolliert registrierter Agent aus Blueprint Proposal.",
    source: "agent-blueprint",
    blueprintProposalId: input.blueprintProposalId,
    requestedCapability: input.requestedCapability,
    allowedTools: input.allowedTools || [],
    permissions: input.permissions || [],
    riskLevel: input.riskLevel || "medium",
    requiresConsent: true,
    createdAt: now,
    updatedAt: now,
    activationNote: input.activationNote || "Registriert in Test Mode. Keine automatische Ausführung.",
    metadata: input.metadata,
  };
  writeEntries([entry, ...entries]);
  return entry;
}
export function listControlledAgentRegistryEntries(): ControlledAgentRegistryEntry[] {
  return readEntries().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
`;
const frontendStore = String.raw`import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
export type ControlledAgentStatus = "registered" | "disabled" | "test_mode" | "active";
export interface ControlledAgentRegistryEntry { id:string; status:ControlledAgentStatus; agentName:string; purpose:string; source?:string; blueprintProposalId?:string; requestedCapability?:string; allowedTools:string[]; permissions:string[]; riskLevel:"low"|"medium"|"high"; requiresConsent:boolean; createdAt:string; updatedAt:string; activationNote?:string; metadata?:Record<string, unknown>; }
function dataDir(){ return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function filePath(){ return path.join(dataDir(), "controlled-agent-registry.json"); }
async function ensureStore(){ await mkdir(dataDir(), { recursive:true }); try{ await readFile(filePath(), "utf8"); } catch { await writeFile(filePath(), "[]\n", "utf8"); } }
async function readEntries(): Promise<ControlledAgentRegistryEntry[]>{ await ensureStore(); try{ const parsed=JSON.parse(await readFile(filePath(), "utf8")); return Array.isArray(parsed) ? parsed.filter((entry:any)=>entry && typeof entry.id === "string") : []; } catch { return []; } }
async function writeEntries(entries: ControlledAgentRegistryEntry[]){ await ensureStore(); await writeFile(filePath(), JSON.stringify(entries, null, 2) + "\n", "utf8"); }
function slug(value:string){ return value.toLowerCase().replace(/[^a-z0-9äöüß_-]+/g, "-").replace(/^-|-$/g, "").slice(0,55) || "controlled-agent"; }
function idFor(agentName:string){ const now=new Date().toISOString(); return "agent-" + slug(agentName) + "-" + now.replace(/[^0-9]/g, "").slice(0,14); }
function normalizeList(value: unknown): string[]{ if(Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").map((item)=>item.trim()).filter(Boolean); if(typeof value === "string") return value.split(",").map((item)=>item.trim()).filter(Boolean); return []; }
export async function listControlledAgents(){ const entries=(await readEntries()).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))); const counts=entries.reduce((acc,e)=>{ acc.total++; acc[e.status]=(acc[e.status]||0)+1; return acc; }, { total:0, registered:0, disabled:0, test_mode:0, active:0 } as Record<string, number>); return { ok:true, counts, entries }; }
export async function registerControlledAgent(input: { agentName:string; purpose:string; blueprintProposalId?:string; requestedCapability?:string; allowedTools?:unknown; permissions?:unknown; riskLevel?:"low"|"medium"|"high"; activationNote?:string; metadata?:Record<string, unknown>; }){ const now=new Date().toISOString(); const agentName=input.agentName.trim(); if(!agentName) throw new Error("agentName ist erforderlich."); const purpose=input.purpose.trim(); if(!purpose) throw new Error("purpose ist erforderlich."); const entry: ControlledAgentRegistryEntry = { id:idFor(agentName), status:"test_mode", agentName, purpose, source:"agent-blueprint", blueprintProposalId: input.blueprintProposalId, requestedCapability: input.requestedCapability, allowedTools: normalizeList(input.allowedTools), permissions: normalizeList(input.permissions), riskLevel: input.riskLevel || "medium", requiresConsent:true, createdAt:now, updatedAt:now, activationNote: input.activationNote || "Registriert in Test Mode. Keine automatische Ausführung.", metadata: input.metadata }; await writeEntries([entry, ...(await readEntries())]); return entry; }
export async function updateControlledAgentStatus(input: { id:string; status:ControlledAgentStatus; activationNote?:string }){ const entries=await readEntries(); const index=entries.findIndex((entry)=>entry.id===input.id); if(index<0) return null; entries[index] = { ...entries[index], status: input.status, updatedAt: new Date().toISOString(), activationNote: typeof input.activationNote === "string" ? input.activationNote.slice(0,500) : entries[index].activationNote }; await writeEntries(entries); return entries[index]; }
`;
const apiRoute = String.raw`import { listControlledAgents, registerControlledAgent, updateControlledAgentStatus } from "../../../lib/controlled-agent-registry-store";
export const dynamic = "force-dynamic";
export async function GET(){ try{ return Response.json(await listControlledAgents()); } catch(error){ const message = error instanceof Error ? error.message : "Controlled Agent Registry konnte nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const entry=await registerControlledAgent({ agentName: typeof body.agentName === "string" ? body.agentName : "", purpose: typeof body.purpose === "string" ? body.purpose : "", blueprintProposalId: typeof body.blueprintProposalId === "string" ? body.blueprintProposalId : undefined, requestedCapability: typeof body.requestedCapability === "string" ? body.requestedCapability : undefined, allowedTools: body.allowedTools, permissions: body.permissions, riskLevel: body.riskLevel === "low" || body.riskLevel === "medium" || body.riskLevel === "high" ? body.riskLevel : undefined, activationNote: typeof body.activationNote === "string" ? body.activationNote : undefined, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined }); return Response.json({ ok:true, entry }); } catch(error){ const message = error instanceof Error ? error.message : "Controlled Agent konnte nicht registriert werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
export async function PATCH(request: Request){ try{ const body=await request.json(); const id = typeof body.id === "string" ? body.id : ""; const status = body.status === "registered" || body.status === "disabled" || body.status === "test_mode" || body.status === "active" ? body.status : null; if(!id || !status) return Response.json({ ok:false, error:"id und status registered/disabled/test_mode/active sind erforderlich." }, { status:400 }); const updated=await updateControlledAgentStatus({ id, status, activationNote: typeof body.activationNote === "string" ? body.activationNote : undefined }); if(!updated) return Response.json({ ok:false, error:"Controlled Agent nicht gefunden." }, { status:404 }); return Response.json({ ok:true, entry:updated }); } catch(error){ const message = error instanceof Error ? error.message : "Controlled Agent Status konnte nicht geändert werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
type Entry = { id:string; status:string; agentName:string; purpose:string; requestedCapability?:string; allowedTools?:string[]; permissions?:string[]; riskLevel?:string; updatedAt:string; activationNote?:string };
export default function AgentRegistryPage(){
  const [entries,setEntries]=useState<Entry[]>([]); const [error,setError]=useState<string|null>(null);
  const [agentName,setAgentName]=useState("CustomCapabilityAgent"); const [purpose,setPurpose]=useState("Kontrolliert registrierter Test-Agent ohne automatische Ausführung."); const [capability,setCapability]=useState("custom-tool-capability");
  async function load(){ setError(null); try{ const res=await fetch("/api/agent-registry", { cache:"no-store" }); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error || "Fehler"); setEntries(Array.isArray(payload.entries) ? payload.entries : []); } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); } }
  useEffect(()=>{ load(); }, []);
  async function create(){ const res=await fetch("/api/agent-registry", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ agentName, purpose, requestedCapability: capability, allowedTools:["capability-analyzer"], permissions:["read_context"], riskLevel:"medium" }) }); if(!res.ok){ const p=await res.json(); setError(p?.error || "Registrierung fehlgeschlagen"); } await load(); }
  async function setStatus(id:string,status:"registered"|"disabled"|"test_mode"|"active"){ const res=await fetch("/api/agent-registry", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, status, activationNote:"UI status change: " + status }) }); if(!res.ok){ const p=await res.json(); setError(p?.error || "Status fehlgeschlagen"); } await load(); }
  return <main className="page-wrap"><nav style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:18 }}><a className="nav-link" href="/">Chat</a><a className="nav-link" href="/agent-blueprints">Agent Blueprints</a><a className="nav-link" href="/agent-registry">Agent Registry</a><a className="nav-link" href="/capability-requests">Capability Requests</a><a className="nav-link" href="/system">System</a></nav><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#fef3c7 0%,#f8fafc 100%)", borderColor:"#fde68a" }}><h1 className="section-title">Controlled Agent Registry</h1><p style={{ lineHeight:1.6 }}>Hier werden Agenten kontrolliert registriert. Registrierung bedeutet nicht automatische Ausführung; aktive Nutzung bleibt consent- und permission-gesteuert.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Agent registrieren</h2><input className="text-input" value={agentName} onChange={(e)=>setAgentName(e.target.value)} /><input className="text-input" value={capability} onChange={(e)=>setCapability(e.target.value)} /><textarea className="text-area" value={purpose} onChange={(e)=>setPurpose(e.target.value)} /><button className="primary-button" type="button" onClick={create}>Agent in Test Mode registrieren</button></section><section className="panel-card"><h2>Registry</h2>{entries.length===0 ? <p>Noch keine Controlled Agents.</p> : entries.map((entry)=><article key={entry.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{entry.agentName}</strong> <span className="chip">{entry.status}</span> {entry.riskLevel ? <span className="chip">{entry.riskLevel}</span> : null}</div><div className="helper-text"><code>{entry.id}</code> · {entry.updatedAt}</div><p>{entry.purpose}</p>{entry.requestedCapability ? <p><strong>Capability:</strong> {entry.requestedCapability}</p> : null}{entry.allowedTools?.length ? <p><strong>Allowed Tools:</strong> {entry.allowedTools.join(", ")}</p> : null}{entry.permissions?.length ? <p><strong>Permissions:</strong> {entry.permissions.join(", ")}</p> : null}<div style={{ display:"flex", gap:8, flexWrap:"wrap" }}><button className="secondary-button" onClick={()=>setStatus(entry.id,"test_mode")}>Test Mode</button><button className="secondary-button" onClick={()=>setStatus(entry.id,"registered")}>Registered</button><button className="secondary-button" onClick={()=>setStatus(entry.id,"active")}>Active</button><button className="secondary-button" onClick={()=>setStatus(entry.id,"disabled")}>Disabled</button></div></article>)}</section></div></main>;
}
`;
function patchDockerfile(){ const file="Dockerfile"; if(!exists(file)) return; let content=read(file); if(!content.includes("COPY controlled-agent-registry.ts ./")){ const marker="COPY agent-blueprint-proposal-agent-flow.ts ./\n"; content = content.includes(marker) ? content.replace(marker, marker+"COPY controlled-agent-registry.ts ./\n") : content + "\nCOPY controlled-agent-registry.ts ./\n"; write(file, content); console.log("OK Dockerfile: Controlled Agent Registry aufgenommen."); } else console.log("SKIP Dockerfile: Controlled Agent Registry bereits vorhanden."); }
function patchFrontend(){
  ensureFile("frontend/lib/controlled-agent-registry-store.ts", frontendStore);
  ensureFile("frontend/app/api/agent-registry/route.ts", apiRoute);
  ensureFile("frontend/app/agent-registry/page.tsx", page);
  const app="frontend/app/page.tsx"; if(!exists(app)) return; let content=read(app); const original=content;
  if(!content.includes('href="/agent-registry"')){
    if(content.includes('href="/agent-blueprints"')) content=content.replace(/(<a className="nav-link" href="\/agent-blueprints">[^<]+<\/a>)/, '$1\n        <a className="nav-link" href="/agent-registry">Agent Registry</a>');
  }
  if(content!==original){ write(app, content); console.log("OK frontend/app/page.tsx: Agent Registry Navigation ergänzt."); } else console.log("SKIP frontend/app/page.tsx: Navigation bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase11-6-controlled-agent-registry-activation.md", "# Phase 11.6 – Controlled Agent Registry Activation\n\n## Ziel\nAgent Blueprint Proposals können als Controlled Agent Registry Entries erfasst werden. Das ist keine automatische Code-Erzeugung und keine freie Ausführung. Registrierte Agenten starten im Test Mode und benötigen weiterhin Consent und Permission Governance.\n\n## Flow\n1. Agent/Blueprint wird als Registry Entry gespeichert.\n2. Status startet mit test_mode.\n3. UI /agent-registry erlaubt registered, active, disabled und test_mode.\n4. Aktive Nutzung bleibt späterer separater Runtime-Schritt.\n");
  ensureFile("docs/phase11-controlled-agent-registry-activation-runbook.md", "# Runbook – Phase 11.6 Controlled Agent Registry Activation\n\n## Patch\n```powershell\nnpm run phase11:6:patch\n```\n\nFalls Script noch nicht registriert ist:\n```powershell\nnode scripts/phase11-6-patch-controlled-agent-registry-activation.cjs\n```\n\n## Verify\n```powershell\nnpm run phase11:6:verify\nnpm run build\nnpm run stack:health\n```\n\n## Manuelle Prüfung\n1. /agent-registry öffnen.\n2. Agent in Test Mode registrieren.\n3. Status auf active, disabled, registered oder test_mode setzen.\n4. Sicherstellen: Es wird keine automatische Tool-Ausführung gestartet.\n");
}
patchPackage();
ensureFile("controlled-agent-registry.ts", rootRegistry);
patchDockerfile();
patchFrontend();
patchDocs();
console.log("Phase 11.6 Patch abgeschlossen.");
