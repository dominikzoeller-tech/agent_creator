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
  pkg.scripts["phase34:0:patch"]="node scripts/phase34-0-patch-provider-dispatch-token-binding.cjs";
  pkg.scripts["phase34:0:verify"]="node scripts/phase34-0-verify-provider-dispatch-token-binding.cjs";
  pkg.scripts["llm:provider-dispatch-token-binding:verify"]="node scripts/phase34-0-verify-provider-dispatch-token-binding.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 34.0 Scripts eingetragen.");
}

const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchTokenBindingDecision =
  | "provider_dispatch_token_binding_prepared_no_provider_call"
  | "blocked_missing_dispatch_readiness"
  | "blocked_dispatch_not_prepared"
  | "blocked_dispatch_already_performed"
  | "blocked_token_not_active"
  | "blocked_provider_selection_attempt"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_prompt_or_payload_included"
  | "blocked_secret_values_included"
  | "blocked_execution_not_safe";

export interface ProviderDispatchTokenBinding {
  id:string;
  timestamp:string;
  providerDispatchReadinessId?:string;
  tokenActivationGateId?:string;
  decision:ProviderDispatchTokenBindingDecision;
  bindingMode:"controlled_provider_dispatch_token_binding_no_provider_call";
  providerDispatchTokenBindingPrepared:true;
  tokenBoundToDispatch:false;
  tokenBindingActive:false;
  tokenActive:false;
  providerDispatchPrepared:true;
  providerDispatchPerformed:false;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  dispatchPayloadIncluded:false;
  promptPayloadIncluded:false;
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
  reason:string;
  metadata?:Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function readinessPath(): string { return path.join(dataDir(), "provider-dispatch-readiness.jsonl"); }
function activationPath(): string { return path.join(dataDir(), "approval-token-activation-gates.jsonl"); }
function bindingPath(): string { return path.join(dataDir(), "provider-dispatch-token-bindings.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\\r?\\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendBinding(binding:ProviderDispatchTokenBinding): void { ensureStore(); appendFileSync(bindingPath(), JSON.stringify(binding)+"\\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\\s*[:=]\\s*[^\\s,;]+|token\\s*[:=]\\s*[^\\s,;]+|secret\\s*[:=]\\s*[^\\s,;]+|password\\s*[:=]\\s*[^\\s,;]+)/i.test(JSON.stringify(value || {})); }

export function listProviderDispatchTokenBindings(limit=100): ProviderDispatchTokenBinding[] {
  ensureStore();
  return readJsonl(bindingPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}

export function createProviderDispatchTokenBinding(input:{ providerDispatchReadinessId?: string; tokenActivationGateId?: string; metadata?: Record<string, unknown> }): ProviderDispatchTokenBinding {
  ensureStore();
  const readinessItems=readJsonl(readinessPath());
  const activationItems=readJsonl(activationPath());
  const readiness=input.providerDispatchReadinessId ? readinessItems.find((entry:any)=>entry.id===input.providerDispatchReadinessId) : readinessItems[0];
  const activation=input.tokenActivationGateId ? activationItems.find((entry:any)=>entry.id===input.tokenActivationGateId) : activationItems[0];

  let decision:ProviderDispatchTokenBindingDecision="provider_dispatch_token_binding_prepared_no_provider_call";
  let reason="Provider Dispatch Token Binding wurde nur vorbereitet. Token bleibt nicht aktiv gebunden. Kein Provider Dispatch und kein Netzwerkaufruf.";

  if(!readiness){ decision="blocked_missing_dispatch_readiness"; reason="Provider Dispatch Readiness fehlt."; }
  else if(readiness.providerDispatchPrepared!==true){ decision="blocked_dispatch_not_prepared"; reason="Provider Dispatch ist nicht vorbereitet."; }
  else if(readiness.providerDispatchPerformed!==false){ decision="blocked_dispatch_already_performed"; reason="Provider Dispatch wurde bereits ausgeführt oder Status ist nicht false."; }
  else if(activation && activation.tokenActive!==false){ decision="blocked_token_not_active"; reason="Token-Status ist nicht explizit false im No-Provider-Call-Pfad."; }
  else if(readiness.provider!=="none" || readiness.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(readiness.networkCallPerformed!==false || readiness.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(readiness.dispatchPayloadIncluded!==false || readiness.promptPayloadIncluded!==false || readiness.requestBodyIncluded!==false || readiness.sensitiveRequestBodyIncluded!==false){ decision="blocked_prompt_or_payload_included"; reason="Dispatch-, Prompt- oder Request-Payload ist enthalten."; }
  else if(readiness.secretValuesIncluded!==false || readiness.noSecretsIncluded!==true || containsSecretValue(readiness)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(readiness.executionAllowed!==false || readiness.toolExecutionAllowed!==false || readiness.agentExecutionAllowed!==false || readiness.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }

  const binding:ProviderDispatchTokenBinding={
    id:makeId("provider-dispatch-token-binding"),
    timestamp:new Date().toISOString(),
    providerDispatchReadinessId:readiness?.id || input.providerDispatchReadinessId,
    tokenActivationGateId:activation?.id || input.tokenActivationGateId,
    decision,
    bindingMode:"controlled_provider_dispatch_token_binding_no_provider_call",
    providerDispatchTokenBindingPrepared:true,
    tokenBoundToDispatch:false,
    tokenBindingActive:false,
    tokenActive:false,
    providerDispatchPrepared:true,
    providerDispatchPerformed:false,
    metadataOnly:true,
    provider:"none",
    modelSelected:"none",
    dispatchPayloadIncluded:false,
    promptPayloadIncluded:false,
    secretValuesIncluded:false,
    requestBodyIncluded:false,
    sensitiveRequestBodyIncluded:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded:decision!=="blocked_secret_values_included",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"34.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, tokenBoundToDispatch:false, tokenBindingActive:false }
  };

  appendBinding(binding);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:binding.providerDispatchReadinessId, status:binding.decision, riskLevel:"critical", summary:"Provider Dispatch Token Binding: "+binding.decision, metadata:{ source:"phase34.0-provider-dispatch-token-binding", bindingId:binding.id, providerDispatchReadinessId:binding.providerDispatchReadinessId, tokenActivationGateId:binding.tokenActivationGateId, providerDispatchTokenBindingPrepared:true, tokenBoundToDispatch:false, tokenBindingActive:false, tokenActive:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });

  return binding;
}

export function summarizeProviderDispatchTokenBindings(bindings:ProviderDispatchTokenBinding[]){ const byDecision:Record<string,number>={}; for(const binding of bindings){ byDecision[binding.decision]=(byDecision[binding.decision]||0)+1; } return { total:bindings.length, byDecision }; }
`;

const api = `import { createProviderDispatchTokenBinding, listProviderDispatchTokenBindings, summarizeProviderDispatchTokenBindings } from "../../../lib/provider-dispatch-token-binding-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const bindings=listProviderDispatchTokenBindings(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchTokenBindings(bindings), providerDispatchTokenBindings:bindings }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Token Bindings konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const binding=createProviderDispatchTokenBinding({ providerDispatchReadinessId: typeof body.providerDispatchReadinessId==="string" ? body.providerDispatchReadinessId : undefined, tokenActivationGateId: typeof body.tokenActivationGateId==="string" ? body.tokenActivationGateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, binding }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Token Binding konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;

const page = `"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Readiness={id:string;decision:string;timestamp:string};
type Activation={id:string;decision:string;timestamp:string};
type Binding={id:string;timestamp:string;decision:string;reason:string;bindingMode:string;providerDispatchTokenBindingPrepared:boolean;tokenBoundToDispatch:boolean;tokenBindingActive:boolean;tokenActive:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchTokenBindingPage(){
 const [readiness,setReadiness]=useState<Readiness[]>([]); const [activations,setActivations]=useState<Activation[]>([]); const [bindings,setBindings]=useState<Binding[]>([]); const [summary,setSummary]=useState<any>(null); const [selectedReadiness,setSelectedReadiness]=useState(""); const [selectedActivation,setSelectedActivation]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [rRes,aRes,bRes]=await Promise.all([fetch("/api/provider-dispatch-readiness?limit=100",{cache:"no-store"}),fetch("/api/approval-token-activation-gate?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-token-binding?limit=100",{cache:"no-store"})]); const r=await rRes.json(); const a=await aRes.json(); const b=await bRes.json(); if(rRes.ok){ const list=Array.isArray(r.providerDispatchReadiness)?r.providerDispatchReadiness:[]; setReadiness(list); if(!selectedReadiness && list[0]?.id) setSelectedReadiness(list[0].id); } if(aRes.ok){ const list=Array.isArray(a.approvalTokenActivationGates)?a.approvalTokenActivationGates:[]; setActivations(list); if(!selectedActivation && list[0]?.id) setSelectedActivation(list[0].id); } if(!bRes.ok) throw new Error(b?.error||"Bindings konnten nicht geladen werden."); setBindings(Array.isArray(b.providerDispatchTokenBindings)?b.providerDispatchTokenBindings:[]); setSummary(b.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createBinding(){ const res=await fetch("/api/provider-dispatch-token-binding",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchReadinessId:selectedReadiness, tokenActivationGateId:selectedActivation})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Binding fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-token-binding" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Token Binding</h1><p style={{lineHeight:1.6}}>Phase 34.0 bereitet eine Token-Bindung an Provider Dispatch Readiness vor. Token wird nicht aktiv gebunden. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Token Binding vorbereiten</h2><label>Provider Dispatch Readiness</label><select className="text-input" value={selectedReadiness} onChange={(ev)=>setSelectedReadiness(ev.target.value)}>{readiness.map((item)=><option key={item.id} value={item.id}>{item.decision} · {item.id}</option>)}</select><label>Approval Token Activation Gate</label><select className="text-input" value={selectedActivation} onChange={(ev)=>setSelectedActivation(ev.target.value)}>{activations.map((item)=><option key={item.id} value={item.id}>{item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={createBinding} disabled={!selectedReadiness}>Provider Dispatch Token Binding vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Bindings</h2>{bindings.length===0?<p>Noch keine Bindings.</p>:bindings.map((binding)=><article key={binding.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{binding.bindingMode}</strong> <span className="chip">{binding.decision}</span></div><div className="helper-text"><code>{binding.id}</code> · {binding.timestamp}</div><p><strong>Reason:</strong> {binding.reason}</p><p><strong>Prepared:</strong> {String(binding.providerDispatchTokenBindingPrepared)} · <strong>Token bound:</strong> {String(binding.tokenBoundToDispatch)} · <strong>Binding active:</strong> {String(binding.tokenBindingActive)} · <strong>Token active:</strong> {String(binding.tokenActive)}</p><p><strong>Network call:</strong> {String(binding.networkCallPerformed)} · <strong>Provider execution:</strong> {String(binding.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(binding.llmCallPerformed)} · <strong>Dry-run:</strong> {String(binding.dryRunOnly)}</p></article>)}</section></div></main>;
}
`;

function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-token-binding')){ console.log("SKIP UnifiedNavigation: Token Binding bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-token-binding", label: "Dispatch Token Binding", key: "provider-dispatch-token-binding" },'; const markers=['{ href: "/provider-dispatch-readiness-dashboard", label: "Provider Dispatch Dashboard", key: "provider-dispatch-readiness-dashboard" },','{ href: "/provider-dispatch-readiness", label: "Provider Dispatch Readiness", key: "provider-dispatch-readiness" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Token Binding Link ergänzt."); }

function patchDocs(){ ensureFile("phase34-0-provider-dispatch-token-binding.md", `# Phase 34.0 – Controlled Provider Dispatch Token Binding / Still No Provider Call\n\n## Ziel\nProvider Dispatch Readiness wird mit einem Approval Token Activation Gate verbunden, aber der Token wird nicht aktiv gebunden und kein Provider Dispatch wird ausgeführt.\n\n## UI/API\n- UI: /provider-dispatch-token-binding\n- API: /api/provider-dispatch-token-binding\n\n## Sicherheitsinvarianten\n- providerDispatchTokenBindingPrepared=true\n- tokenBoundToDispatch=false\n- tokenBindingActive=false\n- tokenActive=false\n- providerDispatchPrepared=true\n- providerDispatchPerformed=false\n- metadataOnly=true\n- provider=none\n- modelSelected=none\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- executionAllowed=false\n- toolExecutionAllowed=false\n- agentExecutionAllowed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 34.1 – Provider Dispatch Token Binding Policy & Audit\n`); ensureFile("docs/phase34-provider-dispatch-token-binding-runbook.md", `# Runbook – Phase 34.0 Provider Dispatch Token Binding\n\n## Patch\n\`\`\`powershell\nnpm run phase34:0:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase34:0:verify\nnpm run build\n\`\`\`\n`); }

patchPackage();
ensureFile("frontend/lib/provider-dispatch-token-binding-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-token-binding/route.ts", api);
ensureFile("frontend/app/provider-dispatch-token-binding/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 34.0 Patch abgeschlossen.");
