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
  pkg.scripts["phase22:0:patch"]="node scripts/phase22-0-patch-provider-agnostic-llm-adapter-stub.cjs";
  pkg.scripts["phase22:0:verify"]="node scripts/phase22-0-verify-provider-agnostic-llm-adapter-stub.cjs";
  pkg.scripts["llm:provider-stub:verify"]="node scripts/phase22-0-verify-provider-agnostic-llm-adapter-stub.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 22.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderStubDecision =
  | "provider_stub_prepared_no_network"
  | "blocked_missing_invocation_envelope"
  | "blocked_real_llm_allowed"
  | "blocked_execution_not_safe"
  | "blocked_secret_risk"
  | "blocked_output_contract_violation"
  | "blocked_envelope_not_prep_only";

export interface ProviderAgnosticLlmInvocationAdapterStub {
  id: string;
  timestamp: string;
  invocationEnvelopeId?: string;
  consentRequestId?: string;
  gateId?: string;
  responseId?: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: ProviderStubDecision;
  adapterMode: "provider_agnostic_no_network_stub";
  adapterChecks: Array<{ name: string; passed: boolean; reason: string }>;
  providerRequestPreview: {
    provider: "none";
    networkCallAllowed: false;
    modelSelected: "none";
    promptPreview: string;
    outputContractType: "recommendation_explanation_only";
  };
  adapterResponsePreview: {
    responseType: "stub_only";
    text: string;
  };
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  consentRequired: true;
  humanApprovalRequired: true;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function envelopePath(): string { return path.join(dataDir(), "approved-real-llm-invocation-envelopes.jsonl"); }
function stubPath(): string { return path.join(dataDir(), "provider-agnostic-llm-invocation-adapter-stubs.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendStub(stub: ProviderAgnosticLlmInvocationAdapterStub): void { ensureStore(); appendFileSync(stubPath(), JSON.stringify(stub)+"\n", "utf8"); }
function containsSecretPattern(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function sanitize(value: unknown): string { return String(value || "").replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=REDACTED").slice(0, 2200); }
export function listProviderAgnosticLlmInvocationAdapterStubs(limit=100): ProviderAgnosticLlmInvocationAdapterStub[] { ensureStore(); return readJsonl(stubPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createProviderAgnosticLlmInvocationAdapterStub(input:{ invocationEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderAgnosticLlmInvocationAdapterStub {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const env=input.invocationEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.invocationEnvelopeId) : envelopes[0];
  const checks: Array<{name:string; passed:boolean; reason:string}> = [];
  checks.push({ name:"invocation_envelope_exists", passed:Boolean(env), reason: env ? "Invocation Envelope gefunden." : "Invocation Envelope fehlt." });
  checks.push({ name:"prep_only_mode", passed: env?.invocationEnvelope?.mode === "approved_invocation_envelope_prep_only", reason:"Invocation Envelope muss Prep-only sein." });
  checks.push({ name:"no_network_call", passed:true, reason:"Provider Adapter Stub erlaubt keinen Netzwerk-/Provider-Aufruf." });
  checks.push({ name:"provider_none", passed:true, reason:"Provider ist bewusst 'none'." });
  checks.push({ name:"real_llm_blocked", passed: env?.realLlmCallAllowed === false && env?.llmCallPerformed === false && env?.invocationEnvelope?.realLlmCallAllowed === false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed: env?.executionAllowed === false && env?.toolExecutionAllowed === false && env?.agentExecutionAllowed === false && env?.invocationEnvelope?.toolExecutionAllowed === false && env?.invocationEnvelope?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed: env?.dryRunOnly === true, reason: env?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"secret_scan", passed: env?.noSecretsIncluded === true && !containsSecretPattern(env?.promptPreview), reason: env?.noSecretsIncluded === true && !containsSecretPattern(env?.promptPreview) ? "Kein Secret-Risiko im Prompt Preview." : "Secret-Risiko erkannt." });
  checks.push({ name:"output_contract", passed: env?.outputContract?.outputType === "recommendation_explanation_only" && env?.outputContract?.mayExecuteTools === false && env?.outputContract?.mayExecuteAgents === false && env?.outputContract?.mayRevealSecrets === false && env?.outputContract?.mayChangeState === false, reason:"Output Contract muss explanation-only und nicht-ausführend sein." });
  let decision: ProviderStubDecision="provider_stub_prepared_no_network";
  let reason="Provider-agnostischer LLM Invocation Adapter Stub vorbereitet. Kein Netzwerk-/Provider-Aufruf.";
  if(!env){ decision="blocked_missing_invocation_envelope"; reason="Invocation Envelope nicht gefunden."; }
  else if(env.invocationEnvelope?.mode !== "approved_invocation_envelope_prep_only"){ decision="blocked_envelope_not_prep_only"; reason="Invocation Envelope ist nicht Prep-only."; }
  else if(env.realLlmCallAllowed !== false || env.llmCallPerformed !== false || env.invocationEnvelope?.realLlmCallAllowed !== false){ decision="blocked_real_llm_allowed"; reason="Real LLM Call ist nicht eindeutig blockiert."; }
  else if(env.executionAllowed !== false || env.toolExecutionAllowed !== false || env.agentExecutionAllowed !== false || env.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Envelope verletzt Execution Safety Invariants."; }
  else if(env.noSecretsIncluded !== true || containsSecretPattern(env.promptPreview)){ decision="blocked_secret_risk"; reason="Secret-Risiko vor Provider Stub erkannt."; }
  else if(env.outputContract?.outputType !== "recommendation_explanation_only" || env.outputContract?.mayExecuteTools !== false || env.outputContract?.mayExecuteAgents !== false || env.outputContract?.mayRevealSecrets !== false || env.outputContract?.mayChangeState !== false){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausführende Regeln."; }
  const promptPreview=env ? sanitize(env.promptPreview) : "";
  const stub: ProviderAgnosticLlmInvocationAdapterStub={
    id:makeId("provider-llm-stub"),
    timestamp:new Date().toISOString(),
    invocationEnvelopeId:env?.id || input.invocationEnvelopeId,
    consentRequestId:env?.consentRequestId,
    gateId:env?.gateId,
    responseId:env?.responseId,
    envelopeId:env?.envelopeId,
    recommendationId:env?.recommendationId,
    actionType:env?.actionType,
    decision,
    adapterMode:"provider_agnostic_no_network_stub",
    adapterChecks:checks,
    providerRequestPreview:{ provider:"none", networkCallAllowed:false, modelSelected:"none", promptPreview, outputContractType:"recommendation_explanation_only" },
    adapterResponsePreview:{ responseType:"stub_only", text:"No provider call performed. Adapter returned a dry-run stub response only." },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    consentRequired:true,
    humanApprovalRequired:true,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_risk",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"22.0", noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, adapterStubOnly:true },
  };
  appendStub(stub);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:stub.id,
    status:stub.decision,
    riskLevel:"high",
    summary:"Provider-agnostic LLM Invocation Adapter Stub: "+stub.decision,
    metadata:{ source:"phase22.0-provider-agnostic-llm-adapter-stub", stubId:stub.id, invocationEnvelopeId:stub.invocationEnvelopeId, networkCallPerformed:false, llmCallPerformed:false, realLlmCallAllowed:false },
  });
  return stub;
}
export function summarizeProviderAgnosticLlmInvocationAdapterStubs(stubs:ProviderAgnosticLlmInvocationAdapterStub[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const stub of stubs){ byDecision[stub.decision]=(byDecision[stub.decision]||0)+1; if(stub.actionType) byActionType[stub.actionType]=(byActionType[stub.actionType]||0)+1; } return { total:stubs.length, byDecision, byActionType }; }
`;
const api = String.raw`import { createProviderAgnosticLlmInvocationAdapterStub, listProviderAgnosticLlmInvocationAdapterStubs, summarizeProviderAgnosticLlmInvocationAdapterStubs } from "../../../lib/provider-agnostic-llm-invocation-adapter-stub-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const adapterStubs=listProviderAgnosticLlmInvocationAdapterStubs(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeProviderAgnosticLlmInvocationAdapterStubs(adapterStubs), adapterStubs });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Adapter Stubs konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const adapterStub=createProviderAgnosticLlmInvocationAdapterStub({ invocationEnvelopeId: typeof body.invocationEnvelopeId==="string" ? body.invocationEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, adapterStub });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Adapter Stub konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Env={id:string;decision:string;actionType?:string;timestamp:string};
type Stub={id:string;timestamp:string;decision:string;actionType?:string;reason:string;adapterMode:string;realLlmCallAllowed:boolean;llmCallPerformed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;adapterChecks:Array<{name:string;passed:boolean;reason:string}>;providerRequestPreview:any;adapterResponsePreview:any};
export default function ProviderAgnosticLlmAdapterStubPage(){
 const [envelopes,setEnvelopes]=useState<Env[]>([]); const [stubs,setStubs]=useState<Stub[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [eRes,sRes]=await Promise.all([fetch("/api/approved-real-llm-invocation-envelope?limit=100",{cache:"no-store"}),fetch("/api/provider-llm-adapter-stub?limit=100",{cache:"no-store"})]); const e=await eRes.json(); const s=await sRes.json(); if(eRes.ok){ const list=Array.isArray(e.invocationEnvelopes)?e.invocationEnvelopes:[]; setEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Adapter Stubs konnten nicht geladen werden."); setStubs(Array.isArray(s.adapterStubs)?s.adapterStubs:[]); setSummary(s.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createStub(){ const res=await fetch("/api/provider-llm-adapter-stub",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({invocationEnvelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Adapter Stub fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-llm-adapter-stub" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Provider-Agnostic LLM Adapter Stub</h1><p style={{lineHeight:1.6}}>Phase 22.0 bereitet einen provider-agnostischen LLM Invocation Adapter Stub vor. Kein Netzwerk-/Provider-Aufruf, kein produktiver LLM-Aufruf und keine Tool-/Agent-Ausführung.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Adapter Stub vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{envelopes.map((env)=><option key={env.id} value={env.id}>{env.actionType || "invocation-envelope"} · {env.decision} · {env.id}</option>)}</select><button className="primary-button" type="button" onClick={createStub} disabled={!selected}>Provider Adapter Stub vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Adapter Stubs</h2>{stubs.length===0 ? <p>Noch keine Adapter Stubs.</p> : stubs.map((stub)=><article key={stub.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{stub.actionType || "provider-adapter-stub"}</strong> <span className="chip">{stub.decision}</span></div><div className="helper-text"><code>{stub.id}</code> · {stub.timestamp}</div><p><strong>Reason:</strong> {stub.reason}</p><p><strong>Mode:</strong> {stub.adapterMode}</p><p><strong>Network call:</strong> {String(stub.networkCallPerformed)} · <strong>Provider execution:</strong> {String(stub.providerExecutionAllowed)} · <strong>Real LLM allowed:</strong> {String(stub.realLlmCallAllowed)} · <strong>LLM Call:</strong> {String(stub.llmCallPerformed)} · <strong>Execution:</strong> {String(stub.executionAllowed)} · <strong>Tool:</strong> {String(stub.toolExecutionAllowed)} · <strong>Agent:</strong> {String(stub.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(stub.dryRunOnly)}</p><h3>Adapter Checks</h3><ul>{stub.adapterChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul><h3>Provider Request Preview</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(stub.providerRequestPreview ?? {}, null, 2)}</pre><h3>Adapter Response Preview</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(stub.adapterResponsePreview ?? {}, null, 2)}</pre></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-llm-adapter-stub"')){ const markers=[
  '{ href: "/approved-real-llm-invocation-envelope-dashboard", label: "Envelope Dashboard", key: "approved-real-llm-invocation-envelope-dashboard" },',
  '{ href: "/approved-real-llm-invocation-envelope-policy", label: "Envelope Policy", key: "approved-real-llm-invocation-envelope-policy" },',
  '{ href: "/approved-real-llm-invocation-envelope", label: "Invocation Envelope", key: "approved-real-llm-invocation-envelope" },'
 ]; const line='  { href: "/provider-llm-adapter-stub", label: "Provider Stub", key: "provider-llm-adapter-stub" },'; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } } }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Stub Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Stub bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase22-0-provider-agnostic-llm-invocation-adapter-stub.md", `# Phase 22.0 – Provider-Agnostic LLM Invocation Adapter Stub / No Network Call

## Ziel
Ein provider-agnostischer Adapter Stub für spätere LLM Invocation wird vorbereitet. Es findet kein externer Netzwerk-/Provider-Aufruf statt.

## Neue UI/API
- UI: /provider-llm-adapter-stub
- API: /api/provider-llm-adapter-stub
- Store: data/provider-agnostic-llm-invocation-adapter-stubs.jsonl

## Sicherheitsprinzip
- provider_agnostic_no_network_stub
- provider=none
- networkCallAllowed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- Secret Scan erneut geprüft
- Output Contract erneut geprüft
- Audit vor/nach Adapter-Entscheidung
- keine Tool-Ausführung
- keine Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 22.1 kann Provider Adapter Policy Simulation & Audit ergänzen.
`);
ensureFile("docs/phase22-provider-agnostic-llm-adapter-stub-runbook.md", `# Runbook – Phase 22.0 Provider-Agnostic LLM Invocation Adapter Stub

## Patch
\`\`\`powershell
npm run phase22:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase22-0-patch-provider-agnostic-llm-adapter-stub.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase22:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/provider-agnostic-llm-invocation-adapter-stub-store.ts", store);
ensureFile("frontend/app/api/provider-llm-adapter-stub/route.ts", api);
ensureFile("frontend/app/provider-llm-adapter-stub/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 22.0 Patch abgeschlossen.");
