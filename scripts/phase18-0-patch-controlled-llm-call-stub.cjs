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
  pkg.scripts["phase18:0:patch"]="node scripts/phase18-0-patch-controlled-llm-call-stub.cjs";
  pkg.scripts["phase18:0:verify"]="node scripts/phase18-0-verify-controlled-llm-call-stub.cjs";
  pkg.scripts["llm:stub:verify"]="node scripts/phase18-0-verify-controlled-llm-call-stub.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 18.0 Scripts eingetragen.");
}
const store=String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type LlmStubDecision = "stub_response_created" | "blocked_missing_envelope" | "blocked_execution_not_safe" | "blocked_secret_risk" | "blocked_output_contract_violation";
export interface ControlledLlmStubResponse {
  id: string;
  timestamp: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: LlmStubDecision;
  responseText: string;
  responseSections: Array<{ title: string; body: string }>;
  sourceEnvelopeSummary: {
    recommendedNextAction?: string;
    missingSafetyGates: string[];
    requiredConsentSteps: string[];
    requiredPolicySteps: string[];
  };
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmRoutingPrepOnly: true;
  llmCallPerformed: false;
  stubOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function envelopePath(): string { return path.join(dataDir(), "controlled-llm-routing-envelopes.jsonl"); }
function responsePath(): string { return path.join(dataDir(), "controlled-llm-stub-responses.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendResponse(response: ControlledLlmStubResponse): void { ensureStore(); appendFileSync(responsePath(), JSON.stringify(response)+"\n", "utf8"); }
function hasSecretLikeText(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function safeText(value: unknown, fallback: string): string { return typeof value === "string" && value.trim() ? value.trim().slice(0, 1200) : fallback; }
function buildSections(envelope:any){
  const ctx=envelope?.sanitizedContext || {};
  const next=safeText(ctx.recommendedNextAction, "Zuerst sichere Vorbedingungen prüfen.");
  const missing=Array.isArray(ctx.missingSafetyGates)?ctx.missingSafetyGates:[];
  const consent=Array.isArray(ctx.requiredConsentSteps)?ctx.requiredConsentSteps:[];
  const policy=Array.isArray(ctx.requiredPolicySteps)?ctx.requiredPolicySteps:[];
  return [
    { title:"Empfohlener nächster Schritt", body: next },
    { title:"Fehlende Safety Gates", body: missing.length ? missing.join(", ") : "Keine fehlenden Safety Gates im Envelope erkannt." },
    { title:"Erforderliche Consent-Schritte", body: consent.length ? consent.join(", ") : "Keine zusätzlichen Consent-Schritte im Envelope erkannt." },
    { title:"Erforderliche Policy-/Audit-Schritte", body: policy.length ? policy.join(", ") : "Policy Simulation und Audit prüfen." },
    { title:"Sicherheitsgrenze", body:"Diese Antwort ist ein Stub. Es wurde kein LLM aufgerufen, kein Tool gestartet und kein Agent ausgeführt." },
  ];
}
export function listControlledLlmStubResponses(limit=100): ControlledLlmStubResponse[] { ensureStore(); return readJsonl(responsePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createControlledLlmStubResponse(input:{ envelopeId?: string; metadata?: Record<string, unknown> }): ControlledLlmStubResponse {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const envelope=input.envelopeId ? envelopes.find((entry:any)=>entry.id===input.envelopeId) : envelopes[0];
  let decision:LlmStubDecision="stub_response_created";
  let reason="Dry-run Explainer Response erstellt. Kein produktiver LLM-Aufruf, keine Ausführung.";
  if(!envelope){ decision="blocked_missing_envelope"; reason="Controlled LLM Routing Envelope nicht gefunden."; }
  else if(envelope.executionAllowed!==false || envelope.toolExecutionAllowed!==false || envelope.agentExecutionAllowed!==false || envelope.dryRunOnly!==true || envelope.llmRoutingPrepOnly!==true){ decision="blocked_execution_not_safe"; reason="Envelope verletzt Safety Invariants."; }
  else if(envelope.noSecretsIncluded!==true || hasSecretLikeText(envelope.sanitizedContext) || hasSecretLikeText(envelope.explainerPrompt)){ decision="blocked_secret_risk"; reason="Secret-Risiko im Envelope erkannt."; }
  else if(envelope.allowedOutputContract?.outputType!=="recommendation_explanation_only" || envelope.allowedOutputContract?.mayExecuteTools!==false || envelope.allowedOutputContract?.mayExecuteAgents!==false || envelope.allowedOutputContract?.mayRevealSecrets!==false || envelope.allowedOutputContract?.mayChangeState!==false){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt Explanation-only-Regeln."; }
  const sections=envelope ? buildSections(envelope) : [{ title:"Blockiert", body:reason }];
  const ctx=envelope?.sanitizedContext || {};
  const responseText=sections.map((section)=>`### ${section.title}\n${section.body}`).join("\n\n");
  const response:ControlledLlmStubResponse={
    id:makeId("llm-stub-response"),
    timestamp:new Date().toISOString(),
    envelopeId:envelope?.id || input.envelopeId,
    recommendationId:envelope?.recommendationId,
    actionType:envelope?.actionType,
    decision,
    responseText,
    responseSections:sections,
    sourceEnvelopeSummary:{
      recommendedNextAction: typeof ctx.recommendedNextAction === "string" ? ctx.recommendedNextAction : undefined,
      missingSafetyGates: Array.isArray(ctx.missingSafetyGates) ? ctx.missingSafetyGates : [],
      requiredConsentSteps: Array.isArray(ctx.requiredConsentSteps) ? ctx.requiredConsentSteps : [],
      requiredPolicySteps: Array.isArray(ctx.requiredPolicySteps) ? ctx.requiredPolicySteps : [],
    },
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmRoutingPrepOnly:true,
    llmCallPerformed:false,
    stubOnly:true,
    noSecretsIncluded: decision !== "blocked_secret_risk",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"18.0", noExecution:true, noLlmCall:true, stubOnly:true },
  };
  appendResponse(response);
  return response;
}
export function summarizeControlledLlmStubResponses(responses:ControlledLlmStubResponse[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const response of responses){ byDecision[response.decision]=(byDecision[response.decision]||0)+1; if(response.actionType) byActionType[response.actionType]=(byActionType[response.actionType]||0)+1; } return { total:responses.length, byDecision, byActionType }; }
`;
const api=String.raw`import { createControlledLlmStubResponse, listControlledLlmStubResponses, summarizeControlledLlmStubResponses } from "../../../lib/controlled-llm-stub-response-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const responses=listControlledLlmStubResponses(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeControlledLlmStubResponses(responses), responses });
  } catch(error){
    const message=error instanceof Error ? error.message : "LLM Stub Responses konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const response=createControlledLlmStubResponse({ envelopeId: typeof body.envelopeId==="string" ? body.envelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, response });
  } catch(error){
    const message=error instanceof Error ? error.message : "LLM Stub Response konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Env={id:string;decision:string;actionType?:string;timestamp:string};
type Resp={id:string;timestamp:string;decision:string;actionType?:string;reason:string;responseText:string;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;llmRoutingPrepOnly:boolean;llmCallPerformed:boolean;stubOnly:boolean;noSecretsIncluded:boolean};
export default function LlmStubResponsePage(){
 const [envelopes,setEnvelopes]=useState<Env[]>([]); const [responses,setResponses]=useState<Resp[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [eRes,rRes]=await Promise.all([fetch("/api/llm-routing-envelope?limit=100",{cache:"no-store"}),fetch("/api/llm-stub-response?limit=100",{cache:"no-store"})]); const e=await eRes.json(); const r=await rRes.json(); if(eRes.ok){ const list=Array.isArray(e.envelopes)?e.envelopes:[]; setEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!rRes.ok) throw new Error(r?.error||"LLM Stub Responses konnten nicht geladen werden."); setResponses(Array.isArray(r.responses)?r.responses:[]); setSummary(r.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createResponse(){ const res=await fetch("/api/llm-stub-response",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({envelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Stub Response fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="llm-stub-response" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Controlled LLM Stub Response</h1><p style={{lineHeight:1.6}}>Phase 18.0 erzeugt eine trockene Explainer Response aus einem Controlled LLM Routing Envelope. Kein produktiver LLM-Aufruf, keine Ausführung.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Stub Response erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{envelopes.map((env)=><option key={env.id} value={env.id}>{env.actionType || "llm-routing"} · {env.decision} · {env.id}</option>)}</select><button className="primary-button" type="button" onClick={createResponse} disabled={!selected}>Dry-run Explainer Response erzeugen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Stub Responses</h2>{responses.length===0 ? <p>Noch keine Stub Responses.</p> : responses.map((resp)=><article key={resp.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{resp.actionType || "llm-stub"}</strong> <span className="chip">{resp.decision}</span></div><div className="helper-text"><code>{resp.id}</code> · {resp.timestamp}</div><p><strong>Reason:</strong> {resp.reason}</p><p><strong>Execution:</strong> {String(resp.executionAllowed)} · <strong>Tool:</strong> {String(resp.toolExecutionAllowed)} · <strong>Agent:</strong> {String(resp.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(resp.dryRunOnly)} · <strong>LLM Routing Prep:</strong> {String(resp.llmRoutingPrepOnly)} · <strong>LLM Call:</strong> {String(resp.llmCallPerformed)} · <strong>Stub:</strong> {String(resp.stubOnly)} · <strong>No Secrets:</strong> {String(resp.noSecretsIncluded)}</p><h3>Dry-run Explainer Response</h3><pre style={{whiteSpace:"pre-wrap"}}>{resp.responseText}</pre></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "llm-stub-response"')){ const marker='{ href: "/llm-routing-dashboard", label: "LLM Dashboard", key: "llm-routing-dashboard" },'; const line='  { href: "/llm-stub-response", label: "LLM Stub", key: "llm-stub-response" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: LLM Stub Link ergänzt."); } else console.log("SKIP UnifiedNavigation: LLM Stub bereits vorhanden."); }
function patchDocs(){ ensureFile("phase18-0-controlled-llm-call-stub-dry-run-explainer.md", `# Phase 18.0 – Controlled LLM Call Stub / Dry-run Explainer Response

## Ziel
Aus Controlled LLM Routing Envelopes werden trockene Explainer Responses erzeugt. Es gibt weiterhin keinen produktiven LLM-Aufruf.

## Neue UI/API
- UI: /llm-stub-response
- API: /api/llm-stub-response
- Store: data/controlled-llm-stub-responses.jsonl

## Sicherheitsprinzip
- kein produktiver LLM-Aufruf
- llmCallPerformed=false
- stubOnly=true
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- keine Secrets
- output explanation-only
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 18.1 kann Stub Response Policy Simulation & Audit ergänzen.
`);
ensureFile("docs/phase18-controlled-llm-call-stub-runbook.md", `# Runbook – Phase 18.0 Controlled LLM Call Stub

## Patch
\`\`\`powershell
npm run phase18:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase18-0-patch-controlled-llm-call-stub.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase18:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test.
`); }
patchPackage();
ensureFile("frontend/lib/controlled-llm-stub-response-store.ts", store);
ensureFile("frontend/app/api/llm-stub-response/route.ts", api);
ensureFile("frontend/app/llm-stub-response/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 18.0 Patch abgeschlossen.");
