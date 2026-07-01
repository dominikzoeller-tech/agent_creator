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
  pkg.scripts["phase11:8:patch"]="node scripts/phase11-8-patch-agent-registry-analytics-audit-trail.cjs";
  pkg.scripts["phase11:8:verify"]="node scripts/phase11-8-verify-agent-registry-analytics-audit-trail.cjs";
  pkg.scripts["governance:audit:verify"]="node scripts/phase11-8-verify-agent-registry-analytics-audit-trail.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 11.8 Scripts eingetragen.");
}
const auditStore = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type GovernanceAuditEventType =
  | "capability_request_created"
  | "capability_request_decided"
  | "agent_blueprint_created"
  | "agent_blueprint_decided"
  | "agent_registry_registered"
  | "agent_registry_status_changed";

export interface GovernanceAuditEvent {
  id: string;
  timestamp: string;
  type: GovernanceAuditEventType;
  actor: "agent-flow" | "manual-ui" | "api";
  entityType: "capability-request" | "agent-blueprint" | "agent-registry";
  entityId?: string;
  status?: string;
  previousStatus?: string;
  riskLevel?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data");
}
function auditPath(): string {
  return path.join(dataDir(), "governance-audit.jsonl");
}
function ensureStore(): void {
  mkdirSync(dataDir(), { recursive: true });
  try { readFileSync(auditPath(), "utf8"); } catch { appendFileSync(auditPath(), "", "utf8"); }
}
function eventId(type: string, timestamp: string): string {
  return "audit-" + type.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase() + "-" + timestamp.replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8);
}
export function appendGovernanceAuditEvent(input: Omit<GovernanceAuditEvent, "id" | "timestamp">): GovernanceAuditEvent {
  ensureStore();
  const timestamp = new Date().toISOString();
  const event: GovernanceAuditEvent = { id: eventId(input.type, timestamp), timestamp, ...input };
  appendFileSync(auditPath(), JSON.stringify(event) + "\n", "utf8");
  return event;
}
export function readGovernanceAuditEvents(limit = 250): GovernanceAuditEvent[] {
  ensureStore();
  const raw = readFileSync(auditPath(), "utf8");
  return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    try { return JSON.parse(line) as GovernanceAuditEvent; } catch { return null; }
  }).filter((entry): entry is GovernanceAuditEvent => Boolean(entry)).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0, Math.max(1, Math.min(limit, 1000)));
}
export function summarizeGovernanceAudit(events: GovernanceAuditEvent[]) {
  const byType: Record<string, number> = {};
  const byEntityType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byRiskLevel: Record<string, number> = {};
  for (const event of events) {
    byType[event.type] = (byType[event.type] || 0) + 1;
    byEntityType[event.entityType] = (byEntityType[event.entityType] || 0) + 1;
    if (event.status) byStatus[event.status] = (byStatus[event.status] || 0) + 1;
    if (event.riskLevel) byRiskLevel[event.riskLevel] = (byRiskLevel[event.riskLevel] || 0) + 1;
  }
  return { total: events.length, byType, byEntityType, byStatus, byRiskLevel };
}
`;
const auditApi = String.raw`import { readGovernanceAuditEvents, summarizeGovernanceAudit } from "../../../lib/governance-audit-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "250");
    const events = readGovernanceAuditEvents(Number.isFinite(limit) ? limit : 250);
    return Response.json({ ok:true, summary: summarizeGovernanceAudit(events), events });
  } catch(error){
    const message = error instanceof Error ? error.message : "Governance Audit Trail konnte nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
`;
const auditPage = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type AuditEvent = { id:string; timestamp:string; type:string; actor?:string; entityType:string; entityId?:string; status?:string; riskLevel?:string; summary:string };
export default function GovernanceAuditPage(){
  const [events,setEvents]=useState<AuditEvent[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const res=await fetch("/api/governance-audit?limit=300", { cache:"no-store" });
      const payload=await res.json();
      if(!res.ok) throw new Error(payload?.error || "Governance Audit konnte nicht geladen werden.");
      setEvents(Array.isArray(payload.events) ? payload.events : []);
      setSummary(payload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  return <main className="page-wrap"><UnifiedNavigation active="governance-audit" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)", borderColor:"#67e8f9" }}><h1 className="section-title">Governance Audit Trail</h1><p style={{ lineHeight:1.6 }}>Audit Trail für Capability Requests, Agent Blueprint Proposals und Controlled Agent Registry Events.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Events</h2>{events.length===0 ? <p>Noch keine Governance Audit Events.</p> : events.map((event)=><article key={event.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{event.type}</strong> <span className="chip">{event.entityType}</span> {event.status ? <span className="chip">{event.status}</span> : null} {event.riskLevel ? <span className="chip">{event.riskLevel}</span> : null}</div><div className="helper-text"><code>{event.id}</code> · {event.timestamp} · {event.actor}</div><p>{event.summary}</p>{event.entityId ? <p><strong>Entity:</strong> <code>{event.entityId}</code></p> : null}</article>)}</section></div></main>;
}
`;
function patchUnifiedNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)){ console.log("SKIP UnifiedNavigation fehlt; Phase 11.7 zuerst anwenden."); return; }
  let content=read(file); const original=content;
  if(!content.includes('key: "governance-audit"')){
    content=content.replace('  { href: "/agent-registry", label: "Agent Registry", key: "agent-registry" },', '  { href: "/agent-registry", label: "Agent Registry", key: "agent-registry" },\n  { href: "/governance-audit", label: "Audit Trail", key: "governance-audit" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Audit Trail Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Audit Trail bereits vorhanden.");
}
function patchRoute(file, importLine, replacements){
  if(!exists(file)){ console.log("SKIP " + file + ": nicht gefunden."); return; }
  let content=read(file); const original=content;
  if(!content.includes(importLine)){
    const lines=content.split(/\r?\n/); let last=-1;
    for(let i=0;i<lines.length;i++) if(lines[i].startsWith("import ")) last=i;
    if(last>=0){ lines.splice(last+1,0,importLine); content=lines.join("\n"); }
    else content=importLine+"\n"+content;
  }
  for(const [needle, insert] of replacements){
    if(content.includes(needle) && !content.includes(insert.marker)) content=content.replace(needle, insert.text + needle);
  }
  if(content!==original){ write(file, content); console.log("OK " + file + ": Audit Events ergänzt."); }
  else console.log("SKIP " + file + ": Audit Events bereits vorhanden.");
}
function patchCapabilityRoute(){
  patchRoute("frontend/app/api/capability-requests/route.ts", 'import { appendGovernanceAuditEvent } from "../../../lib/governance-audit-store";', [
    ['return Response.json({ ok:true, request: created });', { marker:'capability_request_created', text:'appendGovernanceAuditEvent({ type: "capability_request_created", actor: "api", entityType: "capability-request", entityId: created.id, status: created.status, riskLevel: created.riskLevel, summary: "Capability Request erstellt: " + created.requestedCapability, metadata: { requestedCapability: created.requestedCapability } });\n    '}],
    ['return Response.json({ ok:true, request: updated });', { marker:'capability_request_decided', text:'appendGovernanceAuditEvent({ type: "capability_request_decided", actor: "api", entityType: "capability-request", entityId: updated.id, status: updated.status, riskLevel: updated.riskLevel, summary: "Capability Request entschieden: " + updated.requestedCapability, metadata: { requestedCapability: updated.requestedCapability } });\n    '}],
  ]);
}
function patchBlueprintRoute(){
  patchRoute("frontend/app/api/agent-blueprints/route.ts", 'import { appendGovernanceAuditEvent } from "../../../lib/governance-audit-store";', [
    ['return Response.json({ ok:true, proposal: created });', { marker:'agent_blueprint_created', text:'appendGovernanceAuditEvent({ type: "agent_blueprint_created", actor: "api", entityType: "agent-blueprint", entityId: created.id, status: created.status, riskLevel: created.riskLevel, summary: "Agent Blueprint Proposal erstellt: " + created.agentName, metadata: { agentName: created.agentName, requestedCapability: created.requestedCapability } });\n    '}],
    ['return Response.json({ ok:true, proposal: updated });', { marker:'agent_blueprint_decided', text:'appendGovernanceAuditEvent({ type: "agent_blueprint_decided", actor: "api", entityType: "agent-blueprint", entityId: updated.id, status: updated.status, riskLevel: updated.riskLevel, summary: "Agent Blueprint Proposal entschieden: " + updated.agentName, metadata: { agentName: updated.agentName, requestedCapability: updated.requestedCapability } });\n    '}],
  ]);
}
function patchRegistryRoute(){
  patchRoute("frontend/app/api/agent-registry/route.ts", 'import { appendGovernanceAuditEvent } from "../../../lib/governance-audit-store";', [
    ['return Response.json({ ok:true, entry });', { marker:'agent_registry_registered', text:'appendGovernanceAuditEvent({ type: "agent_registry_registered", actor: "api", entityType: "agent-registry", entityId: entry.id, status: entry.status, riskLevel: entry.riskLevel, summary: "Controlled Agent registriert: " + entry.agentName, metadata: { agentName: entry.agentName, requestedCapability: entry.requestedCapability } });\n    '}],
    ['return Response.json({ ok:true, entry:updated });', { marker:'agent_registry_status_changed', text:'appendGovernanceAuditEvent({ type: "agent_registry_status_changed", actor: "api", entityType: "agent-registry", entityId: updated.id, status: updated.status, riskLevel: updated.riskLevel, summary: "Controlled Agent Status geändert: " + updated.agentName + " -> " + updated.status, metadata: { agentName: updated.agentName, requestedCapability: updated.requestedCapability } });\n    '}],
  ]);
}
function patchDocs(){
  ensureFile("phase11-8-agent-registry-analytics-audit-trail.md", `# Phase 11.8 – Agent Registry Analytics & Audit Trail

## Ziel
Capability Requests, Agent Blueprint Proposals und Controlled Agent Registry Änderungen schreiben Governance Audit Events in einen lokalen JSONL Audit Trail.

## Events
- capability_request_created
- capability_request_decided
- agent_blueprint_created
- agent_blueprint_decided
- agent_registry_registered
- agent_registry_status_changed

## UI/API
- API: /api/governance-audit
- UI: /governance-audit
- Navigation: Audit Trail Link in UnifiedNavigation

## Hinweis
Diese Phase aktiviert weiterhin keine Agent Runtime. Es wird nur Auditierbarkeit und Analytics-Grundlage ergänzt.
`);
  ensureFile("docs/phase11-agent-registry-analytics-audit-trail-runbook.md", `# Runbook – Phase 11.8 Agent Registry Analytics & Audit Trail

## Patch
\`\`\`powershell
npm run phase11:8:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase11-8-patch-agent-registry-analytics-audit-trail.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase11:8:verify
npm run build
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /capability-requests öffnen und Request erstellen/entscheiden.
2. /agent-blueprints öffnen und Proposal erstellen/entscheiden.
3. /agent-registry öffnen und Agent registrieren oder Status ändern.
4. /governance-audit öffnen und Events prüfen.
`);
}
function patchPackage(){
  const file="package.json"; const pkg=JSON.parse(read(file)); pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase11:8:patch"]="node scripts/phase11-8-patch-agent-registry-analytics-audit-trail.cjs";
  pkg.scripts["phase11:8:verify"]="node scripts/phase11-8-verify-agent-registry-analytics-audit-trail.cjs";
  pkg.scripts["governance:audit:verify"]="node scripts/phase11-8-verify-agent-registry-analytics-audit-trail.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 11.8 Scripts eingetragen.");
}
patchPackage();
ensureFile("frontend/lib/governance-audit-store.ts", auditStore);
ensureFile("frontend/app/api/governance-audit/route.ts", auditApi);
ensureFile("frontend/app/governance-audit/page.tsx", auditPage);
patchUnifiedNavigation();
patchCapabilityRoute();
patchBlueprintRoute();
patchRegistryRoute();
patchDocs();
console.log("Phase 11.8 Patch abgeschlossen.");
