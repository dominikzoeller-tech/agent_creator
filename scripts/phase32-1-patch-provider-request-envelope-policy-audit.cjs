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
  pkg.scripts["phase32:1:patch"]="node scripts/phase32-1-patch-provider-request-envelope-policy-audit.cjs";
  pkg.scripts["phase32:1:verify"]="node scripts/phase32-1-verify-provider-request-envelope-policy-audit.cjs";
  pkg.scripts["llm:provider-request-envelope:policy:verify"]="node scripts/phase32-1-verify-provider-request-envelope-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 32.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderRequestEnvelopePolicyDecision =
  | "provider_request_envelope_policy_allowed_metadata_only_no_provider_call"
  | "blocked_missing_provider_request_envelope"
  | "blocked_envelope_not_assembled"
  | "blocked_not_metadata_only"
  | "blocked_envelope_payload_included"
  | "blocked_prompt_payload_included"
  | "blocked_secret_values_included"
  | "blocked_sensitive_request_body_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderRequestEnvelopePolicySimulation {
  id:string;
  timestamp:string;
  providerRequestEnvelopeId?:string;
  providerRequestContractId?:string;
  tokenBackedPreflightId?:string;
  activationGateId?:string;
  decision:ProviderRequestEnvelopePolicyDecision;
  policyMode:"provider_request_envelope_policy_metadata_only_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
  providerRequestEnvelopeAssembled:true;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  envelopePayloadIncluded:false;
  promptPayloadIncluded:false;
  promptIncluded:false;
  promptRedactedPreviewIncluded:false;
  secretValuesIncluded:false;
  requestBodyIncluded:false;
  sensitiveRequestBodyIncluded:false;
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
function envelopePath(): string { return path.join(dataDir(), "provider-request-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-request-envelope-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderRequestEnvelopePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderRequestEnvelopePolicySimulations(limit=100): ProviderRequestEnvelopePolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderRequestEnvelopePolicy(input:{ providerRequestEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderRequestEnvelopePolicySimulation {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const envelope=input.providerRequestEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.providerRequestEnvelopeId) : envelopes[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"envelope_exists", passed:Boolean(envelope), reason:envelope?"Provider Request Envelope gefunden.":"Provider Request Envelope fehlt." });
  checks.push({ name:"envelope_mode_metadata_only_no_provider_call", passed:envelope?.envelopeMode === "controlled_provider_request_envelope_metadata_only_no_provider_call", reason:"Envelope muss metadata-only und no-provider-call bleiben." });
  checks.push({ name:"envelope_assembled", passed:envelope?.providerRequestEnvelopeAssembled===true, reason:"Provider Request Envelope muss assembliert sein." });
  checks.push({ name:"metadata_only", passed:envelope?.metadataOnly===true, reason:"Envelope muss metadata-only bleiben." });
  checks.push({ name:"provider_none", passed:envelope?.provider==="none" && envelope?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"envelope_payload_not_included", passed:envelope?.envelopePayloadIncluded===false, reason:"Envelope Payload darf nicht enthalten sein." });
  checks.push({ name:"prompt_payload_not_included", passed:envelope?.promptPayloadIncluded===false && envelope?.promptIncluded===false && envelope?.promptRedactedPreviewIncluded===false, reason:"Prompt Payload, Prompt und redacted Preview dürfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:envelope?.secretValuesIncluded===false && envelope?.noSecretsIncluded===true && !containsSecretValue(envelope), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:envelope?.requestBodyIncluded===false && envelope?.sensitiveRequestBodyIncluded===false, reason:"Request Body und sensitive Request Body dürfen nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:envelope?.networkCallPerformed===false && envelope?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:envelope?.realLlmCallAllowed===false && envelope?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed===false && envelope?.toolExecutionAllowed===false && envelope?.agentExecutionAllowed===false && envelope?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderRequestEnvelopePolicyDecision="provider_request_envelope_policy_allowed_metadata_only_no_provider_call";
  let reason="Provider Request Envelope Policy erlaubt nur metadata-only Simulation. Kein Provider-/Netzwerk-Aufruf.";
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
  const sim:ProviderRequestEnvelopePolicySimulation={
    id:makeId("provider-request-envelope-policy-sim"), timestamp:new Date().toISOString(), providerRequestEnvelopeId:envelope?.id||input.providerRequestEnvelopeId, providerRequestContractId:envelope?.providerRequestContractId, tokenBackedPreflightId:envelope?.tokenBackedPreflightId, activationGateId:envelope?.activationGateId,
    decision, policyMode:"provider_request_envelope_policy_metadata_only_no_provider_call", policyChecks:checks,
    providerRequestEnvelopeAssembled:true, metadataOnly:true, provider:"none", modelSelected:"none", envelopePayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason,
    metadata:{ ...(input.metadata||{}), phase:"32.1", providerRequestEnvelopePolicyOnly:true, metadataOnly:true, noNetworkCall:true, noProviderCall:true, noPromptPayload:true, noEnvelopePayload:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerRequestEnvelopeId, status:sim.decision, riskLevel:"critical", summary:"Provider Request Envelope Policy Simulation: "+sim.decision, metadata:{ source:"phase32.1-provider-request-envelope-policy", simulationId:sim.id, providerRequestEnvelopeId:sim.providerRequestEnvelopeId, metadataOnly:true, envelopePayloadIncluded:false, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderRequestEnvelopePolicySimulations(sims:ProviderRequestEnvelopePolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=String.raw`import { listProviderRequestEnvelopePolicySimulations, simulateProviderRequestEnvelopePolicy, summarizeProviderRequestEnvelopePolicySimulations } from "../../../lib/provider-request-envelope-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listProviderRequestEnvelopePolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderRequestEnvelopePolicySimulations(simulations), simulations }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Request Envelope Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const simulation=simulateProviderRequestEnvelopePolicy({ providerRequestEnvelopeId: typeof body.providerRequestEnvelopeId==="string" ? body.providerRequestEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Request Envelope Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Envelope={id:string;decision:string;timestamp:string;envelopeMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;policyMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;providerRequestEnvelopeAssembled:boolean;metadataOnly:boolean;provider:string;modelSelected:string;envelopePayloadIncluded:boolean;promptPayloadIncluded:boolean;promptIncluded:boolean;secretValuesIncluded:boolean;requestBodyIncluded:boolean;sensitiveRequestBodyIncluded:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ProviderRequestEnvelopePolicyPage(){
 const [envelopes,setEnvelopes]=useState<Envelope[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [eRes,sRes]=await Promise.all([fetch("/api/provider-request-envelope?limit=100",{cache:"no-store"}),fetch("/api/provider-request-envelope-policy?limit=100",{cache:"no-store"})]); const e=await eRes.json(); const s=await sRes.json(); if(eRes.ok){ const list=Array.isArray(e.providerRequestEnvelopes)?e.providerRequestEnvelopes:[]; setEnvelopes(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/provider-request-envelope-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerRequestEnvelopeId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Policy Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-request-envelope-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#faf5ff 0%,#f8fafc 100%)",borderColor:"#d8b4fe"}}><h1 className="section-title">Provider Request Envelope Policy</h1><p style={{lineHeight:1.6}}>Phase 32.1 simuliert Policy Checks für Provider Request Envelopes. Envelope bleibt metadata-only. Kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte, kein sensibler Request Body.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{envelopes.map((item)=><option key={item.id} value={item.id}>{item.envelopeMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Provider Request Envelope Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0?<p>Noch keine Policy Simulations.</p>:sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.policyMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Assembled:</strong> {String(sim.providerRequestEnvelopeAssembled)} · <strong>Metadata-only:</strong> {String(sim.metadataOnly)} · <strong>Provider:</strong> {sim.provider} · <strong>Model:</strong> {sim.modelSelected}</p><p><strong>Envelope payload:</strong> {String(sim.envelopePayloadIncluded)} · <strong>Prompt payload:</strong> {String(sim.promptPayloadIncluded)} · <strong>Secrets:</strong> {String(sim.secretValuesIncluded)} · <strong>Request body:</strong> {String(sim.requestBodyIncluded)} · <strong>Sensitive body:</strong> {String(sim.sensitiveRequestBodyIncluded)}</p><p><strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-request-envelope-policy"')){ const line='  { href: "/provider-request-envelope-policy", label: "Provider Envelope Policy", key: "provider-request-envelope-policy" },'; const marker='{ href: "/provider-request-envelope", label: "Provider Request Envelope", key: "provider-request-envelope" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Envelope Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Envelope Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase32-1-provider-request-envelope-policy-audit.md", `# Phase 32.1 – Provider Request Envelope Policy & Audit

## Ziel
Provider Request Envelopes werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## UI/API
- UI: /provider-request-envelope-policy
- API: /api/provider-request-envelope-policy

## Sicherheitsprinzip
- provider_request_envelope_policy_metadata_only_no_provider_call
- providerRequestEnvelopeAssembled=true
- metadataOnly=true
- provider=none
- modelSelected=none
- envelopePayloadIncluded=false
- promptPayloadIncluded=false
- promptIncluded=false
- promptRedactedPreviewIncluded=false
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
Phase 32.2 – Provider Request Envelope Dashboard & Smoke
`);
ensureFile("docs/phase32-provider-request-envelope-policy-audit-runbook.md", `# Runbook – Phase 32.1 Provider Request Envelope Policy & Audit

## Patch
\`\`\`powershell
npm run phase32:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase32-1-patch-provider-request-envelope-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase32:1:verify
npm run build
\`\`\`
`); }
patchPackage();
ensureFile("frontend/lib/provider-request-envelope-policy-store.ts", store);
ensureFile("frontend/app/api/provider-request-envelope-policy/route.ts", api);
ensureFile("frontend/app/provider-request-envelope-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 32.1 Patch abgeschlossen.");
