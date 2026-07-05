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
  pkg.scripts["phase33:1:patch"]="node scripts/phase33-1-patch-provider-dispatch-readiness-policy-audit.cjs";
  pkg.scripts["phase33:1:verify"]="node scripts/phase33-1-verify-provider-dispatch-readiness-policy-audit.cjs";
  pkg.scripts["llm:provider-dispatch-readiness:policy:verify"]="node scripts/phase33-1-verify-provider-dispatch-readiness-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 33.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchReadinessPolicyDecision =
  | "provider_dispatch_readiness_policy_allowed_metadata_only_no_provider_call"
  | "blocked_missing_provider_dispatch_readiness"
  | "blocked_dispatch_not_prepared"
  | "blocked_dispatch_performed"
  | "blocked_not_metadata_only"
  | "blocked_dispatch_payload_included"
  | "blocked_envelope_payload_included"
  | "blocked_prompt_payload_included"
  | "blocked_secret_values_included"
  | "blocked_sensitive_request_body_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchReadinessPolicySimulation {
  id:string;
  timestamp:string;
  providerDispatchReadinessId?:string;
  providerRequestEnvelopeId?:string;
  providerRequestContractId?:string;
  tokenBackedPreflightId?:string;
  decision:ProviderDispatchReadinessPolicyDecision;
  policyMode:"provider_dispatch_readiness_policy_metadata_only_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
  providerDispatchPrepared:true;
  providerDispatchPerformed:false;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  dispatchPayloadIncluded:false;
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
function readinessPath(): string { return path.join(dataDir(), "provider-dispatch-readiness.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-readiness-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderDispatchReadinessPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchReadinessPolicySimulations(limit=100): ProviderDispatchReadinessPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderDispatchReadinessPolicy(input:{ providerDispatchReadinessId?: string; metadata?: Record<string, unknown> }): ProviderDispatchReadinessPolicySimulation {
  ensureStore();
  const readinessItems=readJsonl(readinessPath());
  const readiness=input.providerDispatchReadinessId ? readinessItems.find((entry:any)=>entry.id===input.providerDispatchReadinessId) : readinessItems[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"readiness_exists", passed:Boolean(readiness), reason:readiness?"Provider Dispatch Readiness gefunden.":"Provider Dispatch Readiness fehlt." });
  checks.push({ name:"readiness_mode_metadata_only_no_provider_call", passed:readiness?.readinessMode === "controlled_provider_dispatch_readiness_metadata_only_no_provider_call", reason:"Readiness muss metadata-only und no-provider-call bleiben." });
  checks.push({ name:"dispatch_prepared", passed:readiness?.providerDispatchPrepared===true, reason:"Provider Dispatch muss nur vorbereitet sein." });
  checks.push({ name:"dispatch_not_performed", passed:readiness?.providerDispatchPerformed===false, reason:"Provider Dispatch darf nicht ausgeführt sein." });
  checks.push({ name:"metadata_only", passed:readiness?.metadataOnly===true, reason:"Dispatch Readiness muss metadata-only bleiben." });
  checks.push({ name:"provider_none", passed:readiness?.provider==="none" && readiness?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"dispatch_payload_not_included", passed:readiness?.dispatchPayloadIncluded===false, reason:"Dispatch Payload darf nicht enthalten sein." });
  checks.push({ name:"envelope_payload_not_included", passed:readiness?.envelopePayloadIncluded===false, reason:"Envelope Payload darf nicht enthalten sein." });
  checks.push({ name:"prompt_payload_not_included", passed:readiness?.promptPayloadIncluded===false && readiness?.promptIncluded===false && readiness?.promptRedactedPreviewIncluded===false, reason:"Prompt Payload, Prompt und redacted Preview dürfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:readiness?.secretValuesIncluded===false && readiness?.noSecretsIncluded===true && !containsSecretValue(readiness), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:readiness?.requestBodyIncluded===false && readiness?.sensitiveRequestBodyIncluded===false, reason:"Request Body und sensitive Request Body dürfen nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:readiness?.networkCallPerformed===false && readiness?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:readiness?.realLlmCallAllowed===false && readiness?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:readiness?.executionAllowed===false && readiness?.toolExecutionAllowed===false && readiness?.agentExecutionAllowed===false && readiness?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderDispatchReadinessPolicyDecision="provider_dispatch_readiness_policy_allowed_metadata_only_no_provider_call";
  let reason="Provider Dispatch Readiness Policy erlaubt nur metadata-only Simulation. Kein Dispatch, kein Provider-/Netzwerk-Aufruf.";
  if(!readiness){ decision="blocked_missing_provider_dispatch_readiness"; reason="Provider Dispatch Readiness fehlt."; }
  else if(readiness.providerDispatchPrepared!==true){ decision="blocked_dispatch_not_prepared"; reason="Provider Dispatch ist nicht vorbereitet."; }
  else if(readiness.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgeführt oder Status ist nicht false."; }
  else if(readiness.metadataOnly!==true){ decision="blocked_not_metadata_only"; reason="Provider Dispatch Readiness ist nicht metadata-only."; }
  else if(readiness.dispatchPayloadIncluded!==false){ decision="blocked_dispatch_payload_included"; reason="Dispatch Payload ist enthalten."; }
  else if(readiness.envelopePayloadIncluded!==false){ decision="blocked_envelope_payload_included"; reason="Envelope Payload ist enthalten."; }
  else if(readiness.promptPayloadIncluded!==false || readiness.promptIncluded!==false || readiness.promptRedactedPreviewIncluded!==false){ decision="blocked_prompt_payload_included"; reason="Prompt Payload, Prompt oder redacted Preview ist enthalten."; }
  else if(readiness.secretValuesIncluded!==false || readiness.noSecretsIncluded!==true || containsSecretValue(readiness)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(readiness.requestBodyIncluded!==false || readiness.sensitiveRequestBodyIncluded!==false){ decision="blocked_sensitive_request_body_included"; reason="Request Body oder sensitive Request Body ist enthalten."; }
  else if(readiness.provider!=="none" || readiness.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(readiness.networkCallPerformed!==false || readiness.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(readiness.executionAllowed!==false || readiness.toolExecutionAllowed!==false || readiness.agentExecutionAllowed!==false || readiness.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ProviderDispatchReadinessPolicySimulation={
    id:makeId("provider-dispatch-readiness-policy-sim"), timestamp:new Date().toISOString(), providerDispatchReadinessId:readiness?.id||input.providerDispatchReadinessId, providerRequestEnvelopeId:readiness?.providerRequestEnvelopeId, providerRequestContractId:readiness?.providerRequestContractId, tokenBackedPreflightId:readiness?.tokenBackedPreflightId,
    decision, policyMode:"provider_dispatch_readiness_policy_metadata_only_no_provider_call", policyChecks:checks,
    providerDispatchPrepared:true, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, envelopePayloadIncluded:false, promptPayloadIncluded:false, promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason,
    metadata:{ ...(input.metadata||{}), phase:"33.1", providerDispatchReadinessPolicyOnly:true, metadataOnly:true, providerDispatchPrepared:true, providerDispatchPerformed:false, noNetworkCall:true, noProviderCall:true, noDispatch:true, noPromptPayload:true, noDispatchPayload:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerDispatchReadinessId, status:sim.decision, riskLevel:"critical", summary:"Provider Dispatch Readiness Policy Simulation: "+sim.decision, metadata:{ source:"phase33.1-provider-dispatch-readiness-policy", simulationId:sim.id, providerDispatchReadinessId:sim.providerDispatchReadinessId, providerDispatchPrepared:true, providerDispatchPerformed:false, metadataOnly:true, dispatchPayloadIncluded:false, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderDispatchReadinessPolicySimulations(sims:ProviderDispatchReadinessPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=String.raw`import { listProviderDispatchReadinessPolicySimulations, simulateProviderDispatchReadinessPolicy, summarizeProviderDispatchReadinessPolicySimulations } from "../../../lib/provider-dispatch-readiness-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listProviderDispatchReadinessPolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchReadinessPolicySimulations(simulations), simulations }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Readiness Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const simulation=simulateProviderDispatchReadinessPolicy({ providerDispatchReadinessId: typeof body.providerDispatchReadinessId==="string" ? body.providerDispatchReadinessId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Readiness Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Readiness={id:string;decision:string;timestamp:string;readinessMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;policyMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;providerDispatchPrepared:boolean;providerDispatchPerformed:boolean;metadataOnly:boolean;provider:string;modelSelected:string;dispatchPayloadIncluded:boolean;envelopePayloadIncluded:boolean;promptPayloadIncluded:boolean;secretValuesIncluded:boolean;requestBodyIncluded:boolean;sensitiveRequestBodyIncluded:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ProviderDispatchReadinessPolicyPage(){
 const [readiness,setReadiness]=useState<Readiness[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [rRes,sRes]=await Promise.all([fetch("/api/provider-dispatch-readiness?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-readiness-policy?limit=100",{cache:"no-store"})]); const r=await rRes.json(); const s=await sRes.json(); if(rRes.ok){ const list=Array.isArray(r.providerDispatchReadiness)?r.providerDispatchReadiness:[]; setReadiness(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/provider-dispatch-readiness-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchReadinessId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Policy Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-readiness-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Provider Dispatch Readiness Policy</h1><p style={{lineHeight:1.6}}>Phase 33.1 simuliert Policy Checks für Provider Dispatch Readiness. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte, kein sensibler Request Body.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{readiness.map((item)=><option key={item.id} value={item.id}>{item.readinessMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Provider Dispatch Readiness Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0?<p>Noch keine Policy Simulations.</p>:sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.policyMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Prepared:</strong> {String(sim.providerDispatchPrepared)} · <strong>Dispatch performed:</strong> {String(sim.providerDispatchPerformed)} · <strong>Metadata-only:</strong> {String(sim.metadataOnly)} · <strong>Provider:</strong> {sim.provider} · <strong>Model:</strong> {sim.modelSelected}</p><p><strong>Dispatch payload:</strong> {String(sim.dispatchPayloadIncluded)} · <strong>Envelope payload:</strong> {String(sim.envelopePayloadIncluded)} · <strong>Prompt payload:</strong> {String(sim.promptPayloadIncluded)} · <strong>Secrets:</strong> {String(sim.secretValuesIncluded)} · <strong>Request body:</strong> {String(sim.requestBodyIncluded)} · <strong>Sensitive body:</strong> {String(sim.sensitiveRequestBodyIncluded)}</p><p><strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-dispatch-readiness-policy"')){ const line='  { href: "/provider-dispatch-readiness-policy", label: "Provider Dispatch Policy", key: "provider-dispatch-readiness-policy" },'; const marker='{ href: "/provider-dispatch-readiness", label: "Provider Dispatch Readiness", key: "provider-dispatch-readiness" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Dispatch Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Dispatch Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase33-1-provider-dispatch-readiness-policy-audit.md", `# Phase 33.1 – Provider Dispatch Readiness Policy & Audit

## Ziel
Provider Dispatch Readiness wird per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## UI/API
- UI: /provider-dispatch-readiness-policy
- API: /api/provider-dispatch-readiness-policy

## Sicherheitsprinzip
- provider_dispatch_readiness_policy_metadata_only_no_provider_call
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
Phase 33.2 – Provider Dispatch Readiness Dashboard & Smoke
`);
ensureFile("docs/phase33-provider-dispatch-readiness-policy-audit-runbook.md", `# Runbook – Phase 33.1 Provider Dispatch Readiness Policy & Audit

## Patch
\`\`\`powershell
npm run phase33:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase33-1-patch-provider-dispatch-readiness-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase33:1:verify
npm run build
\`\`\`
`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-readiness-policy-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-readiness-policy/route.ts", api);
ensureFile("frontend/app/provider-dispatch-readiness-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 33.1 Patch abgeschlossen.");
