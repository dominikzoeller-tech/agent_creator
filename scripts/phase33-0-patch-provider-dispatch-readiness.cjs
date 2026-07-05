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
  pkg.scripts["phase33:0:patch"]="node scripts/phase33-0-patch-provider-dispatch-readiness.cjs";
  pkg.scripts["phase33:0:verify"]="node scripts/phase33-0-verify-provider-dispatch-readiness.cjs";
  pkg.scripts["llm:provider-dispatch-readiness:verify"]="node scripts/phase33-0-verify-provider-dispatch-readiness.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 33.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchReadinessDecision =
  | "provider_dispatch_readiness_prepared_no_provider_call"
  | "blocked_missing_provider_request_envelope"
  | "blocked_envelope_not_assembled"
  | "blocked_not_metadata_only"
  | "blocked_envelope_payload_included"
  | "blocked_prompt_payload_included"
  | "blocked_secret_values_included"
  | "blocked_sensitive_request_body_included"
  | "blocked_provider_selection_attempt"
  | "blocked_dispatch_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchReadiness {
  id: string;
  timestamp: string;
  providerRequestEnvelopeId?: string;
  providerRequestContractId?: string;
  tokenBackedPreflightId?: string;
  activationGateId?: string;
  decision: ProviderDispatchReadinessDecision;
  readinessMode: "controlled_provider_dispatch_readiness_metadata_only_no_provider_call";
  readinessChecks: Array<{ name: string; passed: boolean; reason: string }>;
  dispatchPlan: {
    providerDispatchPrepared: true;
    providerDispatchPerformed: false;
    provider: "none";
    modelSelected: "none";
    metadataOnly: true;
    dispatchPayloadIncluded: false;
    envelopePayloadIncluded: false;
    promptPayloadIncluded: false;
    secretValuesIncluded: false;
    requestBodyIncluded: false;
    sensitiveRequestBodyIncluded: false;
  };
  operationalControls: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  providerDispatchPrepared: true;
  providerDispatchPerformed: false;
  providerRequestEnvelopeAssembled: true;
  metadataOnly: true;
  provider: "none";
  modelSelected: "none";
  dispatchPayloadIncluded: false;
  envelopePayloadIncluded: false;
  promptPayloadIncluded: false;
  promptIncluded: false;
  promptRedactedPreviewIncluded: false;
  secretValuesIncluded: false;
  requestBodyIncluded: false;
  sensitiveRequestBodyIncluded: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function envelopePath(): string { return path.join(dataDir(), "provider-request-envelopes.jsonl"); }
function readinessPath(): string { return path.join(dataDir(), "provider-dispatch-readiness.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendReadiness(item: ProviderDispatchReadiness): void { ensureStore(); appendFileSync(readinessPath(), JSON.stringify(item)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchReadiness(limit=100): ProviderDispatchReadiness[] { ensureStore(); return readJsonl(readinessPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createProviderDispatchReadiness(input:{ providerRequestEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchReadiness {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const envelope=input.providerRequestEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerRequestEnvelopeId) : envelopes[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"provider_request_envelope_exists", passed:Boolean(envelope), reason:envelope?"Provider Request Envelope gefunden.":"Provider Request Envelope fehlt." });
  checks.push({ name:"provider_request_envelope_assembled", passed:envelope?.providerRequestEnvelopeAssembled===true, reason:"Provider Request Envelope muss assembliert sein." });
  checks.push({ name:"metadata_only", passed:envelope?.metadataOnly===true, reason:"Dispatch Readiness bleibt metadata-only." });
  checks.push({ name:"provider_none", passed:envelope?.provider==="none" && envelope?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"envelope_payload_not_included", passed:envelope?.envelopePayloadIncluded===false, reason:"Envelope Payload darf nicht enthalten sein." });
  checks.push({ name:"prompt_payload_not_included", passed:envelope?.promptPayloadIncluded===false && envelope?.promptIncluded===false && envelope?.promptRedactedPreviewIncluded===false, reason:"Prompt Payload, Prompt und redacted Preview dürfen nicht enthalten sein." });
  checks.push({ name:"secret_values_not_included", passed:envelope?.secretValuesIncluded===false && envelope?.noSecretsIncluded===true && !containsSecretValue(envelope), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:envelope?.requestBodyIncluded===false && envelope?.sensitiveRequestBodyIncluded===false, reason:"Request Body und sensitive Request Body dürfen nicht enthalten sein." });
  checks.push({ name:"dispatch_not_performed", passed:true, reason:"Provider Dispatch wird in Phase 33.0 nicht ausgeführt." });
  checks.push({ name:"network_provider_blocked", passed:envelope?.networkCallPerformed===false && envelope?.providerExecutionAllowed===false, reason:"Kein Netzwerk-/Provider-Aufruf." });
  checks.push({ name:"llm_blocked", passed:envelope?.realLlmCallAllowed===false && envelope?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed===false && envelope?.toolExecutionAllowed===false && envelope?.agentExecutionAllowed===false && envelope?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderDispatchReadinessDecision="provider_dispatch_readiness_prepared_no_provider_call";
  let reason="Provider Dispatch Readiness metadata-only vorbereitet. Kein Dispatch, kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte, kein sensibler Request Body.";
  if(!envelope){ decision="blocked_missing_provider_request_envelope"; reason="Provider Request Envelope fehlt."; }
  else if(envelope.providerRequestEnvelopeAssembled!==true){ decision="blocked_envelope_not_assembled"; reason="Provider Request Envelope ist nicht assembliert."; }
  else if(envelope.metadataOnly!==true){ decision="blocked_not_metadata_only"; reason="Provider Request Envelope ist nicht metadata-only."; }
  else if(envelope.envelopePayloadIncluded!==false){ decision="blocked_envelope_payload_included"; reason="Envelope Payload ist enthalten."; }
  else if(envelope.promptPayloadIncluded!==false || envelope.promptIncluded!==false || envelope.promptRedactedPreviewIncluded!==false){ decision="blocked_prompt_payload_included"; reason="Prompt Payload, Prompt oder redacted Preview ist enthalten."; }
  else if(envelope.secretValuesIncluded!==false || envelope.noSecretsIncluded!==true || containsSecretValue(envelope)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(envelope.requestBodyIncluded!==false || envelope.sensitiveRequestBodyIncluded!==false){ decision="blocked_sensitive_request_body_included"; reason="Request Body oder sensitive Request Body ist enthalten."; }
  else if(envelope.provider!=="none" || envelope.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(envelope.networkCallPerformed!==false || envelope.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(envelope.executionAllowed!==false || envelope.toolExecutionAllowed!==false || envelope.agentExecutionAllowed!==false || envelope.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const item:ProviderDispatchReadiness={
    id:makeId("provider-dispatch-readiness"), timestamp:new Date().toISOString(), providerRequestEnvelopeId:envelope?.id||input.providerRequestEnvelopeId, providerRequestContractId:envelope?.providerRequestContractId, tokenBackedPreflightId:envelope?.tokenBackedPreflightId, activationGateId:envelope?.activationGateId, decision,
    readinessMode:"controlled_provider_dispatch_readiness_metadata_only_no_provider_call", readinessChecks:checks,
    dispatchPlan:{ providerDispatchPrepared:true, providerDispatchPerformed:false, provider:"none", modelSelected:"none", metadataOnly:true, dispatchPayloadIncluded:false, envelopePayloadIncluded:false, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    providerDispatchPrepared:true, providerDispatchPerformed:false, providerRequestEnvelopeAssembled:true, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, envelopePayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason,
    metadata:{ ...(input.metadata||{}), phase:"33.0", providerDispatchReadinessOnly:true, metadataOnly:true, providerDispatchPerformed:false, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, noPromptPayload:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendReadiness(item);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:item.id, status:item.decision, riskLevel:"critical", summary:"Provider Dispatch Readiness prepared: "+item.decision, metadata:{ source:"phase33.0-provider-dispatch-readiness", readinessId:item.id, providerRequestEnvelopeId:item.providerRequestEnvelopeId, providerDispatchPrepared:true, providerDispatchPerformed:false, metadataOnly:true, dispatchPayloadIncluded:false, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return item;
}
export function summarizeProviderDispatchReadiness(items:ProviderDispatchReadiness[]){ const byDecision:Record<string,number>={}; for(const item of items){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:items.length, byDecision }; }
`;
const api=String.raw`import { createProviderDispatchReadiness, listProviderDispatchReadiness, summarizeProviderDispatchReadiness } from "../../../lib/provider-dispatch-readiness-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const providerDispatchReadiness=listProviderDispatchReadiness(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchReadiness(providerDispatchReadiness), providerDispatchReadiness }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Readiness konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const readiness=createProviderDispatchReadiness({ providerRequestEnvelopeId: typeof body.providerRequestEnvelopeId==="string" ? body.providerRequestEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, providerDispatchReadiness:readiness }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Readiness konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Envelope={id:string;decision:string;timestamp:string;envelopeMode:string};
type Readiness={id:string;timestamp:string;decision:string;reason:string;readinessMode:string;readinessChecks:Array<{name:string;passed:boolean;reason:string}>;providerDispatchPrepared:boolean;providerDispatchPerformed:boolean;metadataOnly:boolean;provider:string;modelSelected:string;dispatchPayloadIncluded:boolean;envelopePayloadIncluded:boolean;promptPayloadIncluded:boolean;secretValuesIncluded:boolean;requestBodyIncluded:boolean;sensitiveRequestBodyIncluded:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchReadinessPage(){
 const [envelopes,setEnvelopes]=useState<Envelope[]>([]); const [items,setItems]=useState<Readiness[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [eRes,rRes]=await Promise.all([fetch("/api/provider-request-envelope?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-readiness?limit=100",{cache:"no-store"})]); const e=await eRes.json(); const r=await rRes.json(); if(eRes.ok){ const list=Array.isArray(e.providerRequestEnvelopes)?e.providerRequestEnvelopes:[]; setEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!rRes.ok) throw new Error(r?.error||"Provider Dispatch Readiness konnten nicht geladen werden."); setItems(Array.isArray(r.providerDispatchReadiness)?r.providerDispatchReadiness:[]); setSummary(r.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function create(){ const res=await fetch("/api/provider-dispatch-readiness",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerRequestEnvelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Provider Dispatch Readiness fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-readiness" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fefce8 0%,#f8fafc 100%)",borderColor:"#fde68a"}}><h1 className="section-title">Provider Dispatch Readiness</h1><p style={{lineHeight:1.6}}>Phase 33.0 bereitet Provider Dispatch Readiness metadata-only vor. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte, kein sensibler Request Body.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Dispatch Readiness vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{envelopes.map((item)=><option key={item.id} value={item.id}>{item.envelopeMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={create} disabled={!selected}>Provider Dispatch Readiness vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Readiness</h2>{items.length===0?<p>Noch keine Provider Dispatch Readiness.</p>:items.map((item)=><article key={item.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{item.readinessMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Prepared:</strong> {String(item.providerDispatchPrepared)} · <strong>Dispatch performed:</strong> {String(item.providerDispatchPerformed)} · <strong>Metadata-only:</strong> {String(item.metadataOnly)} · <strong>Provider:</strong> {item.provider} · <strong>Model:</strong> {item.modelSelected}</p><p><strong>Dispatch payload:</strong> {String(item.dispatchPayloadIncluded)} · <strong>Envelope payload:</strong> {String(item.envelopePayloadIncluded)} · <strong>Prompt payload:</strong> {String(item.promptPayloadIncluded)} · <strong>Secrets:</strong> {String(item.secretValuesIncluded)} · <strong>Request body:</strong> {String(item.requestBodyIncluded)} · <strong>Sensitive body:</strong> {String(item.sensitiveRequestBodyIncluded)}</p><p><strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p><ul>{item.readinessChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-dispatch-readiness"')){ const line='  { href: "/provider-dispatch-readiness", label: "Provider Dispatch Readiness", key: "provider-dispatch-readiness" },'; const marker='{ href: "/provider-request-envelope-dashboard", label: "Provider Envelope Dashboard", key: "provider-request-envelope-dashboard" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Dispatch Readiness Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Dispatch Readiness bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase33-0-provider-dispatch-readiness.md", `# Phase 33.0 – Controlled Provider Dispatch Readiness / Still No Provider Call

## Ziel
Provider Dispatch Readiness wird metadata-only vorbereitet. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte und kein sensibler Request Body.

## UI/API
- UI: /provider-dispatch-readiness
- API: /api/provider-dispatch-readiness

## Sicherheitsprinzip
- controlled_provider_dispatch_readiness_metadata_only_no_provider_call
- providerDispatchPrepared=true
- providerDispatchPerformed=false
- metadataOnly=true
- provider=none
- modelSelected=none
- dispatchPayloadIncluded=false
- envelopePayloadIncluded=false
- promptPayloadIncluded=false
- secretValuesIncluded=false
- requestBodyIncluded=false
- sensitiveRequestBodyIncluded=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 33.1 – Provider Dispatch Readiness Policy & Audit
`);
ensureFile("docs/phase33-provider-dispatch-readiness-runbook.md", `# Runbook – Phase 33.0 Provider Dispatch Readiness

## Patch
\`\`\`powershell
npm run phase33:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase33-0-patch-provider-dispatch-readiness.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase33:0:verify
npm run build
\`\`\`

## Browser-Test
http://localhost:3000/provider-dispatch-readiness
`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-readiness-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-readiness/route.ts", api);
ensureFile("frontend/app/provider-dispatch-readiness/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 33.0 Patch abgeschlossen.");
