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
  pkg.scripts["phase40:1:patch"]="node scripts/phase40-1-patch-provider-dispatch-release-candidate-envelope-policy-audit.cjs";
  pkg.scripts["phase40:1:verify"]="node scripts/phase40-1-verify-provider-dispatch-release-candidate-envelope-policy-audit.cjs";
  pkg.scripts["llm:provider-dispatch-release-candidate-envelope:policy:verify"]="node scripts/phase40-1-verify-provider-dispatch-release-candidate-envelope-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 40.1 Scripts eingetragen.");
}
const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchReleaseCandidateEnvelopePolicyDecision =
  | "provider_dispatch_release_candidate_envelope_policy_allowed_human_review_only_no_provider_call"
  | "blocked_missing_release_candidate_envelope"
  | "blocked_release_candidate_envelope_not_prepared"
  | "blocked_release_candidate_not_ready_for_human_review"
  | "blocked_release_candidate_approved"
  | "blocked_release_candidate_executed"
  | "blocked_release_candidate_contains_provider_response"
  | "blocked_release_candidate_contains_prompt_payload"
  | "blocked_release_candidate_contains_secrets"
  | "blocked_transcript_contains_provider_response"
  | "blocked_transcript_contains_prompt_payload"
  | "blocked_transcript_contains_secrets"
  | "blocked_command_envelope_executed"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_execution_not_safe";

export interface ProviderDispatchReleaseCandidateEnvelopePolicySimulation {
  id:string;
  timestamp:string;
  providerDispatchReleaseCandidateEnvelopeId?:string;
  providerDispatchTranscriptEnvelopeId?:string;
  providerDispatchDryRunResultEnvelopeId?:string;
  providerDispatchDryRunCommandEnvelopeId?:string;
  providerDispatchExecutionGateId?:string;
  decision:ProviderDispatchReleaseCandidateEnvelopePolicyDecision;
  policyMode:"provider_dispatch_release_candidate_envelope_policy_human_review_only_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
  providerDispatchReleaseCandidateEnvelopePrepared:true;
  releaseCandidateEnvelopePrepared:true;
  releaseCandidateEnvelopePersisted:true;
  releaseCandidateReadyForHumanReview:true;
  releaseCandidateApproved:false;
  releaseCandidateExecuted:false;
  releaseCandidateContainsProviderResponse:false;
  releaseCandidateContainsPromptPayload:false;
  releaseCandidateContainsSecrets:false;
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
  simulated:true;
  reason:string;
  metadata?:Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function releaseCandidateEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-release-candidate-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-release-candidate-envelope-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\\r?\\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderDispatchReleaseCandidateEnvelopePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\\s*[:=]\\s*[^\\s,;]+|token\\s*[:=]\\s*[^\\s,;]+|secret\\s*[:=]\\s*[^\\s,;]+|password\\s*[:=]\\s*[^\\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchReleaseCandidateEnvelopePolicySimulations(limit=100): ProviderDispatchReleaseCandidateEnvelopePolicySimulation[] {
  ensureStore();
  return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function simulateProviderDispatchReleaseCandidateEnvelopePolicy(input:{ providerDispatchReleaseCandidateEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchReleaseCandidateEnvelopePolicySimulation {
  ensureStore();
  const envelopes=readJsonl(releaseCandidateEnvelopePath());
  const envelope=input.providerDispatchReleaseCandidateEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerDispatchReleaseCandidateEnvelopeId) : envelopes[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"release_candidate_exists", passed:Boolean(envelope), reason:envelope?"Release Candidate Envelope gefunden.":"Release Candidate Envelope fehlt." });
  checks.push({ name:"release_candidate_prepared", passed:envelope?.providerDispatchReleaseCandidateEnvelopePrepared===true && envelope?.releaseCandidateEnvelopePrepared===true && envelope?.releaseCandidateEnvelopePersisted===true, reason:"Release Candidate Envelope muss vorbereitet und persistiert sein." });
  checks.push({ name:"human_review_only", passed:envelope?.releaseCandidateReadyForHumanReview===true && envelope?.releaseCandidateApproved===false && envelope?.releaseCandidateExecuted===false, reason:"Release Candidate ist nur Human-Review-ready, nicht approved und nicht ausgeführt." });
  checks.push({ name:"release_candidate_no_provider_response", passed:envelope?.releaseCandidateContainsProviderResponse===false && envelope?.providerResponseIncluded===false && envelope?.providerResultIncluded===false, reason:"Release Candidate darf keine Provider Response und kein Provider Result enthalten." });
  checks.push({ name:"release_candidate_no_prompt_payload", passed:envelope?.releaseCandidateContainsPromptPayload===false && envelope?.promptPayloadIncluded===false && envelope?.promptIncluded===false, reason:"Release Candidate darf keinen Prompt Payload enthalten." });
  checks.push({ name:"release_candidate_no_secrets", passed:envelope?.releaseCandidateContainsSecrets===false && envelope?.secretValuesIncluded===false && envelope?.noSecretsIncluded===true && !containsSecretValue(envelope), reason:"Release Candidate darf keine Secret-Werte enthalten." });
  checks.push({ name:"transcript_clean", passed:envelope?.transcriptEnvelopeContainsProviderResponse===false && envelope?.transcriptEnvelopeContainsPromptPayload===false && envelope?.transcriptEnvelopeContainsSecrets===false, reason:"Transcript bleibt ohne Provider Response, Prompt Payload und Secrets." });
  checks.push({ name:"command_envelope_not_executed", passed:envelope?.commandEnvelopeExecuted===false, reason:"Command Envelope darf nicht ausgeführt sein." });
  checks.push({ name:"execution_gate_closed", passed:envelope?.executionGateOpen===false, reason:"Execution Gate muss geschlossen bleiben." });
  checks.push({ name:"final_dispatch_not_allowed", passed:envelope?.finalDispatchAllowed===false, reason:"Final Dispatch darf nicht erlaubt sein." });
  checks.push({ name:"dispatch_not_performed", passed:envelope?.providerDispatchPerformed===false, reason:"Provider Dispatch darf nicht ausgeführt sein." });
  checks.push({ name:"provider_none", passed:envelope?.provider==="none" && envelope?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"network_provider_blocked", passed:envelope?.networkCallAllowed===false && envelope?.networkCallPerformed===false && envelope?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed===false && envelope?.toolExecutionAllowed===false && envelope?.agentExecutionAllowed===false && envelope?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });

  let decision:ProviderDispatchReleaseCandidateEnvelopePolicyDecision="provider_dispatch_release_candidate_envelope_policy_allowed_human_review_only_no_provider_call";
  let reason="Policy erlaubt nur Human-Review-ready Release Candidate ohne Approval, ohne Execution, ohne Provider-/Netzwerk-Aufruf und ohne Provider Response, Prompt Payload oder Secrets.";
  if(!envelope){ decision="blocked_missing_release_candidate_envelope"; reason="Release Candidate Envelope fehlt."; }
  else if(envelope.providerDispatchReleaseCandidateEnvelopePrepared!==true || envelope.releaseCandidateEnvelopePrepared!==true || envelope.releaseCandidateEnvelopePersisted!==true){ decision="blocked_release_candidate_envelope_not_prepared"; reason="Release Candidate Envelope ist nicht vorbereitet oder nicht persistiert."; }
  else if(envelope.releaseCandidateReadyForHumanReview!==true){ decision="blocked_release_candidate_not_ready_for_human_review"; reason="Release Candidate ist nicht Human-Review-ready."; }
  else if(envelope.releaseCandidateApproved!==false){ decision="blocked_release_candidate_approved"; reason="Release Candidate wurde approved."; }
  else if(envelope.releaseCandidateExecuted!==false){ decision="blocked_release_candidate_executed"; reason="Release Candidate wurde ausgeführt."; }
  else if(envelope.releaseCandidateContainsProviderResponse!==false || envelope.providerResponseIncluded!==false || envelope.providerResultIncluded!==false){ decision="blocked_release_candidate_contains_provider_response"; reason="Release Candidate enthält Provider Response oder Provider Result."; }
  else if(envelope.releaseCandidateContainsPromptPayload!==false || envelope.promptPayloadIncluded!==false || envelope.promptIncluded!==false){ decision="blocked_release_candidate_contains_prompt_payload"; reason="Release Candidate enthält Prompt Payload."; }
  else if(envelope.releaseCandidateContainsSecrets!==false || envelope.secretValuesIncluded!==false || envelope.noSecretsIncluded!==true || containsSecretValue(envelope)){ decision="blocked_release_candidate_contains_secrets"; reason="Release Candidate enthält Secret-Werte."; }
  else if(envelope.transcriptEnvelopeContainsProviderResponse!==false){ decision="blocked_transcript_contains_provider_response"; reason="Transcript enthält Provider Response."; }
  else if(envelope.transcriptEnvelopeContainsPromptPayload!==false){ decision="blocked_transcript_contains_prompt_payload"; reason="Transcript enthält Prompt Payload."; }
  else if(envelope.transcriptEnvelopeContainsSecrets!==false){ decision="blocked_transcript_contains_secrets"; reason="Transcript enthält Secrets."; }
  else if(envelope.commandEnvelopeExecuted!==false){ decision="blocked_command_envelope_executed"; reason="Command Envelope wurde ausgeführt."; }
  else if(envelope.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(envelope.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(envelope.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgeführt."; }
  else if(envelope.provider!=="none" || envelope.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(envelope.networkCallAllowed!==false || envelope.networkCallPerformed!==false || envelope.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(envelope.dispatchPayloadIncluded!==false || envelope.commandPayloadIncluded!==false || envelope.requestBodyIncluded!==false || envelope.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Payload oder Request Body ist enthalten."; }
  else if(envelope.secretValuesIncluded!==false || envelope.noSecretsIncluded!==true || containsSecretValue(envelope)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(envelope.executionAllowed!==false || envelope.toolExecutionAllowed!==false || envelope.agentExecutionAllowed!==false || envelope.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }

  const sim:ProviderDispatchReleaseCandidateEnvelopePolicySimulation={ id:makeId("provider-dispatch-release-candidate-envelope-policy-sim"), timestamp:new Date().toISOString(), providerDispatchReleaseCandidateEnvelopeId:envelope?.id||input.providerDispatchReleaseCandidateEnvelopeId, providerDispatchTranscriptEnvelopeId:envelope?.providerDispatchTranscriptEnvelopeId, providerDispatchDryRunResultEnvelopeId:envelope?.providerDispatchDryRunResultEnvelopeId, providerDispatchDryRunCommandEnvelopeId:envelope?.providerDispatchDryRunCommandEnvelopeId, providerDispatchExecutionGateId:envelope?.providerDispatchExecutionGateId, decision, policyMode:"provider_dispatch_release_candidate_envelope_policy_human_review_only_no_provider_call", policyChecks:checks, providerDispatchReleaseCandidateEnvelopePrepared:true, releaseCandidateEnvelopePrepared:true, releaseCandidateEnvelopePersisted:true, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false, releaseCandidateContainsProviderResponse:false, releaseCandidateContainsPromptPayload:false, releaseCandidateContainsSecrets:false, transcriptEnvelopeContainsProviderResponse:false, transcriptEnvelopeContainsPromptPayload:false, transcriptEnvelopeContainsSecrets:false, resultEnvelopeContainsProviderResponse:false, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, providerResponseIncluded:false, providerResultIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included" && decision!=="blocked_release_candidate_contains_secrets" && decision!=="blocked_transcript_contains_secrets", simulated:true, reason, metadata:{ ...(input.metadata||{}), phase:"40.1", noProviderCall:true, noNetworkCall:true, noDispatch:true, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false } };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerDispatchReleaseCandidateEnvelopeId, status:sim.decision, riskLevel:"critical", summary:"Provider Dispatch Release Candidate Envelope Policy Simulation: "+sim.decision, metadata:{ source:"phase40.1-provider-dispatch-release-candidate-envelope-policy", simulationId:sim.id, providerDispatchReleaseCandidateEnvelopeId:sim.providerDispatchReleaseCandidateEnvelopeId, releaseCandidateReadyForHumanReview:true, releaseCandidateApproved:false, releaseCandidateExecuted:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderDispatchReleaseCandidateEnvelopePolicySimulations(sims:ProviderDispatchReleaseCandidateEnvelopePolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=`import { listProviderDispatchReleaseCandidateEnvelopePolicySimulations, simulateProviderDispatchReleaseCandidateEnvelopePolicy, summarizeProviderDispatchReleaseCandidateEnvelopePolicySimulations } from "../../../lib/provider-dispatch-release-candidate-envelope-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listProviderDispatchReleaseCandidateEnvelopePolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchReleaseCandidateEnvelopePolicySimulations(simulations), simulations }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Release Candidate Envelope Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const simulation=simulateProviderDispatchReleaseCandidateEnvelopePolicy({ providerDispatchReleaseCandidateEnvelopeId: typeof body.providerDispatchReleaseCandidateEnvelopeId==="string" ? body.providerDispatchReleaseCandidateEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Release Candidate Envelope Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Candidate={id:string;decision:string;timestamp:string;envelopeMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;policyMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;providerDispatchReleaseCandidateEnvelopePrepared:boolean;releaseCandidateEnvelopePersisted:boolean;releaseCandidateReadyForHumanReview:boolean;releaseCandidateApproved:boolean;releaseCandidateExecuted:boolean;releaseCandidateContainsProviderResponse:boolean;releaseCandidateContainsPromptPayload:boolean;releaseCandidateContainsSecrets:boolean;commandEnvelopeExecuted:boolean;executionGateOpen:boolean;finalDispatchAllowed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchReleaseCandidateEnvelopePolicyPage(){
 const [candidates,setCandidates]=useState<Candidate[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [cRes,sRes]=await Promise.all([fetch("/api/provider-dispatch-release-candidate-envelope?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-release-candidate-envelope-policy?limit=100",{cache:"no-store"})]); const c=await cRes.json(); const s=await sRes.json(); if(cRes.ok){ const list=Array.isArray(c.providerDispatchReleaseCandidateEnvelopes)?c.providerDispatchReleaseCandidateEnvelopes:[]; setCandidates(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/provider-dispatch-release-candidate-envelope-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchReleaseCandidateEnvelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Policy Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-release-candidate-envelope-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Provider Dispatch Release Candidate Envelope Policy</h1><p style={{lineHeight:1.6}}>Phase 40.1 simuliert Policy Checks für Provider Dispatch Release Candidate Envelopes. Release Candidate bleibt nur Human-Review-ready, nicht approved und nicht ausgeführt. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{candidates.map((item)=><option key={item.id} value={item.id}>{item.envelopeMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Provider Dispatch Release Candidate Envelope Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0?<p>Noch keine Policy Simulations.</p>:sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.policyMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Prepared:</strong> {String(sim.providerDispatchReleaseCandidateEnvelopePrepared)} · <strong>Persisted:</strong> {String(sim.releaseCandidateEnvelopePersisted)} · <strong>Human review:</strong> {String(sim.releaseCandidateReadyForHumanReview)} · <strong>Approved:</strong> {String(sim.releaseCandidateApproved)} · <strong>Executed:</strong> {String(sim.releaseCandidateExecuted)}</p><p><strong>Provider response:</strong> {String(sim.releaseCandidateContainsProviderResponse)} · <strong>Prompt payload:</strong> {String(sim.releaseCandidateContainsPromptPayload)} · <strong>Secrets:</strong> {String(sim.releaseCandidateContainsSecrets)} · <strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-release-candidate-envelope-policy')){ console.log("SKIP UnifiedNavigation: Release Candidate Policy bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-release-candidate-envelope-policy", label: "Dispatch Release Policy", key: "provider-dispatch-release-candidate-envelope-policy" },'; const markers=['{ href: "/provider-dispatch-release-candidate-envelope", label: "Dispatch Release Candidate", key: "provider-dispatch-release-candidate-envelope" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Release Policy Link ergänzt."); }
function patchDocs(){ ensureFile("phase40-1-provider-dispatch-release-candidate-envelope-policy-audit.md", `# Phase 40.1 – Provider Dispatch Release Candidate Envelope Policy & Audit\n\n## Ziel\nProvider Dispatch Release Candidate Envelope wird per Policy Simulation geprüft und als Governance Audit Event protokolliert.\n\n## UI/API\n- UI: /provider-dispatch-release-candidate-envelope-policy\n- API: /api/provider-dispatch-release-candidate-envelope-policy\n\n## Sicherheitsinvarianten\n- providerDispatchReleaseCandidateEnvelopePrepared=true\n- releaseCandidateEnvelopePrepared=true\n- releaseCandidateEnvelopePersisted=true\n- releaseCandidateReadyForHumanReview=true\n- releaseCandidateApproved=false\n- releaseCandidateExecuted=false\n- releaseCandidateContainsProviderResponse=false\n- releaseCandidateContainsPromptPayload=false\n- releaseCandidateContainsSecrets=false\n- transcriptEnvelopeContainsProviderResponse=false\n- transcriptEnvelopeContainsPromptPayload=false\n- transcriptEnvelopeContainsSecrets=false\n- commandEnvelopeExecuted=false\n- executionGateOpen=false\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 40.2 – Provider Dispatch Release Candidate Envelope Dashboard & Smoke\n`); ensureFile("docs/phase40-provider-dispatch-release-candidate-envelope-policy-audit-runbook.md", `# Runbook – Phase 40.1 Provider Dispatch Release Candidate Envelope Policy & Audit\n\n## Patch\n\`\`\`powershell\nnpm run phase40:1:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase40:1:verify\nnpm run build\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-release-candidate-envelope-policy-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-release-candidate-envelope-policy/route.ts", api);
ensureFile("frontend/app/provider-dispatch-release-candidate-envelope-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 40.1 Patch abgeschlossen.");
