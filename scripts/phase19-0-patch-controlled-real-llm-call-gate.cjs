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
  pkg.scripts["phase19:0:patch"]="node scripts/phase19-0-patch-controlled-real-llm-call-gate.cjs";
  pkg.scripts["phase19:0:verify"]="node scripts/phase19-0-verify-controlled-real-llm-call-gate.cjs";
  pkg.scripts["llm:real-gate:verify"]="node scripts/phase19-0-verify-controlled-real-llm-call-gate.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 19.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type RealLlmCallGateDecision =
  | "gate_prepared_dry_run"
  | "blocked_missing_stub_response"
  | "blocked_execution_not_safe"
  | "blocked_llm_call_not_allowed"
  | "blocked_secret_risk"
  | "blocked_output_contract_missing";

export interface ControlledRealLlmCallGate {
  id: string;
  timestamp: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: RealLlmCallGateDecision;
  gateChecks: Array<{ name: string; passed: boolean; reason: string }>;
  invocationPlan: {
    mode: "dry_run_gate_only";
    providerAllowed: false;
    realLlmCallAllowed: false;
    policyGateRequired: true;
    secretScanRequired: true;
    outputContractRequired: true;
    auditRequiredBeforeCall: true;
    auditRequiredAfterDecision: true;
  };
  sanitizedPromptPreview: string;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmCallPerformed: false;
  realLlmCallAllowed: false;
  policyGateRequired: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function responsesPath(): string { return path.join(dataDir(), "controlled-llm-stub-responses.jsonl"); }
function gatesPath(): string { return path.join(dataDir(), "controlled-real-llm-call-gates.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendGate(gate: ControlledRealLlmCallGate): void { ensureStore(); appendFileSync(gatesPath(), JSON.stringify(gate)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function safePreview(response:any): string { return String(response?.responseText || "").replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=REDACTED").slice(0, 1600); }
export function listControlledRealLlmCallGates(limit=100): ControlledRealLlmCallGate[] { ensureStore(); return readJsonl(gatesPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createControlledRealLlmCallGate(input:{ responseId?: string; metadata?: Record<string, unknown> }): ControlledRealLlmCallGate {
  ensureStore();
  const responses=readJsonl(responsesPath());
  const response=input.responseId ? responses.find((entry:any)=>entry.id===input.responseId) : responses[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"stub_response_exists", passed:Boolean(response), reason: response ? "Stub Response gefunden." : "Stub Response fehlt." });
  checks.push({ name:"stub_only", passed: response?.stubOnly === true, reason: response?.stubOnly === true ? "Stub-only ist aktiv." : "Stub-only fehlt." });
  checks.push({ name:"llm_call_not_performed", passed: response?.llmCallPerformed === false, reason: response?.llmCallPerformed === false ? "Bisher kein LLM-Aufruf." : "LLM-Aufruf wurde bereits durchgeführt." });
  checks.push({ name:"execution_blocked", passed: response?.executionAllowed === false && response?.toolExecutionAllowed === false && response?.agentExecutionAllowed === false, reason: "Tool-, Agent- und Execution-Freigaben müssen blockiert bleiben." });
  checks.push({ name:"dry_run_only", passed: response?.dryRunOnly === true, reason: response?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"secret_scan", passed: response?.noSecretsIncluded === true && !containsSecretPattern(response?.responseText), reason: response?.noSecretsIncluded === true && !containsSecretPattern(response?.responseText) ? "Kein Secret-Muster im Stub Response Text." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract_required", passed:true, reason:"Output Contract muss vor echter Invocation erneut geprüft werden." });
  checks.push({ name:"policy_gate_required", passed:true, reason:"Policy Gate ist vor produktivem LLM-Aufruf erforderlich." });
  let decision: RealLlmCallGateDecision="gate_prepared_dry_run";
  let reason="Controlled Real LLM Call Gate vorbereitet. Phase 19.0 führt keinen produktiven LLM-Aufruf aus.";
  if(!response){ decision="blocked_missing_stub_response"; reason="Stub Response nicht gefunden."; }
  else if(response.executionAllowed!==false || response.toolExecutionAllowed!==false || response.agentExecutionAllowed!==false || response.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Stub Response verletzt Execution Safety Invariants."; }
  else if(response.llmCallPerformed!==false || response.stubOnly!==true){ decision="blocked_llm_call_not_allowed"; reason="Stub Response ist nicht eindeutig no-LLM-call/stub-only."; }
  else if(response.noSecretsIncluded!==true || containsSecretPattern(response.responseText)){ decision="blocked_secret_risk"; reason="Secret-Risiko vor Real LLM Gate erkannt."; }
  const gate: ControlledRealLlmCallGate={
    id:makeId("real-llm-gate"),
    timestamp:new Date().toISOString(),
    responseId:response?.id || input.responseId,
    envelopeId:response?.envelopeId,
    recommendationId:response?.recommendationId,
    actionType:response?.actionType,
    decision,
    gateChecks:checks,
    invocationPlan:{ mode:"dry_run_gate_only", providerAllowed:false, realLlmCallAllowed:false, policyGateRequired:true, secretScanRequired:true, outputContractRequired:true, auditRequiredBeforeCall:true, auditRequiredAfterDecision:true },
    sanitizedPromptPreview: response ? safePreview(response) : "",
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmCallPerformed:false,
    realLlmCallAllowed:false,
    policyGateRequired:true,
    noSecretsIncluded: decision !== "blocked_secret_risk",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"19.0", noExecution:true, noRealLlmCall:true, policyGateRequired:true },
  };
  appendGate(gate);
  return gate;
}
export function summarizeControlledRealLlmCallGates(gates:ControlledRealLlmCallGate[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const gate of gates){ byDecision[gate.decision]=(byDecision[gate.decision]||0)+1; if(gate.actionType) byActionType[gate.actionType]=(byActionType[gate.actionType]||0)+1; } return { total:gates.length, byDecision, byActionType }; }
`;
const api = String.raw`import { createControlledRealLlmCallGate, listControlledRealLlmCallGates, summarizeControlledRealLlmCallGates } from "../../../lib/controlled-real-llm-call-gate-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const gates=listControlledRealLlmCallGates(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeControlledRealLlmCallGates(gates), gates });
  } catch(error){
    const message=error instanceof Error ? error.message : "Real LLM Call Gates konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const gate=createControlledRealLlmCallGate({ responseId: typeof body.responseId==="string" ? body.responseId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, gate });
  } catch(error){
    const message=error instanceof Error ? error.message : "Real LLM Call Gate konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Resp={id:string;decision:string;actionType?:string;timestamp:string};
type Gate={id:string;timestamp:string;decision:string;actionType?:string;reason:string;sanitizedPromptPreview:string;realLlmCallAllowed:boolean;policyGateRequired:boolean;llmCallPerformed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;gateChecks:Array<{name:string;passed:boolean;reason:string}>};
export default function RealLlmCallGatePage(){
 const [responses,setResponses]=useState<Resp[]>([]); const [gates,setGates]=useState<Gate[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [rRes,gRes]=await Promise.all([fetch("/api/llm-stub-response?limit=100",{cache:"no-store"}),fetch("/api/real-llm-call-gate?limit=100",{cache:"no-store"})]); const r=await rRes.json(); const g=await gRes.json(); if(rRes.ok){ const list=Array.isArray(r.responses)?r.responses:[]; setResponses(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!gRes.ok) throw new Error(g?.error||"Real LLM Call Gates konnten nicht geladen werden."); setGates(Array.isArray(g.gates)?g.gates:[]); setSummary(g.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createGate(){ const res=await fetch("/api/real-llm-call-gate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({responseId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Gate fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="real-llm-call-gate" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)",borderColor:"#fdba74"}}><h1 className="section-title">Controlled Real LLM Call Gate</h1><p style={{lineHeight:1.6}}>Phase 19.0 bereitet ein Policy-Gate für spätere echte LLM-Aufrufe vor. Es wird kein produktiver LLM-Aufruf ausgeführt.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Gate vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{responses.map((resp)=><option key={resp.id} value={resp.id}>{resp.actionType || "llm-stub"} · {resp.decision} · {resp.id}</option>)}</select><button className="primary-button" type="button" onClick={createGate} disabled={!selected}>Real LLM Call Gate vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Prepared Gates</h2>{gates.length===0 ? <p>Noch keine Real LLM Call Gates.</p> : gates.map((gate)=><article key={gate.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{gate.actionType || "real-llm-gate"}</strong> <span className="chip">{gate.decision}</span></div><div className="helper-text"><code>{gate.id}</code> · {gate.timestamp}</div><p><strong>Reason:</strong> {gate.reason}</p><p><strong>Real LLM allowed:</strong> {String(gate.realLlmCallAllowed)} · <strong>Policy Gate:</strong> {String(gate.policyGateRequired)} · <strong>LLM Call:</strong> {String(gate.llmCallPerformed)} · <strong>Execution:</strong> {String(gate.executionAllowed)} · <strong>Tool:</strong> {String(gate.toolExecutionAllowed)} · <strong>Agent:</strong> {String(gate.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(gate.dryRunOnly)}</p><h3>Gate Checks</h3><ul>{gate.gateChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul><h3>Sanitized Prompt Preview</h3><pre style={{whiteSpace:"pre-wrap"}}>{gate.sanitizedPromptPreview}</pre></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "real-llm-call-gate"')){ const marker='{ href: "/llm-stub-dashboard", label: "Stub Dashboard", key: "llm-stub-dashboard" },'; const line='  { href: "/real-llm-call-gate", label: "Real LLM Gate", key: "real-llm-call-gate" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Real LLM Gate Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Real LLM Gate bereits vorhanden."); }
function patchDocs(){ ensureFile("phase19-0-controlled-real-llm-call-gate.md", `# Phase 19.0 – Controlled Real LLM Call Gate / Policy-Gated Invocation Prep

## Ziel
Ein kontrolliertes Gate für einen späteren echten LLM-Aufruf wird vorbereitet. Phase 19.0 führt keinen produktiven LLM-Aufruf aus.

## Neue UI/API
- UI: /real-llm-call-gate
- API: /api/real-llm-call-gate
- Store: data/controlled-real-llm-call-gates.jsonl

## Sicherheitsprinzip
- kein produktiver LLM-Aufruf
- realLlmCallAllowed=false
- llmCallPerformed=false
- policyGateRequired=true
- Secret Scan vor Call erforderlich
- Output Contract vor Call erforderlich
- Audit vor/nach Call-Entscheidung erforderlich
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 19.1 kann Real LLM Gate Policy Simulation & Audit ergänzen.
`);
ensureFile("docs/phase19-controlled-real-llm-call-gate-runbook.md", `# Runbook – Phase 19.0 Controlled Real LLM Call Gate

## Patch
\`\`\`powershell
npm run phase19:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase19-0-patch-controlled-real-llm-call-gate.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase19:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/controlled-real-llm-call-gate-store.ts", store);
ensureFile("frontend/app/api/real-llm-call-gate/route.ts", api);
ensureFile("frontend/app/real-llm-call-gate/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 19.0 Patch abgeschlossen.");
