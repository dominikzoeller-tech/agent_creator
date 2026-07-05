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
  pkg.scripts["phase38:0:patch"]="node scripts/phase38-0-patch-provider-dispatch-dry-run-result-envelope.cjs";
  pkg.scripts["phase38:0:verify"]="node scripts/phase38-0-verify-provider-dispatch-dry-run-result-envelope.cjs";
  pkg.scripts["llm:provider-dispatch-dry-run-result-envelope:verify"]="node scripts/phase38-0-verify-provider-dispatch-dry-run-result-envelope.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 38.0 Scripts eingetragen.");
}
const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchDryRunResultEnvelopeDecision =
  | "provider_dispatch_dry_run_result_envelope_prepared_no_provider_call"
  | "blocked_missing_dry_run_command_envelope"
  | "blocked_dry_run_command_envelope_not_prepared"
  | "blocked_command_envelope_executed"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchDryRunResultEnvelope {
  id:string;
  timestamp:string;
  providerDispatchDryRunCommandEnvelopeId?:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchDryRunResultEnvelopeDecision;
  envelopeMode:"controlled_provider_dispatch_dry_run_result_envelope_no_provider_call";
  providerDispatchDryRunResultEnvelopePrepared:true;
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
function commandEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-dry-run-command-envelopes.jsonl"); }
function resultEnvelopePath(): string { return path.join(dataDir(), "provider-dispatch-dry-run-result-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(envelope:ProviderDispatchDryRunResultEnvelope): void { ensureStore(); appendFileSync(resultEnvelopePath(), JSON.stringify(envelope)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchDryRunResultEnvelopes(limit=100): ProviderDispatchDryRunResultEnvelope[] {
  ensureStore();
  return readJsonl(resultEnvelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function createProviderDispatchDryRunResultEnvelope(input:{ providerDispatchDryRunCommandEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchDryRunResultEnvelope {
  ensureStore();
  const envelopes=readJsonl(commandEnvelopePath());
  const commandEnvelope=input.providerDispatchDryRunCommandEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerDispatchDryRunCommandEnvelopeId) : envelopes[0];
  let decision:ProviderDispatchDryRunResultEnvelopeDecision="provider_dispatch_dry_run_result_envelope_prepared_no_provider_call";
  let reason="Provider Dispatch Dry-Run Result Envelope wurde nur vorbereitet. Es enthält keine Provider Response. Kein Provider-/Netzwerk-Aufruf.";
  if(!commandEnvelope){ decision="blocked_missing_dry_run_command_envelope"; reason="Provider Dispatch Dry-Run Command Envelope fehlt."; }
  else if(commandEnvelope.providerDispatchDryRunCommandEnvelopePrepared!==true || commandEnvelope.commandEnvelopePrepared!==true){ decision="blocked_dry_run_command_envelope_not_prepared"; reason="Dry-Run Command Envelope ist nicht vorbereitet."; }
  else if(commandEnvelope.commandEnvelopeExecuted!==false){ decision="blocked_command_envelope_executed"; reason="Command Envelope wurde ausgeführt."; }
  else if(commandEnvelope.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(commandEnvelope.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(commandEnvelope.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde bereits ausgeführt oder ist nicht sicher false."; }
  else if(commandEnvelope.provider!=="none" || commandEnvelope.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(commandEnvelope.dispatchPayloadIncluded!==false || commandEnvelope.commandPayloadIncluded!==false || commandEnvelope.promptPayloadIncluded!==false || commandEnvelope.promptIncluded!==false || commandEnvelope.requestBodyIncluded!==false || commandEnvelope.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Dispatch-/Command-/Prompt-Payload oder Request Body ist enthalten."; }
  else if(commandEnvelope.secretValuesIncluded!==false || commandEnvelope.noSecretsIncluded!==true || containsSecretValue(commandEnvelope)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(commandEnvelope.networkCallAllowed!==false || commandEnvelope.networkCallPerformed!==false || commandEnvelope.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(commandEnvelope.executionAllowed!==false || commandEnvelope.toolExecutionAllowed!==false || commandEnvelope.agentExecutionAllowed!==false || commandEnvelope.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const envelope:ProviderDispatchDryRunResultEnvelope={
    id:makeId("provider-dispatch-dry-run-result-envelope"), timestamp:new Date().toISOString(), providerDispatchDryRunCommandEnvelopeId:commandEnvelope?.id || input.providerDispatchDryRunCommandEnvelopeId, providerDispatchExecutionGateId:commandEnvelope?.providerDispatchExecutionGateId, providerDispatchFinalPreflightId:commandEnvelope?.providerDispatchFinalPreflightId, providerDispatchTokenBindingId:commandEnvelope?.providerDispatchTokenBindingId, providerDispatchReadinessId:commandEnvelope?.providerDispatchReadinessId, decision, envelopeMode:"controlled_provider_dispatch_dry_run_result_envelope_no_provider_call", providerDispatchDryRunResultEnvelopePrepared:true, resultEnvelopePrepared:true, resultEnvelopePersisted:true, resultEnvelopeContainsProviderResponse:false, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, providerResponseIncluded:false, providerResultIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason, metadata:{ ...(input.metadata||{}), phase:"38.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, commandEnvelopeExecuted:false, resultEnvelopeContainsProviderResponse:false, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendEnvelope(envelope);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:envelope.providerDispatchDryRunCommandEnvelopeId, status:envelope.decision, riskLevel:"critical", summary:"Provider Dispatch Dry-Run Result Envelope: "+envelope.decision, metadata:{ source:"phase38.0-provider-dispatch-dry-run-result-envelope", envelopeId:envelope.id, providerDispatchDryRunCommandEnvelopeId:envelope.providerDispatchDryRunCommandEnvelopeId, resultEnvelopeContainsProviderResponse:false, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return envelope;
}
export function summarizeProviderDispatchDryRunResultEnvelopes(envelopes:ProviderDispatchDryRunResultEnvelope[]){ const byDecision:Record<string,number>={}; for(const item of envelopes){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:envelopes.length, byDecision }; }
`;
const api=`import { createProviderDispatchDryRunResultEnvelope, listProviderDispatchDryRunResultEnvelopes, summarizeProviderDispatchDryRunResultEnvelopes } from "../../../lib/provider-dispatch-dry-run-result-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const providerDispatchDryRunResultEnvelopes=listProviderDispatchDryRunResultEnvelopes(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchDryRunResultEnvelopes(providerDispatchDryRunResultEnvelopes), providerDispatchDryRunResultEnvelopes }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Dry-Run Result Envelopes konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const envelope=createProviderDispatchDryRunResultEnvelope({ providerDispatchDryRunCommandEnvelopeId: typeof body.providerDispatchDryRunCommandEnvelopeId==="string" ? body.providerDispatchDryRunCommandEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, envelope }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Dry-Run Result Envelope konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type CommandEnvelope={id:string;decision:string;timestamp:string;envelopeMode:string};
type ResultEnvelope={id:string;timestamp:string;decision:string;reason:string;envelopeMode:string;providerDispatchDryRunResultEnvelopePrepared:boolean;resultEnvelopePrepared:boolean;resultEnvelopePersisted:boolean;resultEnvelopeContainsProviderResponse:boolean;commandEnvelopeExecuted:boolean;executionGateOpen:boolean;finalDispatchAllowed:boolean;networkCallAllowed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchDryRunResultEnvelopePage(){
 const [commandEnvelopes,setCommandEnvelopes]=useState<CommandEnvelope[]>([]); const [resultEnvelopes,setResultEnvelopes]=useState<ResultEnvelope[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [cRes,rRes]=await Promise.all([fetch("/api/provider-dispatch-dry-run-command-envelope?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-dry-run-result-envelope?limit=100",{cache:"no-store"})]); const c=await cRes.json(); const r=await rRes.json(); if(cRes.ok){ const list=Array.isArray(c.providerDispatchDryRunCommandEnvelopes)?c.providerDispatchDryRunCommandEnvelopes:[]; setCommandEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!rRes.ok) throw new Error(r?.error||"Dry-Run Result Envelopes konnten nicht geladen werden."); setResultEnvelopes(Array.isArray(r.providerDispatchDryRunResultEnvelopes)?r.providerDispatchDryRunResultEnvelopes:[]); setSummary(r.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createEnvelope(){ const res=await fetch("/api/provider-dispatch-dry-run-result-envelope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchDryRunCommandEnvelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Dry-Run Result Envelope fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-dry-run-result-envelope" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Dry-Run Result Envelope</h1><p style={{lineHeight:1.6}}>Phase 38.0 bereitet ein Provider Dispatch Dry-Run Result Envelope vor. Das Result Envelope enthält keine Provider Response. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Dry-Run Result Envelope vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{commandEnvelopes.map((item)=><option key={item.id} value={item.id}>{item.envelopeMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={createEnvelope} disabled={!selected}>Provider Dispatch Dry-Run Result Envelope vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Dry-Run Result Envelopes</h2>{resultEnvelopes.length===0?<p>Noch keine Dry-Run Result Envelopes.</p>:resultEnvelopes.map((item)=><article key={item.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{item.envelopeMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Prepared:</strong> {String(item.providerDispatchDryRunResultEnvelopePrepared)} · <strong>Persisted:</strong> {String(item.resultEnvelopePersisted)} · <strong>Contains provider response:</strong> {String(item.resultEnvelopeContainsProviderResponse)} · <strong>Command executed:</strong> {String(item.commandEnvelopeExecuted)}</p><p><strong>Gate open:</strong> {String(item.executionGateOpen)} · <strong>Final dispatch allowed:</strong> {String(item.finalDispatchAllowed)} · <strong>Network allowed:</strong> {String(item.networkCallAllowed)} · <strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-dry-run-result-envelope')){ console.log("SKIP UnifiedNavigation: Dry-Run Result Envelope bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-dry-run-result-envelope", label: "Dispatch Dry-Run Result", key: "provider-dispatch-dry-run-result-envelope" },'; const markers=['{ href: "/provider-dispatch-dry-run-command-envelope-dashboard", label: "Dispatch Dry-Run Dashboard", key: "provider-dispatch-dry-run-command-envelope-dashboard" },','{ href: "/provider-dispatch-dry-run-command-envelope", label: "Dispatch Dry-Run Command", key: "provider-dispatch-dry-run-command-envelope" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Dry-Run Result Link ergänzt."); }
function patchDocs(){ ensureFile("phase38-0-provider-dispatch-dry-run-result-envelope.md", `# Phase 38.0 – Controlled Provider Dispatch Dry-Run Result Envelope / Still No Provider Call\n\n## Ziel\nEin Provider Dispatch Dry-Run Result Envelope wird vorbereitet und persistiert, enthält aber keine Provider Response. Kein Dispatch und kein Provider-/Netzwerk-Aufruf.\n\n## UI/API\n- UI: /provider-dispatch-dry-run-result-envelope\n- API: /api/provider-dispatch-dry-run-result-envelope\n\n## Sicherheitsinvarianten\n- providerDispatchDryRunResultEnvelopePrepared=true\n- resultEnvelopePrepared=true\n- resultEnvelopePersisted=true\n- resultEnvelopeContainsProviderResponse=false\n- commandEnvelopeExecuted=false\n- executionGateOpen=false\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- metadataOnly=true\n- provider=none\n- modelSelected=none\n- providerResponseIncluded=false\n- providerResultIncluded=false\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- executionAllowed=false\n- toolExecutionAllowed=false\n- agentExecutionAllowed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 38.1 – Provider Dispatch Dry-Run Result Envelope Policy & Audit\n`); ensureFile("docs/phase38-provider-dispatch-dry-run-result-envelope-runbook.md", `# Runbook – Phase 38.0 Provider Dispatch Dry-Run Result Envelope\n\n## Patch\n\`\`\`powershell\nnpm run phase38:0:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase38:0:verify\nnpm run build\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-dry-run-result-envelope-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-dry-run-result-envelope/route.ts", api);
ensureFile("frontend/app/provider-dispatch-dry-run-result-envelope/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 38.0 Patch abgeschlossen.");
