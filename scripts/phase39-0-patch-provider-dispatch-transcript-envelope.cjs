const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensureFile(file, content){ if(!exists(file)){ write(file, content); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase39:0:patch"]="node scripts/phase39-0-patch-provider-dispatch-transcript-envelope.cjs";
  pkg.scripts["phase39:0:verify"]="node scripts/phase39-0-verify-provider-dispatch-transcript-envelope.cjs";
  pkg.scripts["llm:provider-dispatch-transcript-envelope:verify"]="node scripts/phase39-0-verify-provider-dispatch-transcript-envelope.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 39.0 Scripts eingetragen.");
}
const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchTranscriptEnvelopeDecision =
  | "provider_dispatch_transcript_envelope_prepared_no_provider_call"
  | "blocked_missing_dry_run_result_envelope"
  | "blocked_dry_run_result_envelope_not_prepared"
  | "blocked_result_envelope_contains_provider_response"
  | "blocked_command_envelope_executed"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchTranscriptEnvelope {
  id:string;
  timestamp:string;
  providerDispatchDryRunResultEnvelopeId?:string;
  providerDispatchDryRunCommandEnvelopeId?:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchTranscriptEnvelopeDecision;
  transcriptMode:"controlled_provider_dispatch_transcript_envelope_no_provider_call";
  providerDispatchTranscriptEnvelopePrepared:true;
  transcriptEnvelopePrepared:true;
  transcriptEnvelopePersisted:true;
  transcriptEnvelopeContainsProviderResponse:false;
  transcriptEnvelopeContainsPromptPayload:false;
  transcriptEnvelopeContainsSecrets:false;
  resultEnvelopePrepared:true;
  resultEnvelopePersisted:true;
  resultEnvelopeContainsProviderResponse:false;
  commandEnvelopePrepared:true;
  commandEnvelopeExecuted:false;
  executionGateOpen:false;
  finalDispatchAllowed:false;
  providerDispatchPerformed:false;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  dispatchPayloadIncluded:false;
  commandPayloadIncluded:false;
  promptPayloadIncluded:false;
  promptIncluded:false;
  providerResponseIncluded:false;
  providerResultIncluded:false;
  secretValuesIncluded:false;
  requestBodyIncluded:false;
  sensitiveRequestBodyIncluded:false;
  networkCallAllowed:false;
  networkCallPerformed:false;
  providerExecutionAllowed:false;
  realLlmCallAllowed:false;
  llmCallPerformed:false;
  executionAllowed:false;
  toolExecutionAllowed:false;
  agentExecutionAllowed:false;
  dryRunOnly:true;
  noSecretsIncluded:boolean;
  reason:string;
  metadata?:Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function resultEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-dry-run-result-envelopes.jsonl"); }
function transcriptEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-transcript-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(envelope:ProviderDispatchTranscriptEnvelope): void { ensureStore(); appendFileSync(transcriptEnvelopePath(), JSON.stringify(envelope)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchTranscriptEnvelopes(limit=100): ProviderDispatchTranscriptEnvelope[] {
  ensureStore();
  return readJsonl(transcriptEnvelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function createProviderDispatchTranscriptEnvelope(input:{ providerDispatchDryRunResultEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchTranscriptEnvelope {
  ensureStore();
  const envelopes=readJsonl(resultEnvelopePath());
  const resultEnvelope=input.providerDispatchDryRunResultEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerDispatchDryRunResultEnvelopeId) : envelopes[0];
  let decision:ProviderDispatchTranscriptEnvelopeDecision="provider_dispatch_transcript_envelope_prepared_no_provider_call";
  let reason="Provider Dispatch Transcript Envelope wurde nur vorbereitet. Es enthält keine Provider Response, keinen Prompt Payload und keine Secrets. Kein Provider-/Netzwerk-Aufruf.";
  if(!resultEnvelope){ decision="blocked_missing_dry_run_result_envelope"; reason="Provider Dispatch Dry-Run Result Envelope fehlt."; }
  else if(resultEnvelope.providerDispatchDryRunResultEnvelopePrepared!==true || resultEnvelope.resultEnvelopePrepared!==true || resultEnvelope.resultEnvelopePersisted!==true){ decision="blocked_dry_run_result_envelope_not_prepared"; reason="Dry-Run Result Envelope ist nicht vorbereitet oder nicht persistiert."; }
  else if(resultEnvelope.resultEnvelopeContainsProviderResponse!==false || resultEnvelope.providerResponseIncluded!==false || resultEnvelope.providerResultIncluded!==false){ decision="blocked_result_envelope_contains_provider_response"; reason="Result Envelope enthält Provider Response oder Provider Result."; }
  else if(resultEnvelope.commandEnvelopeExecuted!==false){ decision="blocked_command_envelope_executed"; reason="Command Envelope wurde ausgeführt."; }
  else if(resultEnvelope.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(resultEnvelope.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(resultEnvelope.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgeführt oder ist nicht sicher false."; }
  else if(resultEnvelope.provider!=="none" || resultEnvelope.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(resultEnvelope.dispatchPayloadIncluded!==false || resultEnvelope.commandPayloadIncluded!==false || resultEnvelope.promptPayloadIncluded!==false || resultEnvelope.promptIncluded!==false || resultEnvelope.requestBodyIncluded!==false || resultEnvelope.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Dispatch-/Command-/Prompt-Payload oder Request Body ist enthalten."; }
  else if(resultEnvelope.secretValuesIncluded!==false || resultEnvelope.noSecretsIncluded!==true || containsSecretValue(resultEnvelope)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(resultEnvelope.networkCallAllowed!==false || resultEnvelope.networkCallPerformed!==false || resultEnvelope.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(resultEnvelope.executionAllowed!==false || resultEnvelope.toolExecutionAllowed!==false || resultEnvelope.agentExecutionAllowed!==false || resultEnvelope.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const envelope:ProviderDispatchTranscriptEnvelope={
    id:makeId("provider-dispatch-transcript-envelope"), timestamp:new Date().toISOString(), providerDispatchDryRunResultEnvelopeId:resultEnvelope?.id || input.providerDispatchDryRunResultEnvelopeId, providerDispatchDryRunCommandEnvelopeId:resultEnvelope?.providerDispatchDryRunCommandEnvelopeId, providerDispatchExecutionGateId:resultEnvelope?.providerDispatchExecutionGateId, providerDispatchFinalPreflightId:resultEnvelope?.providerDispatchFinalPreflightId, providerDispatchTokenBindingId:resultEnvelope?.providerDispatchTokenBindingId, providerDispatchReadinessId:resultEnvelope?.providerDispatchReadinessId, decision, transcriptMode:"controlled_provider_dispatch_transcript_envelope_no_provider_call", providerDispatchTranscriptEnvelopePrepared:true, transcriptEnvelopePrepared:true, transcriptEnvelopePersisted:true, transcriptEnvelopeContainsProviderResponse:false, transcriptEnvelopeContainsPromptPayload:false, transcriptEnvelopeContainsSecrets:false, resultEnvelopePrepared:true, resultEnvelopePersisted:true, resultEnvelopeContainsProviderResponse:false, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, providerResponseIncluded:false, providerResultIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason, metadata:{ ...(input.metadata||{}), phase:"39.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, transcriptEnvelopeContainsProviderResponse:false, transcriptEnvelopeContainsPromptPayload:false, transcriptEnvelopeContainsSecrets:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendEnvelope(envelope);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:envelope.providerDispatchDryRunResultEnvelopeId, status:envelope.decision, riskLevel:"critical", summary:"Provider Dispatch Transcript Envelope: "+envelope.decision, metadata:{ source:"phase39.0-provider-dispatch-transcript-envelope", envelopeId:envelope.id, providerDispatchDryRunResultEnvelopeId:envelope.providerDispatchDryRunResultEnvelopeId, transcriptEnvelopeContainsProviderResponse:false, transcriptEnvelopeContainsPromptPayload:false, transcriptEnvelopeContainsSecrets:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return envelope;
}
export function summarizeProviderDispatchTranscriptEnvelopes(envelopes:ProviderDispatchTranscriptEnvelope[]){ const byDecision:Record<string,number>={}; for(const item of envelopes){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:envelopes.length, byDecision }; }
`;
const api=`import { createProviderDispatchTranscriptEnvelope, listProviderDispatchTranscriptEnvelopes, summarizeProviderDispatchTranscriptEnvelopes } from "../../../lib/provider-dispatch-transcript-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const providerDispatchTranscriptEnvelopes=listProviderDispatchTranscriptEnvelopes(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchTranscriptEnvelopes(providerDispatchTranscriptEnvelopes), providerDispatchTranscriptEnvelopes }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Transcript Envelopes konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const envelope=createProviderDispatchTranscriptEnvelope({ providerDispatchDryRunResultEnvelopeId: typeof body.providerDispatchDryRunResultEnvelopeId==="string" ? body.providerDispatchDryRunResultEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, envelope }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Transcript Envelope konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ResultEnvelope={id:string;decision:string;timestamp:string;envelopeMode:string};
type TranscriptEnvelope={id:string;timestamp:string;decision:string;reason:string;transcriptMode:string;providerDispatchTranscriptEnvelopePrepared:boolean;transcriptEnvelopePrepared:boolean;transcriptEnvelopePersisted:boolean;transcriptEnvelopeContainsProviderResponse:boolean;transcriptEnvelopeContainsPromptPayload:boolean;transcriptEnvelopeContainsSecrets:boolean;commandEnvelopeExecuted:boolean;executionGateOpen:boolean;finalDispatchAllowed:boolean;networkCallAllowed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchTranscriptEnvelopePage(){
 const [resultEnvelopes,setResultEnvelopes]=useState<ResultEnvelope[]>([]); const [transcripts,setTranscripts]=useState<TranscriptEnvelope[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [rRes,tRes]=await Promise.all([fetch("/api/provider-dispatch-dry-run-result-envelope?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-transcript-envelope?limit=100",{cache:"no-store"})]); const r=await rRes.json(); const t=await tRes.json(); if(rRes.ok){ const list=Array.isArray(r.providerDispatchDryRunResultEnvelopes)?r.providerDispatchDryRunResultEnvelopes:[]; setResultEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!tRes.ok) throw new Error(t?.error||"Transcript Envelopes konnten nicht geladen werden."); setTranscripts(Array.isArray(t.providerDispatchTranscriptEnvelopes)?t.providerDispatchTranscriptEnvelopes:[]); setSummary(t.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createEnvelope(){ const res=await fetch("/api/provider-dispatch-transcript-envelope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchDryRunResultEnvelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Transcript Envelope fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-transcript-envelope" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Transcript Envelope</h1><p style={{lineHeight:1.6}}>Phase 39.0 bereitet ein Provider Dispatch Transcript Envelope vor. Das Transcript Envelope enthält keine Provider Response, keinen Prompt Payload und keine Secrets. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Transcript Envelope vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{resultEnvelopes.map((item)=><option key={item.id} value={item.id}>{item.envelopeMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={createEnvelope} disabled={!selected}>Provider Dispatch Transcript Envelope vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Transcript Envelopes</h2>{transcripts.length===0?<p>Noch keine Transcript Envelopes.</p>:transcripts.map((item)=><article key={item.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{item.transcriptMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Prepared:</strong> {String(item.providerDispatchTranscriptEnvelopePrepared)} · <strong>Persisted:</strong> {String(item.transcriptEnvelopePersisted)} · <strong>Provider response:</strong> {String(item.transcriptEnvelopeContainsProviderResponse)} · <strong>Prompt payload:</strong> {String(item.transcriptEnvelopeContainsPromptPayload)} · <strong>Secrets:</strong> {String(item.transcriptEnvelopeContainsSecrets)}</p><p><strong>Command executed:</strong> {String(item.commandEnvelopeExecuted)} · <strong>Gate open:</strong> {String(item.executionGateOpen)} · <strong>Final dispatch allowed:</strong> {String(item.finalDispatchAllowed)} · <strong>Network allowed:</strong> {String(item.networkCallAllowed)} · <strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-transcript-envelope')){ console.log("SKIP UnifiedNavigation: Transcript Envelope bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-transcript-envelope", label: "Dispatch Transcript", key: "provider-dispatch-transcript-envelope" },'; const markers=['{ href: "/provider-dispatch-dry-run-result-envelope-dashboard", label: "Dispatch Dry-Run Result Dashboard", key: "provider-dispatch-dry-run-result-envelope-dashboard" },','{ href: "/provider-dispatch-dry-run-result-envelope", label: "Dispatch Dry-Run Result", key: "provider-dispatch-dry-run-result-envelope" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Transcript Link ergänzt."); }
function patchDocs(){ ensureFile("phase39-0-provider-dispatch-transcript-envelope.md", `# Phase 39.0 – Controlled Provider Dispatch Transcript Envelope / Still No Provider Call\n\n## Ziel\nEin Provider Dispatch Transcript Envelope wird vorbereitet und persistiert, enthält aber keine Provider Response, keinen Prompt Payload und keine Secrets. Kein Dispatch und kein Provider-/Netzwerk-Aufruf.\n\n## UI/API\n- UI: /provider-dispatch-transcript-envelope\n- API: /api/provider-dispatch-transcript-envelope\n\n## Sicherheitsinvarianten\n- providerDispatchTranscriptEnvelopePrepared=true\n- transcriptEnvelopePrepared=true\n- transcriptEnvelopePersisted=true\n- transcriptEnvelopeContainsProviderResponse=false\n- transcriptEnvelopeContainsPromptPayload=false\n- transcriptEnvelopeContainsSecrets=false\n- resultEnvelopeContainsProviderResponse=false\n- commandEnvelopeExecuted=false\n- executionGateOpen=false\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- providerResponseIncluded=false\n- providerResultIncluded=false\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 39.1 – Provider Dispatch Transcript Envelope Policy & Audit\n`); ensureFile("docs/phase39-provider-dispatch-transcript-envelope-runbook.md", `# Runbook – Phase 39.0 Provider Dispatch Transcript Envelope\n\n## Patch\n\`\`\`powershell\nnpm run phase39:0:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase39:0:verify\nnpm run build\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-transcript-envelope-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-transcript-envelope/route.ts", api);
ensureFile("frontend/app/provider-dispatch-transcript-envelope/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 39.0 Patch abgeschlossen.");
