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
  pkg.scripts["phase32:0:patch"]="node scripts/phase32-0-patch-provider-request-envelope-assembly.cjs";
  pkg.scripts["phase32:0:verify"]="node scripts/phase32-0-verify-provider-request-envelope-assembly.cjs";
  pkg.scripts["llm:provider-request-envelope:verify"]="node scripts/phase32-0-verify-provider-request-envelope-assembly.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 32.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderRequestEnvelopeDecision =
  | "provider_request_envelope_assembled_no_provider_call"
  | "blocked_missing_provider_request_contract"
  | "blocked_contract_not_prepared"
  | "blocked_not_metadata_only"
  | "blocked_prompt_payload_included"
  | "blocked_secret_values_included"
  | "blocked_sensitive_request_body_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderRequestEnvelope {
  id: string;
  timestamp: string;
  providerRequestContractId?: string;
  tokenBackedPreflightId?: string;
  activationGateId?: string;
  issuanceGateId?: string;
  decision: ProviderRequestEnvelopeDecision;
  envelopeMode: "controlled_provider_request_envelope_metadata_only_no_provider_call";
  envelopeChecks: Array<{ name: string; passed: boolean; reason: string }>;
  envelope: {
    provider: "none";
    modelSelected: "none";
    metadataOnly: true;
    envelopeAssembled: true;
    envelopePayloadIncluded: false;
    promptPayloadIncluded: false;
    promptIncluded: false;
    promptRedactedPreviewIncluded: false;
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
  providerRequestEnvelopeAssembled: true;
  providerRequestContractPrepared: true;
  metadataOnly: true;
  provider: "none";
  modelSelected: "none";
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
function contractPath(): string { return path.join(dataDir(), "provider-request-contracts.jsonl"); }
function envelopePath(): string { return path.join(dataDir(), "provider-request-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(item: ProviderRequestEnvelope): void { ensureStore(); appendFileSync(envelopePath(), JSON.stringify(item)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderRequestEnvelopes(limit=100): ProviderRequestEnvelope[] { ensureStore(); return readJsonl(envelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createProviderRequestEnvelope(input:{ providerRequestContractId?: string; metadata?: Record<string, unknown> }): ProviderRequestEnvelope {
  ensureStore();
  const contracts=readJsonl(contractPath());
  const contract=input.providerRequestContractId ? contracts.find((entry:any)=>entry.id===input.providerRequestContractId) : contracts[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"provider_request_contract_exists", passed:Boolean(contract), reason:contract?"Provider Request Contract gefunden.":"Provider Request Contract fehlt." });
  checks.push({ name:"provider_request_contract_prepared", passed:contract?.providerRequestContractPrepared===true, reason:"Provider Request Contract muss vorbereitet sein." });
  checks.push({ name:"contract_metadata_only", passed:contract?.metadataOnly===true, reason:"Contract muss metadata-only bleiben." });
  checks.push({ name:"provider_none", passed:contract?.provider==="none" && contract?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"prompt_payload_not_included", passed:contract?.promptIncluded===false && contract?.promptRedactedPreviewIncluded===false, reason:"Prompt Payload und redacted Preview dürfen nicht enthalten sein." });
  checks.push({ name:"secret_values_not_included", passed:contract?.secretValuesIncluded===false && contract?.noSecretsIncluded===true && !containsSecretValue(contract), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:contract?.requestBodyIncluded===false, reason:"Request Body darf nicht enthalten sein." });
  checks.push({ name:"envelope_payload_not_included", passed:true, reason:"Envelope Payload bleibt in Phase 32.0 nicht enthalten." });
  checks.push({ name:"metadata_only_envelope", passed:true, reason:"Provider Request Envelope bleibt metadata-only." });
  checks.push({ name:"network_provider_blocked", passed:contract?.networkCallPerformed===false && contract?.providerExecutionAllowed===false, reason:"Kein Netzwerk-/Provider-Aufruf." });
  checks.push({ name:"llm_blocked", passed:contract?.realLlmCallAllowed===false && contract?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:contract?.executionAllowed===false && contract?.toolExecutionAllowed===false && contract?.agentExecutionAllowed===false && contract?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderRequestEnvelopeDecision="provider_request_envelope_assembled_no_provider_call";
  let reason="Provider Request Envelope metadata-only assembliert. Kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte, kein sensibler Request Body.";
  if(!contract){ decision="blocked_missing_provider_request_contract"; reason="Provider Request Contract fehlt."; }
  else if(contract.providerRequestContractPrepared!==true){ decision="blocked_contract_not_prepared"; reason="Provider Request Contract ist nicht vorbereitet."; }
  else if(contract.metadataOnly!==true){ decision="blocked_not_metadata_only"; reason="Provider Request Contract ist nicht metadata-only."; }
  else if(contract.promptIncluded!==false || contract.promptRedactedPreviewIncluded!==false){ decision="blocked_prompt_payload_included"; reason="Prompt Payload oder redacted Preview ist enthalten."; }
  else if(contract.secretValuesIncluded!==false || contract.noSecretsIncluded!==true || containsSecretValue(contract)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(contract.requestBodyIncluded!==false){ decision="blocked_sensitive_request_body_included"; reason="Request Body ist enthalten."; }
  else if(contract.provider!=="none" || contract.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(contract.networkCallPerformed!==false || contract.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(contract.executionAllowed!==false || contract.toolExecutionAllowed!==false || contract.agentExecutionAllowed!==false || contract.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const item:ProviderRequestEnvelope={
    id:makeId("provider-request-envelope"), timestamp:new Date().toISOString(), providerRequestContractId:contract?.id||input.providerRequestContractId, tokenBackedPreflightId:contract?.tokenBackedPreflightId, activationGateId:contract?.activationGateId, issuanceGateId:contract?.issuanceGateId, decision,
    envelopeMode:"controlled_provider_request_envelope_metadata_only_no_provider_call", envelopeChecks:checks,
    envelope:{ provider:"none", modelSelected:"none", metadataOnly:true, envelopeAssembled:true, envelopePayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    providerRequestEnvelopeAssembled:true, providerRequestContractPrepared:true, metadataOnly:true, provider:"none", modelSelected:"none", envelopePayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason,
    metadata:{ ...(input.metadata||{}), phase:"32.0", providerRequestEnvelopeOnly:true, metadataOnly:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, noPromptPayload:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendEnvelope(item);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:item.id, status:item.decision, riskLevel:"critical", summary:"Provider Request Envelope assembled: "+item.decision, metadata:{ source:"phase32.0-provider-request-envelope", envelopeId:item.id, providerRequestContractId:item.providerRequestContractId, metadataOnly:true, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, envelopePayloadIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return item;
}
export function summarizeProviderRequestEnvelopes(items:ProviderRequestEnvelope[]){ const byDecision:Record<string,number>={}; for(const item of items){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:items.length, byDecision }; }
`;
const api=String.raw`import { createProviderRequestEnvelope, listProviderRequestEnvelopes, summarizeProviderRequestEnvelopes } from "../../../lib/provider-request-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const providerRequestEnvelopes=listProviderRequestEnvelopes(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderRequestEnvelopes(providerRequestEnvelopes), providerRequestEnvelopes }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Request Envelopes konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const envelope=createProviderRequestEnvelope({ providerRequestContractId: typeof body.providerRequestContractId==="string" ? body.providerRequestContractId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, providerRequestEnvelope:envelope }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Request Envelope konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Contract={id:string;decision:string;timestamp:string;contractMode:string};
type Envelope={id:string;timestamp:string;decision:string;reason:string;envelopeMode:string;envelopeChecks:Array<{name:string;passed:boolean;reason:string}>;providerRequestEnvelopeAssembled:boolean;metadataOnly:boolean;provider:string;modelSelected:string;envelopePayloadIncluded:boolean;promptPayloadIncluded:boolean;promptIncluded:boolean;secretValuesIncluded:boolean;requestBodyIncluded:boolean;sensitiveRequestBodyIncluded:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderRequestEnvelopePage(){
 const [contracts,setContracts]=useState<Contract[]>([]); const [envelopes,setEnvelopes]=useState<Envelope[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [cRes,eRes]=await Promise.all([fetch("/api/provider-request-contract?limit=100",{cache:"no-store"}),fetch("/api/provider-request-envelope?limit=100",{cache:"no-store"})]); const c=await cRes.json(); const e=await eRes.json(); if(cRes.ok){ const list=Array.isArray(c.providerRequestContracts)?c.providerRequestContracts:[]; setContracts(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!eRes.ok) throw new Error(e?.error||"Provider Request Envelopes konnten nicht geladen werden."); setEnvelopes(Array.isArray(e.providerRequestEnvelopes)?e.providerRequestEnvelopes:[]); setSummary(e.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function create(){ const res=await fetch("/api/provider-request-envelope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerRequestContractId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Provider Request Envelope fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-request-envelope" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)",borderColor:"#93c5fd"}}><h1 className="section-title">Provider Request Envelope</h1><p style={{lineHeight:1.6}}>Phase 32.0 assembliert einen metadata-only Provider Request Envelope. Kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte, kein sensibler Request Body.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Request Envelope assemblieren</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{contracts.map((item)=><option key={item.id} value={item.id}>{item.contractMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={create} disabled={!selected}>Provider Request Envelope assemblieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Envelopes</h2>{envelopes.length===0?<p>Noch keine Provider Request Envelopes.</p>:envelopes.map((item)=><article key={item.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{item.envelopeMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Envelope:</strong> {String(item.providerRequestEnvelopeAssembled)} · <strong>Metadata-only:</strong> {String(item.metadataOnly)} · <strong>Provider:</strong> {item.provider} · <strong>Model:</strong> {item.modelSelected}</p><p><strong>Envelope payload:</strong> {String(item.envelopePayloadIncluded)} · <strong>Prompt payload:</strong> {String(item.promptPayloadIncluded)} · <strong>Prompt:</strong> {String(item.promptIncluded)} · <strong>Secrets:</strong> {String(item.secretValuesIncluded)} · <strong>Request body:</strong> {String(item.requestBodyIncluded)} · <strong>Sensitive body:</strong> {String(item.sensitiveRequestBodyIncluded)}</p><p><strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p><ul>{item.envelopeChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-request-envelope"')){ const line='  { href: "/provider-request-envelope", label: "Provider Request Envelope", key: "provider-request-envelope" },'; const marker='{ href: "/provider-request-contract-dashboard", label: "Provider Request Dashboard", key: "provider-request-contract-dashboard" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Request Envelope Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Request Envelope bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase32-0-provider-request-envelope-assembly.md", `# Phase 32.0 – Controlled Provider Request Envelope Assembly / Still No Provider Call

## Ziel
Ein Provider Request Envelope wird metadata-only assembliert. Kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte und kein sensibler Request Body werden eingebettet.

## UI/API
- UI: /provider-request-envelope
- API: /api/provider-request-envelope

## Sicherheitsprinzip
- controlled_provider_request_envelope_metadata_only_no_provider_call
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
Phase 32.1 – Provider Request Envelope Policy & Audit
`);
ensureFile("docs/phase32-provider-request-envelope-assembly-runbook.md", `# Runbook – Phase 32.0 Provider Request Envelope Assembly

## Patch
\`\`\`powershell
npm run phase32:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase32-0-patch-provider-request-envelope-assembly.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase32:0:verify
npm run build
\`\`\`

## Browser-Test
http://localhost:3000/provider-request-envelope
`); }
patchPackage();
ensureFile("frontend/lib/provider-request-envelope-store.ts", store);
ensureFile("frontend/app/api/provider-request-envelope/route.ts", api);
ensureFile("frontend/app/provider-request-envelope/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 32.0 Patch abgeschlossen.");
