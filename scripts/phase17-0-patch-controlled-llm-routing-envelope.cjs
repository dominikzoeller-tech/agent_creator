const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensureFile(file, content){ if(!exists(file)){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase17:0:patch"]="node scripts/phase17-0-patch-controlled-llm-routing-envelope.cjs";
  pkg.scripts["phase17:0:verify"]="node scripts/phase17-0-verify-controlled-llm-routing-envelope.cjs";
  pkg.scripts["llm:routing:verify"]="node scripts/phase17-0-verify-controlled-llm-routing-envelope.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 17.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type LlmRoutingEnvelopeDecision = "envelope_created" | "blocked_missing_recommendation" | "blocked_execution_not_safe" | "blocked_context_not_sanitized";
export interface ControlledLlmRoutingEnvelope {
  id: string;
  timestamp: string;
  recommendationId?: string;
  orchestrationPlanId?: string;
  actionType?: string;
  decision: LlmRoutingEnvelopeDecision;
  sanitizedContext: {
    title?: string;
    recommendedNextAction?: string;
    missingSafetyGates: string[];
    requiredConsentSteps: string[];
    requiredPolicySteps: string[];
  };
  explainerPrompt: string;
  allowedOutputContract: {
    outputType: "recommendation_explanation_only";
    mayExecuteTools: false;
    mayExecuteAgents: false;
    mayRevealSecrets: false;
    mayChangeState: false;
  };
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmRoutingPrepOnly: true;
  noSecretsIncluded: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function recommendationsPath(): string { return path.join(dataDir(), "master-agent-planner-recommendations.jsonl"); }
function envelopePath(): string { return path.join(dataDir(), "controlled-llm-routing-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(envelope: ControlledLlmRoutingEnvelope): void { ensureStore(); appendFileSync(envelopePath(), JSON.stringify(envelope)+"\n", "utf8"); }
function sanitizeText(value: unknown): string | undefined { if(typeof value !== "string") return undefined; return value.replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=REDACTED").slice(0, 1000); }
function hasSecretLikeText(value: string): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(value); }
function buildPrompt(ctx: ControlledLlmRoutingEnvelope["sanitizedContext"]): string { return [
  "Du bist ein Master-Agent-Routing-Erklärer.",
  "Erkläre ausschließlich den nächsten sicheren Schritt.",
  "Starte keine Tools, keine Agenten und keine externen Aktionen.",
  "Gib keine Secrets aus und fordere keine Secrets an.",
  "Kontext:",
  JSON.stringify(ctx, null, 2)
].join("\n"); }
export function listControlledLlmRoutingEnvelopes(limit=100): ControlledLlmRoutingEnvelope[] { ensureStore(); return readJsonl(envelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createControlledLlmRoutingEnvelope(input:{ recommendationId?: string; metadata?: Record<string, unknown> }): ControlledLlmRoutingEnvelope {
  ensureStore();
  const recommendations=readJsonl(recommendationsPath());
  const recommendation=input.recommendationId ? recommendations.find((entry:any)=>entry.id===input.recommendationId) : recommendations[0];
  let decision: LlmRoutingEnvelopeDecision="envelope_created";
  let reason="Controlled LLM Routing Envelope erstellt. Phase 17.0 erzeugt nur erklärbaren, sanitisierten Kontext; kein LLM-Aufruf und keine Ausführung.";
  if(!recommendation){ decision="blocked_missing_recommendation"; reason="Planner Recommendation nicht gefunden."; }
  else if(recommendation.executionAllowed!==false || recommendation.toolExecutionAllowed!==false || recommendation.agentExecutionAllowed!==false || recommendation.dryRunOnly!==true || recommendation.llmRoutingPrepOnly!==true){ decision="blocked_execution_not_safe"; reason="Planner Recommendation verletzt Safety Invariants."; }
  const sanitizedContext = {
    title: sanitizeText(recommendation?.title),
    recommendedNextAction: sanitizeText(recommendation?.recommendedNextAction),
    missingSafetyGates: Array.isArray(recommendation?.missingSafetyGates) ? recommendation.missingSafetyGates.map((v:any)=>String(v).slice(0,200)) : [],
    requiredConsentSteps: Array.isArray(recommendation?.requiredConsentSteps) ? recommendation.requiredConsentSteps.map((v:any)=>String(v).slice(0,200)) : [],
    requiredPolicySteps: Array.isArray(recommendation?.requiredPolicySteps) ? recommendation.requiredPolicySteps.map((v:any)=>String(v).slice(0,200)) : [],
  };
  const serialized=JSON.stringify(sanitizedContext);
  if(hasSecretLikeText(serialized)){ decision="blocked_context_not_sanitized"; reason="Sanitized Context enthält weiterhin secret-artige Muster."; }
  const envelope: ControlledLlmRoutingEnvelope = {
    id: makeId("llm-routing-envelope"),
    timestamp:new Date().toISOString(),
    recommendationId: recommendation?.id || input.recommendationId,
    orchestrationPlanId: recommendation?.orchestrationPlanId,
    actionType: recommendation?.actionType,
    decision,
    sanitizedContext,
    explainerPrompt: buildPrompt(sanitizedContext),
    allowedOutputContract:{ outputType:"recommendation_explanation_only", mayExecuteTools:false, mayExecuteAgents:false, mayRevealSecrets:false, mayChangeState:false },
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmRoutingPrepOnly:true,
    noSecretsIncluded: decision !== "blocked_context_not_sanitized",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"17.0", noExecution:true, noLlmCall:true },
  };
  appendEnvelope(envelope);
  return envelope;
}
export function summarizeControlledLlmRoutingEnvelopes(envelopes: ControlledLlmRoutingEnvelope[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const envelope of envelopes){ byDecision[envelope.decision]=(byDecision[envelope.decision]||0)+1; if(envelope.actionType) byActionType[envelope.actionType]=(byActionType[envelope.actionType]||0)+1; } return { total:envelopes.length, byDecision, byActionType }; }
`;
const api = String.raw`import { createControlledLlmRoutingEnvelope, listControlledLlmRoutingEnvelopes, summarizeControlledLlmRoutingEnvelopes } from "../../../lib/controlled-llm-routing-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const envelopes=listControlledLlmRoutingEnvelopes(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeControlledLlmRoutingEnvelopes(envelopes), envelopes });
  } catch(error){
    const message=error instanceof Error ? error.message : "LLM Routing Envelopes konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const envelope=createControlledLlmRoutingEnvelope({ recommendationId: typeof body.recommendationId==="string" ? body.recommendationId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, envelope });
  } catch(error){
    const message=error instanceof Error ? error.message : "LLM Routing Envelope konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Rec={id:string;title:string;decision:string;actionType?:string};
type Env={id:string;timestamp:string;decision:string;actionType?:string;reason:string;sanitizedContext:any;explainerPrompt:string;executionAllowed:boolean;toolExecutionAllowed:boolean;agentExecutionAllowed:boolean;dryRunOnly:boolean;llmRoutingPrepOnly:boolean;noSecretsIncluded:boolean};
export default function ControlledLlmRoutingPage(){
 const [recs,setRecs]=useState<Rec[]>([]); const [envelopes,setEnvelopes]=useState<Env[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [rRes,eRes]=await Promise.all([fetch("/api/master-planner?limit=100",{cache:"no-store"}),fetch("/api/llm-routing-envelope?limit=100",{cache:"no-store"})]); const r=await rRes.json(); const e=await eRes.json(); if(rRes.ok){ const list=Array.isArray(r.recommendations)?r.recommendations:[]; setRecs(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!eRes.ok) throw new Error(e?.error||"LLM Routing Envelopes konnten nicht geladen werden."); setEnvelopes(Array.isArray(e.envelopes)?e.envelopes:[]); setSummary(e.summary||null); } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createEnvelope(){ const res=await fetch("/api/llm-routing-envelope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({recommendationId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Envelope fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="llm-routing-envelope" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0f9ff 0%,#f8fafc 100%)",borderColor:"#7dd3fc"}}><h1 className="section-title">Controlled LLM Routing Envelope</h1><p style={{lineHeight:1.6}}>Phase 17.0 erzeugt einen sanitisierten Routing-Envelope für Planner Recommendations. Kein LLM-Aufruf, keine echte Ausführung, nur Empfehlung/Erklärung.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Envelope erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{recs.map((rec)=><option key={rec.id} value={rec.id}>{rec.title} · {rec.decision} · {rec.id}</option>)}</select><button className="primary-button" type="button" onClick={createEnvelope} disabled={!selected}>LLM Routing Envelope erzeugen</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Routing Envelopes</h2>{envelopes.length===0 ? <p>Noch keine LLM Routing Envelopes.</p> : envelopes.map((env)=><article key={env.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{env.actionType || "planner"}</strong> <span className="chip">{env.decision}</span></div><div className="helper-text"><code>{env.id}</code> · {env.timestamp}</div><p><strong>Reason:</strong> {env.reason}</p><p><strong>Execution:</strong> {String(env.executionAllowed)} · <strong>Tool:</strong> {String(env.toolExecutionAllowed)} · <strong>Agent:</strong> {String(env.agentExecutionAllowed)} · <strong>Dry-run:</strong> {String(env.dryRunOnly)} · <strong>LLM Routing Prep:</strong> {String(env.llmRoutingPrepOnly)} · <strong>No Secrets:</strong> {String(env.noSecretsIncluded)}</p><h3>Sanitized Context</h3><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(env.sanitizedContext, null, 2)}</pre><h3>Explainer Prompt</h3><pre style={{whiteSpace:"pre-wrap"}}>{env.explainerPrompt}</pre></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "llm-routing-envelope"')){ const marker='{ href: "/master-planner-dashboard", label: "Planner Dashboard", key: "master-planner-dashboard" },'; const line='  { href: "/llm-routing-envelope", label: "LLM Routing", key: "llm-routing-envelope" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: LLM Routing Link ergänzt."); } else console.log("SKIP UnifiedNavigation: LLM Routing bereits vorhanden."); }
function patchDocs(){ ensureFile("phase17-0-controlled-llm-routing-envelope.md", `# Phase 17.0 – Controlled LLM Routing Envelope / Planner Recommendation Explainer

## Ziel
Planner Recommendations werden in einen kontrollierten LLM-Routing-Envelope überführt.

## Neue UI/API
- UI: /llm-routing-envelope
- API: /api/llm-routing-envelope
- Store: data/controlled-llm-routing-envelopes.jsonl

## Sicherheitsprinzip
- kein LLM-Aufruf
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- sanitisiertes Kontextobjekt
- keine Secrets
- Output Contract: recommendation_explanation_only
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true
- llmRoutingPrepOnly=true

## Nächster Schritt
Phase 17.1 kann LLM Routing Policy Simulation & Audit ergänzen.
`);
ensureFile("docs/phase17-controlled-llm-routing-envelope-runbook.md", `# Runbook – Phase 17.0 Controlled LLM Routing Envelope

## Patch
\`\`\`powershell
npm run phase17:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase17-0-patch-controlled-llm-routing-envelope.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase17:0:verify
npm run build
\`\`\`

Docker nur für Browser-Test:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
\`\`\`
`); }
patchPackage();
ensureFile("frontend/lib/controlled-llm-routing-envelope-store.ts", store);
ensureFile("frontend/app/api/llm-routing-envelope/route.ts", api);
ensureFile("frontend/app/llm-routing-envelope/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 17.0 Patch abgeschlossen.");
