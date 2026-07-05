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
  pkg.scripts["phase40:0:patch"]="node scripts/phase40-0-patch-provider-dispatch-release-candidate-envelope.cjs";
  pkg.scripts["phase40:0:verify"]="node scripts/phase40-0-verify-provider-dispatch-release-candidate-envelope.cjs";
  pkg.scripts["llm:provider-dispatch-release-candidate-envelope:verify"]="node scripts/phase40-0-verify-provider-dispatch-release-candidate-envelope.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 40.0 Scripts eingetragen.");
}
const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchReleaseCandidateEnvelopeDecision =
  | "provider_dispatch_release_candidate_envelope_prepared_no_provider_call"
  | "blocked_missing_transcript_envelope"
  | "blocked_transcript_envelope_not_prepared"
  | "blocked_transcript_contains_provider_response"
  | "blocked_transcript_contains_prompt_payload"
  | "blocked_transcript_contains_secrets"
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

export interface ProviderDispatchReleaseCandidateEnvelope {
  id:string;
  timestamp:string;
  providerDispatchTranscriptEnvelopeId?:string;
  providerDispatchDryRunResultEnvelopeId?:string;
  providerDispatchDryRunCommandEnvelopeId?:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchReleaseCandidateEnvelopeDecision;
  envelopeMode:"controlled_provider_dispatch_release_candidate_envelope_no_provider_call";
  providerDispatchReleaseCandidateEnvelopePrepared:true;
  releaseCandidateEnvelopePrepared:true;
  releaseCandidateEnvelopePersisted:true;
  releaseCandidateReadyForHumanReview:true;
  releaseCandidateApproved:false;
  releaseCandidateExecuted:false;
  releaseCandidateContainsProviderResponse:false;
  releaseCandidateContainsPromptPayload:false;
  releaseCandidateContainsSecrets:false;
  transcriptEnvelopePrepared:true;
  transcriptEnvelopePersisted:true;
  transcriptEnvelopeContainsProviderResponse:false;
  transcriptEnvelopeContainsPromptPayload:false;
  transcriptEnvelopeContainsSecrets:false;
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
function transcriptEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-transcript-envelopes.jsonl"); }
function releaseCandidateEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-release-candidate-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\\r?\\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(envelope:ProviderDispatchReleaseCandidateEnvelope): void { ensureStore(); appendFileSync(releaseCandidateEnvelopePath(), JSON.stringify(envelope)+"\\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\\s*[:=]\\s*[^\\s,;]+|token\\s*[:=]\\s*[^\\s,;]+|secret\\s*[:=]\\s*[^\\s,;]+|password\\s*[:=]\\s*[^\\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchReleaseCandidateEnvelopes(limit=100): ProviderDispatchReleaseCandidateEnvelope[] {
  ensureStore();
  return readJsonl(releaseCandidateEnvelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function createProviderDispatchReleaseCandidateEnvelope(input:{ providerDispatchTranscriptEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchReleaseCandidateEnvelope {
  ensureStore();
  const envelopes=readJsonl(transcriptEnvelopePath());
  const transcript=input.providerDispatchTranscriptEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerDispatchTranscriptEnvelopeId) : envelopes[0];
  let decision:ProviderDispatchReleaseCandidateEnvelopeDecision="provider_dispatch_release_candidate_envelope_prepared_no_provider_call";
  let reason="Provider Dispatch Release Candidate Envelope wurde nur vorbereitet und ist nur bereit für Human Review. Es wird nicht approved, nicht ausgeführt und enthält keine Provider Response, keinen Prompt Payload und keine Secrets. Kein Provider-/Netzwerk-Aufruf.";
  if(!transcript){ decision="blocked_missing_transcript_envelope"; reason="Provider Dispatch Transcript Envelope fehlt."; }
  else if(transcript.providerDispatchTranscriptEnvelopePrepared!==true || transcript.transcriptEnvelopePrepared!==true || transcript.transcriptEnvelopePersisted!==true){ decision="blocked_transcript_envelope_not_prepared"; reason="Transcript Envelope ist nicht vorbereitet oder nicht persistiert."; }
  else if(transcript.transcriptEnvelopeContainsProviderResponse!==false || transcript.providerResponseIncluded!==false || transcript.providerResultIncluded!==false){ decision="blocked_transcript_contains_provider_response"; reason="Transcript enthält Provider Response oder Provider Result."; }
  else if(transcript.transcriptEnvelopeContainsPromptPayload!==false || transcript.promptPayloadIncluded!==false || transcript.promptIncluded!==false){ decision="blocked_transcript_contains_prompt_payload"; reason="Transcript enthält Prompt Payload."; }
  else if(transcript.transcriptEnvelopeContainsSecrets!==false || transcript.secretValuesIncluded!==false || transcript.noSecretsIncluded!==true || containsSecretValue(transcript)){ decision="blocked_transcript_contains_secrets"; reason="Transcript enthält Secret-Werte."; }
  else if(transcript.resultEnvelopeContainsProviderResponse!==false){ decision="blocked_result_envelope_contains_provider_response"; reason="Result Envelope enthält Provider Response."; }
  else if(transcript.commandEnvelopeExecuted!==false){ decision="blocked_command_envelope_executed"; reason="Command Envelope wurde ausgeführt."; }
  else if(transcript.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(transcript.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(transcript.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgeführt oder ist nicht sicher false."; }
  else if(transcript.provider!=="none" || transcript.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(transcript.dispatchPayloadIncluded!==false || transcript.commandPayloadIncluded!==false || transcript.requestBodyIncluded!==false || transcript.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Payload oder Request Body ist enthalten."; }
  else if(transcript.secretValuesIncluded!==false || transcript.noSecretsIncluded!==true || containsSecretValue(transcript)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(transcript.networkCallAllowed!==false || transcript.networkCallPerformed!==false || transcript.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(transcript.executionAllowed!==false || transcript.toolExecutionAllowed!==false || transcript.agentExecutionAllowed!==false || transcript.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const envelope:ProviderDispatchReleaseCandidateEnvelope={
    id:makeId("provider-dispatch-release-candidate-envelope"), timestamp:new Date().toISOString(), providerDispatchTranscriptEnvelopeId:transcript?.id || input.providerDispatchTranscriptEnvelopeId, providerDispatchDryRunResultEnvelopeId:transcript?.providerDispatchDryRunResultEnvelopeId, providerDispatchDryRunCommandEnvelopeId:transcript?.providerDispatchDryRunCommandEnvelopeId, providerDispatchExecutionGateId:transcript?.providerDispatchExecutionGateId, providerDispatchFinalPreflightId:transcript?.providerDispatchFinalPreflightId, providerDispatchTokenBindingId:transcript?.providerDispatchTokenBindingId, providerDispatchReadinessId:transcript?.providerDispatchReadinessId, decision, envelopeMode:"controlled_provider_dispatch_release_candidate_envelope_no_provider_call", providerDispatchReleaseCandidateEnvelopePrepared:true, releaseCandidateEnvelopePrepared:true, releaseCandidateEnvelopePersisted:true, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false, releaseCandidateContainsProviderResponse:false, releaseCandidateContainsPromptPayload:false, releaseCandidateContainsSecrets:false, transcriptEnvelopePrepared:true, transcriptEnvelopePersisted:true, transcriptEnvelopeContainsProviderResponse:false, transcriptEnvelopeContainsPromptPayload:false, transcriptEnvelopeContainsSecrets:false, resultEnvelopeContainsProviderResponse:false, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, providerResponseIncluded:false, providerResultIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included" && decision!=="blocked_transcript_contains_secrets", reason, metadata:{ ...(input.metadata||{}), phase:"40.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false, releaseCandidateContainsProviderResponse:false, releaseCandidateContainsPromptPayload:false, releaseCandidateContainsSecrets:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendEnvelope(envelope);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:envelope.providerDispatchTranscriptEnvelopeId, status:envelope.decision, riskLevel:"critical", summary:"Provider Dispatch Release Candidate Envelope: "+envelope.decision, metadata:{ source:"phase40.0-provider-dispatch-release-candidate-envelope", envelopeId:envelope.id, providerDispatchTranscriptEnvelopeId:envelope.providerDispatchTranscriptEnvelopeId, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false, releaseCandidateContainsProviderResponse:false, releaseCandidateContainsPromptPayload:false, releaseCandidateContainsSecrets:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return envelope;
}
export function summarizeProviderDispatchReleaseCandidateEnvelopes(envelopes:ProviderDispatchReleaseCandidateEnvelope[]){ const byDecision:Record<string,number>={}; for(const item of envelopes){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:envelopes.length, byDecision }; }
`;
const api=`import { createProviderDispatchReleaseCandidateEnvelope, listProviderDispatchReleaseCandidateEnvelopes, summarizeProviderDispatchReleaseCandidateEnvelopes } from "../../../lib/provider-dispatch-release-candidate-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const providerDispatchReleaseCandidateEnvelopes=listProviderDispatchReleaseCandidateEnvelopes(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchReleaseCandidateEnvelopes(providerDispatchReleaseCandidateEnvelopes), providerDispatchReleaseCandidateEnvelopes }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Release Candidate Envelopes konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const envelope=createProviderDispatchReleaseCandidateEnvelope({ providerDispatchTranscriptEnvelopeId: typeof body.providerDispatchTranscriptEnvelopeId==="string" ? body.providerDispatchTranscriptEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, envelope }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Release Candidate Envelope konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type TranscriptEnvelope={id:string;decision:string;timestamp:string;transcriptMode:string};
type ReleaseCandidateEnvelope={id:string;timestamp:string;decision:string;reason:string;envelopeMode:string;providerDispatchReleaseCandidateEnvelopePrepared:boolean;releaseCandidateEnvelopePrepared:boolean;releaseCandidateEnvelopePersisted:boolean;releaseCandidateReadyForHumanReview:boolean;releaseCandidateApproved:boolean;releaseCandidateExecuted:boolean;releaseCandidateContainsProviderResponse:boolean;releaseCandidateContainsPromptPayload:boolean;releaseCandidateContainsSecrets:boolean;commandEnvelopeExecuted:boolean;executionGateOpen:boolean;finalDispatchAllowed:boolean;networkCallAllowed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchReleaseCandidateEnvelopePage(){
 const [transcripts,setTranscripts]=useState<TranscriptEnvelope[]>([]); const [candidates,setCandidates]=useState<ReleaseCandidateEnvelope[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [tRes,cRes]=await Promise.all([fetch("/api/provider-dispatch-transcript-envelope?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-release-candidate-envelope?limit=100",{cache:"no-store"})]); const t=await tRes.json(); const c=await cRes.json(); if(tRes.ok){ const list=Array.isArray(t.providerDispatchTranscriptEnvelopes)?t.providerDispatchTranscriptEnvelopes:[]; setTranscripts(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!cRes.ok) throw new Error(c?.error||"Release Candidate Envelopes konnten nicht geladen werden."); setCandidates(Array.isArray(c.providerDispatchReleaseCandidateEnvelopes)?c.providerDispatchReleaseCandidateEnvelopes:[]); setSummary(c.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createEnvelope(){ const res=await fetch("/api/provider-dispatch-release-candidate-envelope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchTranscriptEnvelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Release Candidate Envelope fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-release-candidate-envelope" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Release Candidate Envelope</h1><p style={{lineHeight:1.6}}>Phase 40.0 bereitet ein Provider Dispatch Release Candidate Envelope vor. Es ist nur bereit für Human Review, nicht approved und nicht ausgeführt. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Release Candidate Envelope vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{transcripts.map((item)=><option key={item.id} value={item.id}>{item.transcriptMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={createEnvelope} disabled={!selected}>Provider Dispatch Release Candidate Envelope vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Release Candidate Envelopes</h2>{candidates.length===0?<p>Noch keine Release Candidate Envelopes.</p>:candidates.map((item)=><article key={item.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{item.envelopeMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Prepared:</strong> {String(item.providerDispatchReleaseCandidateEnvelopePrepared)} · <strong>Persisted:</strong> {String(item.releaseCandidateEnvelopePersisted)} · <strong>Human review:</strong> {String(item.releaseCandidateReadyForHumanReview)} · <strong>Approved:</strong> {String(item.releaseCandidateApproved)} · <strong>Executed:</strong> {String(item.releaseCandidateExecuted)}</p><p><strong>Provider response:</strong> {String(item.releaseCandidateContainsProviderResponse)} · <strong>Prompt payload:</strong> {String(item.releaseCandidateContainsPromptPayload)} · <strong>Secrets:</strong> {String(item.releaseCandidateContainsSecrets)}</p><p><strong>Command executed:</strong> {String(item.commandEnvelopeExecuted)} · <strong>Gate open:</strong> {String(item.executionGateOpen)} · <strong>Final dispatch allowed:</strong> {String(item.finalDispatchAllowed)} · <strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-release-candidate-envelope')){ console.log("SKIP UnifiedNavigation: Release Candidate Envelope bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-release-candidate-envelope", label: "Dispatch Release Candidate", key: "provider-dispatch-release-candidate-envelope" },'; const markers=['{ href: "/provider-dispatch-transcript-envelope-dashboard", label: "Transcript Dashboard", key: "provider-dispatch-transcript-envelope-dashboard" },','{ href: "/provider-dispatch-transcript-envelope", label: "Dispatch Transcript", key: "provider-dispatch-transcript-envelope" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Release Candidate Link ergänzt."); }
function patchDocs(){ ensureFile("phase40-0-provider-dispatch-release-candidate-envelope.md", `# Phase 40.0 – Controlled Provider Dispatch Release Candidate Envelope / Still No Provider Call\n\n## Ziel\nEin Provider Dispatch Release Candidate Envelope wird vorbereitet und persistiert. Es ist nur bereit für Human Review, nicht approved und nicht ausgeführt. Kein Dispatch und kein Provider-/Netzwerk-Aufruf.\n\n## UI/API\n- UI: /provider-dispatch-release-candidate-envelope\n- API: /api/provider-dispatch-release-candidate-envelope\n\n## Sicherheitsinvarianten\n- providerDispatchReleaseCandidateEnvelopePrepared=true\n- releaseCandidateEnvelopePrepared=true\n- releaseCandidateEnvelopePersisted=true\n- releaseCandidateReadyForHumanReview=true\n- releaseCandidateApproved=false\n- releaseCandidateExecuted=false\n- releaseCandidateContainsProviderResponse=false\n- releaseCandidateContainsPromptPayload=false\n- releaseCandidateContainsSecrets=false\n- transcriptEnvelopeContainsProviderResponse=false\n- transcriptEnvelopeContainsPromptPayload=false\n- transcriptEnvelopeContainsSecrets=false\n- commandEnvelopeExecuted=false\n- executionGateOpen=false\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 40.1 – Provider Dispatch Release Candidate Envelope Policy & Audit\n`); ensureFile("docs/phase40-provider-dispatch-release-candidate-envelope-runbook.md", `# Runbook – Phase 40.0 Provider Dispatch Release Candidate Envelope\n\n## Patch\n\`\`\`powershell\nnpm run phase40:0:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase40:0:verify\nnpm run build\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-release-candidate-envelope-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-release-candidate-envelope/route.ts", api);
ensureFile("frontend/app/provider-dispatch-release-candidate-envelope/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 40.0 Patch abgeschlossen.");
