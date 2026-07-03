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
  pkg.scripts["phase13:3:patch"]="node scripts/phase13-3-patch-tool-adapter-policy-simulation-audit.cjs";
  pkg.scripts["phase13:3:verify"]="node scripts/phase13-3-verify-tool-adapter-policy-simulation-audit.cjs";
  pkg.scripts["tools:adapter:policy:verify"]="node scripts/phase13-3-verify-tool-adapter-policy-simulation-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 13.3 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ToolAdapterPolicyDecision =
  | "simulation_allowed_dry_run"
  | "blocked_missing_resume"
  | "blocked_resume_not_allowed"
  | "blocked_tool_execution"
  | "blocked_missing_consent"
  | "blocked_policy_violation";

export interface ToolAdapterPolicySimulationResult {
  id: string;
  timestamp: string;
  resumePlanId?: string;
  toolExecutionPlanId?: string;
  adapterName?: string;
  requestedAction?: string;
  decision: ToolAdapterPolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function resumePath(): string { return path.join(dataDir(), "approved-tool-adapter-resume-plans.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "tool-adapter-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function appendSimulation(result: ToolAdapterPolicySimulationResult): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(result) + "\n", "utf8"); }
export function listToolAdapterPolicySimulations(limit = 100): ToolAdapterPolicySimulationResult[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500))); }
export function simulateToolAdapterPolicy(input: { resumePlanId?: string; metadata?: Record<string, unknown> }): ToolAdapterPolicySimulationResult {
  ensureStore();
  const resumes = readJsonl(resumePath());
  const resume = resumes.find((entry:any) => input.resumePlanId ? entry.id === input.resumePlanId : true);
  const checks: Array<{ name: string; passed: boolean; reason: string }> = [];
  checks.push({ name: "resume_exists", passed: Boolean(resume), reason: resume ? "Tool Adapter Resume Plan gefunden." : "Tool Adapter Resume Plan fehlt." });
  checks.push({ name: "resume_allowed", passed: resume?.resumeAllowed === true, reason: resume?.resumeAllowed === true ? "Dry-run Resume ist erlaubt." : "Resume ist nicht erlaubt." });
  checks.push({ name: "tool_execution_blocked", passed: resume?.toolExecutionAllowed === false, reason: resume?.toolExecutionAllowed === false ? "Tool-Ausführung bleibt blockiert." : "Tool-Ausführung wäre nicht blockiert." });
  checks.push({ name: "dry_run_only", passed: resume?.dryRunOnly === true, reason: resume?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name: "consent_approved", passed: resume?.consentStatus === "approved", reason: resume?.consentStatus === "approved" ? "Consent ist approved." : "Consent ist nicht approved." });
  let decision: ToolAdapterPolicyDecision = "simulation_allowed_dry_run";
  let reason = "Tool Adapter Policy Simulation erlaubt ausschließlich Dry-run. Keine echte Tool-Ausführung.";
  if (!resume) { decision = "blocked_missing_resume"; reason = "Tool Adapter Resume Plan nicht gefunden."; }
  else if (resume.resumeAllowed !== true) { decision = "blocked_resume_not_allowed"; reason = "Resume Plan erlaubt keinen Resume."; }
  else if (resume.toolExecutionAllowed !== false || resume.dryRunOnly !== true) { decision = "blocked_tool_execution"; reason = "Dry-run Sicherheitsregeln verletzt."; }
  else if (resume.consentStatus !== "approved") { decision = "blocked_missing_consent"; reason = "Consent ist nicht approved."; }
  else if (checks.some((check) => !check.passed)) { decision = "blocked_policy_violation"; reason = "Mindestens ein Policy Check ist fehlgeschlagen."; }
  const result: ToolAdapterPolicySimulationResult = {
    id: makeId("tool-policy-sim"),
    timestamp: new Date().toISOString(),
    resumePlanId: resume?.id || input.resumePlanId,
    toolExecutionPlanId: resume?.toolExecutionPlanId,
    adapterName: resume?.adapterName,
    requestedAction: resume?.requestedAction,
    decision,
    policyChecks: checks,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    simulated: true,
    reason,
    metadata: { ...(input.metadata || {}), source: "tool-adapter-policy-simulation", noToolExecution: true },
  };
  appendSimulation(result);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: result.resumePlanId,
    status: result.decision,
    riskLevel: "medium",
    summary: "Tool Adapter Policy Simulation: " + result.decision,
    metadata: { source: "phase13.3-tool-adapter-policy-simulation", simulationId: result.id, toolExecutionAllowed: false, dryRunOnly: true },
  });
  return result;
}
export function summarizeToolAdapterPolicySimulations(results: ToolAdapterPolicySimulationResult[]) { const byDecision: Record<string, number> = {}; for (const result of results) byDecision[result.decision] = (byDecision[result.decision] || 0) + 1; return { total: results.length, byDecision }; }
`;
const api = String.raw`import { listToolAdapterPolicySimulations, simulateToolAdapterPolicy, summarizeToolAdapterPolicySimulations } from "../../../lib/tool-adapter-policy-simulation-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const simulations = listToolAdapterPolicySimulations(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeToolAdapterPolicySimulations(simulations), simulations });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const simulation = simulateToolAdapterPolicy({ resumePlanId: typeof body.resumePlanId === "string" ? body.resumePlanId : undefined, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Resume = { id:string; adapterName?:string; decision:string; consentStatus?:string };
type Simulation = { id:string; timestamp:string; decision:string; resumePlanId?:string; adapterName?:string; requestedAction?:string; reason:string; toolExecutionAllowed:boolean; dryRunOnly:boolean; policyChecks?: Array<{ name:string; passed:boolean; reason:string }> };
export default function ToolAdapterPolicyPage(){
  const [resumes,setResumes]=useState<Resume[]>([]);
  const [simulations,setSimulations]=useState<Simulation[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [selected,setSelected]=useState("");
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const resumeRes=await fetch("/api/tool-adapter-resume?limit=100", { cache:"no-store" });
      const resumePayload=await resumeRes.json();
      if(resumeRes.ok){ const list = Array.isArray(resumePayload.plans) ? resumePayload.plans : []; setResumes(list); if(!selected && list[0]?.id) setSelected(list[0].id); }
      const simRes=await fetch("/api/tool-adapter-policy?limit=100", { cache:"no-store" });
      const simPayload=await simRes.json();
      if(!simRes.ok) throw new Error(simPayload?.error || "Tool Adapter Policy Simulations konnten nicht geladen werden.");
      setSimulations(Array.isArray(simPayload.simulations) ? simPayload.simulations : []);
      setSummary(simPayload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  async function simulate(){
    const res=await fetch("/api/tool-adapter-policy", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ resumePlanId: selected }) });
    if(!res.ok){ const p=await res.json(); setError(p?.error || "Simulation fehlgeschlagen"); }
    await load();
  }
  return <main className="page-wrap"><UnifiedNavigation active="tool-adapter-policy" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)", borderColor:"#f9a8d4" }}><h1 className="section-title">Tool Adapter Policy Simulation</h1><p style={{ lineHeight:1.6 }}>Phase 13.3 simuliert Tool Adapter Policy Checks und schreibt Audit Events. Keine echte Tool-Ausführung.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Simulation erstellen</h2><select className="text-input" value={selected} onChange={(e)=>setSelected(e.target.value)}>{resumes.map((resume)=><option key={resume.id} value={resume.id}>{resume.adapterName || "unknown-adapter"} · {resume.decision} · {resume.consentStatus || "no-consent"} · {resume.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Tool Adapter Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{simulations.length===0 ? <p>Noch keine Tool Adapter Policy Simulations.</p> : simulations.map((sim)=><article key={sim.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{sim.adapterName || "unknown-adapter"}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div>{sim.requestedAction ? <p><strong>Action:</strong> {sim.requestedAction}</p> : null}<p><strong>Reason:</strong> {sim.reason}</p><p><strong>Tool execution allowed:</strong> {String(sim.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(sim.dryRunOnly)}</p>{sim.policyChecks?.length ? <ul>{sim.policyChecks.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul> : null}</article>)}</section></div></main>;
}
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "tool-adapter-policy"')){
    const marker='  { href: "/tool-adapter-resume", label: "Tool Resume", key: "tool-adapter-resume" },';
    const line='  { href: "/tool-adapter-policy", label: "Tool Policy", key: "tool-adapter-policy" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line);
    else content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', line+'\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Tool Adapter Policy Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Tool Adapter Policy bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase13-3-tool-adapter-policy-simulation-audit.md", `# Phase 13.3 – Tool Adapter Policy Simulation & Audit

## Ziel
Approved Tool Adapter Resume Plans werden gegen eine Policy Simulation geprüft und als Governance Audit Event protokolliert.

## Sicherheitsprinzip
Auch erfolgreiche Policy Simulation erlaubt nur Dry-run. Echte Tool-Ausführung bleibt deaktiviert.

## Checks
- resume_exists
- resume_allowed
- tool_execution_blocked
- dry_run_only
- consent_approved

## Neue UI/API
- UI: /tool-adapter-policy
- API: /api/tool-adapter-policy
- Store: data/tool-adapter-policy-simulations.jsonl
- Audit: data/governance-audit.jsonl

## Nächster Schritt
Phase 13.4 kann Tool Adapter Dashboard & Phase-13 Smoke ergänzen.
`);
  ensureFile("docs/phase13-tool-adapter-policy-simulation-audit-runbook.md", `# Runbook – Phase 13.3 Tool Adapter Policy Simulation & Audit

## Patch
\`\`\`powershell
npm run phase13:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase13-3-patch-tool-adapter-policy-simulation-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase13:3:verify
npm run build
npm run stack:up:detached
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /tool-adapter-resume öffnen und Resume Plan erzeugen.
2. /tool-adapter-policy öffnen.
3. Tool Adapter Policy simulieren.
4. /governance-audit öffnen und Tool Adapter Policy Simulation Event prüfen.
5. Sicherstellen: toolExecutionAllowed=false und dryRunOnly=true.
`);
}
function patchPackage(){
  const file="package.json"; const pkg=JSON.parse(read(file)); pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase13:3:patch"]="node scripts/phase13-3-patch-tool-adapter-policy-simulation-audit.cjs";
  pkg.scripts["phase13:3:verify"]="node scripts/phase13-3-verify-tool-adapter-policy-simulation-audit.cjs";
  pkg.scripts["tools:adapter:policy:verify"]="node scripts/phase13-3-verify-tool-adapter-policy-simulation-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 13.3 Scripts eingetragen.");
}
patchPackage();
ensureFile("frontend/lib/tool-adapter-policy-simulation-store.ts", store);
ensureFile("frontend/app/api/tool-adapter-policy/route.ts", api);
ensureFile("frontend/app/tool-adapter-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 13.3 Patch abgeschlossen.");
