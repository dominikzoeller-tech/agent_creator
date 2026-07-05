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
  pkg.scripts["phase37:0:patch"]="node scripts/phase37-0-patch-provider-dispatch-dry-run-command-envelope.cjs";
  pkg.scripts["phase37:0:verify"]="node scripts/phase37-0-verify-provider-dispatch-dry-run-command-envelope.cjs";
  pkg.scripts["llm:provider-dispatch-dry-run-command-envelope:verify"]="node scripts/phase37-0-verify-provider-dispatch-dry-run-command-envelope.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 37.0 Scripts eingetragen.");
}
const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchDryRunCommandEnvelopeDecision =
  | "provider_dispatch_dry_run_command_envelope_prepared_no_provider_call"
  | "blocked_missing_execution_gate"
  | "blocked_execution_gate_not_prepared"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_token_bound_or_active"
  | "blocked_provider_selection_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchDryRunCommandEnvelope {
  id:string;
  timestamp:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchDryRunCommandEnvelopeDecision;
  envelopeMode:"controlled_provider_dispatch_dry_run_command_envelope_no_provider_call";
  providerDispatchDryRunCommandEnvelopePrepared:true;
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
function gatePath(): string { return path.join(dataDir(), "provider-dispatch-execution-gates.jsonl"); }
function envelopePath(): string { return path.join(dataDir(), "provider-dispatch-dry-run-command-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\\r?\\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(envelope:ProviderDispatchDryRunCommandEnvelope): void { ensureStore(); appendFileSync(envelopePath(), JSON.stringify(envelope)+"\\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\\s*[:=]\\s*[^\\s,;]+|token\\s*[:=]\\s*[^\\s,;]+|secret\\s*[:=]\\s*[^\\s,;]+|password\\s*[:=]\\s*[^\\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchDryRunCommandEnvelopes(limit=100): ProviderDispatchDryRunCommandEnvelope[] {
  ensureStore();
  return readJsonl(envelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}
export function createProviderDispatchDryRunCommandEnvelope(input:{ providerDispatchExecutionGateId?: string; metadata?: Record<string, unknown> }): ProviderDispatchDryRunCommandEnvelope {
  ensureStore();
  const gates=readJsonl(gatePath());
  const gate=input.providerDispatchExecutionGateId ? gates.find((entry:any)=>entry.id===input.providerDispatchExecutionGateId) : gates[0];
  let decision:ProviderDispatchDryRunCommandEnvelopeDecision="provider_dispatch_dry_run_command_envelope_prepared_no_provider_call";
  let reason="Provider Dispatch Dry-Run Command Envelope wurde nur vorbereitet. Command Envelope wird nicht ausgeführt. Kein Provider-/Netzwerk-Aufruf.";
  if(!gate){ decision="blocked_missing_execution_gate"; reason="Provider Dispatch Execution Gate fehlt."; }
  else if(gate.providerDispatchExecutionGatePrepared!==true){ decision="blocked_execution_gate_not_prepared"; reason="Execution Gate ist nicht vorbereitet."; }
  else if(gate.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(gate.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(gate.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde bereits ausgeführt oder ist nicht sicher false."; }
  else if(gate.tokenBoundToDispatch!==false || gate.tokenBindingActive!==false || gate.tokenActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden, Binding aktiv oder Token aktiv."; }
  else if(gate.provider!=="none" || gate.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(gate.dispatchPayloadIncluded!==false || gate.promptPayloadIncluded!==false || gate.promptIncluded!==false || gate.requestBodyIncluded!==false || gate.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Dispatch-/Prompt-Payload oder Request Body ist enthalten."; }
  else if(gate.secretValuesIncluded!==false || gate.noSecretsIncluded!==true || containsSecretValue(gate)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(gate.networkCallAllowed!==false || gate.networkCallPerformed!==false || gate.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(gate.executionAllowed!==false || gate.toolExecutionAllowed!==false || gate.agentExecutionAllowed!==false || gate.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const envelope:ProviderDispatchDryRunCommandEnvelope={
    id:makeId("provider-dispatch-dry-run-command-envelope"), timestamp:new Date().toISOString(), providerDispatchExecutionGateId:gate?.id || input.providerDispatchExecutionGateId, providerDispatchFinalPreflightId:gate?.providerDispatchFinalPreflightId, providerDispatchTokenBindingId:gate?.providerDispatchTokenBindingId, providerDispatchReadinessId:gate?.providerDispatchReadinessId, decision, envelopeMode:"controlled_provider_dispatch_dry_run_command_envelope_no_provider_call", providerDispatchDryRunCommandEnvelopePrepared:true, commandEnvelopePrepared:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, commandPayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason, metadata:{ ...(input.metadata||{}), phase:"37.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendEnvelope(envelope);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:envelope.providerDispatchExecutionGateId, status:envelope.decision, riskLevel:"critical", summary:"Provider Dispatch Dry-Run Command Envelope: "+envelope.decision, metadata:{ source:"phase37.0-provider-dispatch-dry-run-command-envelope", envelopeId:envelope.id, providerDispatchExecutionGateId:envelope.providerDispatchExecutionGateId, commandEnvelopeExecuted:false, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return envelope;
}
export function summarizeProviderDispatchDryRunCommandEnvelopes(envelopes:ProviderDispatchDryRunCommandEnvelope[]){ const byDecision:Record<string,number>={}; for(const item of envelopes){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:envelopes.length, byDecision }; }
`;
const api=`import { createProviderDispatchDryRunCommandEnvelope, listProviderDispatchDryRunCommandEnvelopes, summarizeProviderDispatchDryRunCommandEnvelopes } from "../../../lib/provider-dispatch-dry-run-command-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const providerDispatchDryRunCommandEnvelopes=listProviderDispatchDryRunCommandEnvelopes(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchDryRunCommandEnvelopes(providerDispatchDryRunCommandEnvelopes), providerDispatchDryRunCommandEnvelopes }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Dry-Run Command Envelopes konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const envelope=createProviderDispatchDryRunCommandEnvelope({ providerDispatchExecutionGateId: typeof body.providerDispatchExecutionGateId==="string" ? body.providerDispatchExecutionGateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, envelope }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Dry-Run Command Envelope konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Gate={id:string;decision:string;timestamp:string;gateMode:string};
type Envelope={id:string;timestamp:string;decision:string;reason:string;envelopeMode:string;providerDispatchDryRunCommandEnvelopePrepared:boolean;commandEnvelopePrepared:boolean;commandEnvelopeExecuted:boolean;executionGateOpen:boolean;finalDispatchAllowed:boolean;networkCallAllowed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchDryRunCommandEnvelopePage(){
 const [gates,setGates]=useState<Gate[]>([]); const [envelopes,setEnvelopes]=useState<Envelope[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [gRes,eRes]=await Promise.all([fetch("/api/provider-dispatch-execution-gate?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-dry-run-command-envelope?limit=100",{cache:"no-store"})]); const g=await gRes.json(); const e=await eRes.json(); if(gRes.ok){ const list=Array.isArray(g.providerDispatchExecutionGates)?g.providerDispatchExecutionGates:[]; setGates(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!eRes.ok) throw new Error(e?.error||"Dry-Run Command Envelopes konnten nicht geladen werden."); setEnvelopes(Array.isArray(e.providerDispatchDryRunCommandEnvelopes)?e.providerDispatchDryRunCommandEnvelopes:[]); setSummary(e.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createEnvelope(){ const res=await fetch("/api/provider-dispatch-dry-run-command-envelope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchExecutionGateId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Dry-Run Command Envelope fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-dry-run-command-envelope" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Dry-Run Command Envelope</h1><p style={{lineHeight:1.6}}>Phase 37.0 bereitet ein Provider Dispatch Dry-Run Command Envelope vor. Das Command Envelope wird nicht ausgeführt. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Dry-Run Command Envelope vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{gates.map((item)=><option key={item.id} value={item.id}>{item.gateMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={createEnvelope} disabled={!selected}>Provider Dispatch Dry-Run Command Envelope vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Dry-Run Command Envelopes</h2>{envelopes.length===0?<p>Noch keine Dry-Run Command Envelopes.</p>:envelopes.map((item)=><article key={item.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{item.envelopeMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Prepared:</strong> {String(item.providerDispatchDryRunCommandEnvelopePrepared)} · <strong>Command prepared:</strong> {String(item.commandEnvelopePrepared)} · <strong>Command executed:</strong> {String(item.commandEnvelopeExecuted)} · <strong>Gate open:</strong> {String(item.executionGateOpen)}</p><p><strong>Final dispatch allowed:</strong> {String(item.finalDispatchAllowed)} · <strong>Network allowed:</strong> {String(item.networkCallAllowed)} · <strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-dry-run-command-envelope')){ console.log("SKIP UnifiedNavigation: Dry-Run Command Envelope bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-dry-run-command-envelope", label: "Dispatch Dry-Run Command", key: "provider-dispatch-dry-run-command-envelope" },'; const markers=['{ href: "/provider-dispatch-execution-gate-dashboard", label: "Dispatch Execution Dashboard", key: "provider-dispatch-execution-gate-dashboard" },','{ href: "/provider-dispatch-execution-gate", label: "Dispatch Execution Gate", key: "provider-dispatch-execution-gate" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Dry-Run Command Link ergänzt."); }
function patchDocs(){ ensureFile("phase37-0-provider-dispatch-dry-run-command-envelope.md", `# Phase 37.0 – Controlled Provider Dispatch Dry-Run Command Envelope / Still No Provider Call\n\n## Ziel\nEin Provider Dispatch Dry-Run Command Envelope wird vorbereitet, aber nicht ausgeführt. Kein Dispatch und kein Provider-/Netzwerk-Aufruf.\n\n## UI/API\n- UI: /provider-dispatch-dry-run-command-envelope\n- API: /api/provider-dispatch-dry-run-command-envelope\n\n## Sicherheitsinvarianten\n- providerDispatchDryRunCommandEnvelopePrepared=true\n- commandEnvelopePrepared=true\n- commandEnvelopeExecuted=false\n- executionGateOpen=false\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- metadataOnly=true\n- provider=none\n- modelSelected=none\n- commandPayloadIncluded=false\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- executionAllowed=false\n- toolExecutionAllowed=false\n- agentExecutionAllowed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 37.1 – Provider Dispatch Dry-Run Command Envelope Policy & Audit\n`); ensureFile("docs/phase37-provider-dispatch-dry-run-command-envelope-runbook.md", `# Runbook – Phase 37.0 Provider Dispatch Dry-Run Command Envelope\n\n## Patch\n\`\`\`powershell\nnpm run phase37:0:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase37:0:verify\nnpm run build\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-dry-run-command-envelope-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-dry-run-command-envelope/route.ts", api);
ensureFile("frontend/app/provider-dispatch-dry-run-command-envelope/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 37.0 Patch abgeschlossen.");
