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
  pkg.scripts["phase36:0:patch"]="node scripts/phase36-0-patch-provider-dispatch-execution-gate.cjs";
  pkg.scripts["phase36:0:verify"]="node scripts/phase36-0-verify-provider-dispatch-execution-gate.cjs";
  pkg.scripts["llm:provider-dispatch-execution-gate:verify"]="node scripts/phase36-0-verify-provider-dispatch-execution-gate.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 36.0 Scripts eingetragen.");
}
const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchExecutionGateDecision =
  | "provider_dispatch_execution_gate_prepared_execution_blocked_no_provider_call"
  | "blocked_missing_final_preflight"
  | "blocked_final_preflight_not_prepared"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_token_bound_or_active"
  | "blocked_provider_selection_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchExecutionGate {
  id:string;
  timestamp:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchExecutionGateDecision;
  gateMode:"controlled_provider_dispatch_execution_gate_no_provider_call";
  providerDispatchExecutionGatePrepared:true;
  executionGateOpen:false;
  finalDispatchAllowed:false;
  providerDispatchPerformed:false;
  providerDispatchFinalPreflightPrepared:true;
  tokenBoundToDispatch:false;
  tokenBindingActive:false;
  tokenActive:false;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  dispatchPayloadIncluded:false;
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
function finalPreflightPath(): string { return path.join(dataDir(), "provider-dispatch-final-preflights.jsonl"); }
function gatePath(): string { return path.join(dataDir(), "provider-dispatch-execution-gates.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendGate(gate:ProviderDispatchExecutionGate): void { ensureStore(); appendFileSync(gatePath(), JSON.stringify(gate)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }

export function listProviderDispatchExecutionGates(limit=100): ProviderDispatchExecutionGate[] {
  ensureStore();
  return readJsonl(gatePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}

export function createProviderDispatchExecutionGate(input:{ providerDispatchFinalPreflightId?: string; metadata?: Record<string, unknown> }): ProviderDispatchExecutionGate {
  ensureStore();
  const preflights=readJsonl(finalPreflightPath());
  const preflight=input.providerDispatchFinalPreflightId ? preflights.find((entry:any)=>entry.id===input.providerDispatchFinalPreflightId) : preflights[0];

  let decision:ProviderDispatchExecutionGateDecision="provider_dispatch_execution_gate_prepared_execution_blocked_no_provider_call";
  let reason="Provider Dispatch Execution Gate wurde nur vorbereitet. Execution Gate bleibt geschlossen. Kein Provider-/Netzwerk-Aufruf.";

  if(!preflight){ decision="blocked_missing_final_preflight"; reason="Provider Dispatch Final Preflight fehlt."; }
  else if(preflight.providerDispatchFinalPreflightPrepared!==true){ decision="blocked_final_preflight_not_prepared"; reason="Final Preflight ist nicht vorbereitet."; }
  else if(preflight.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(preflight.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde bereits ausgeführt oder nicht sicher false."; }
  else if(preflight.tokenBoundToDispatch!==false || preflight.tokenBindingActive!==false || preflight.tokenActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden, Binding aktiv oder Token aktiv."; }
  else if(preflight.provider!=="none" || preflight.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(preflight.dispatchPayloadIncluded!==false || preflight.promptPayloadIncluded!==false || preflight.promptIncluded!==false || preflight.requestBodyIncluded!==false || preflight.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Dispatch-/Prompt-Payload oder Request Body ist enthalten."; }
  else if(preflight.secretValuesIncluded!==false || preflight.noSecretsIncluded!==true || containsSecretValue(preflight)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(preflight.networkCallAllowed!==false || preflight.networkCallPerformed!==false || preflight.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(preflight.executionAllowed!==false || preflight.toolExecutionAllowed!==false || preflight.agentExecutionAllowed!==false || preflight.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }

  const gate:ProviderDispatchExecutionGate={
    id:makeId("provider-dispatch-execution-gate"),
    timestamp:new Date().toISOString(),
    providerDispatchFinalPreflightId:preflight?.id || input.providerDispatchFinalPreflightId,
    providerDispatchTokenBindingId:preflight?.providerDispatchTokenBindingId,
    providerDispatchReadinessId:preflight?.providerDispatchReadinessId,
    decision,
    gateMode:"controlled_provider_dispatch_execution_gate_no_provider_call",
    providerDispatchExecutionGatePrepared:true,
    executionGateOpen:false,
    finalDispatchAllowed:false,
    providerDispatchPerformed:false,
    providerDispatchFinalPreflightPrepared:true,
    tokenBoundToDispatch:false,
    tokenBindingActive:false,
    tokenActive:false,
    metadataOnly:true,
    provider:"none",
    modelSelected:"none",
    dispatchPayloadIncluded:false,
    promptPayloadIncluded:false,
    promptIncluded:false,
    secretValuesIncluded:false,
    requestBodyIncluded:false,
    sensitiveRequestBodyIncluded:false,
    networkCallAllowed:false,
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
    metadata:{ ...(input.metadata||{}), phase:"36.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, executionGateOpen:false, finalDispatchAllowed:false }
  };

  appendGate(gate);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:gate.providerDispatchFinalPreflightId, status:gate.decision, riskLevel:"critical", summary:"Provider Dispatch Execution Gate: "+gate.decision, metadata:{ source:"phase36.0-provider-dispatch-execution-gate", gateId:gate.id, providerDispatchFinalPreflightId:gate.providerDispatchFinalPreflightId, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return gate;
}

export function summarizeProviderDispatchExecutionGates(gates:ProviderDispatchExecutionGate[]){ const byDecision:Record<string,number>={}; for(const item of gates){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:gates.length, byDecision }; }
`;
const api=`import { createProviderDispatchExecutionGate, listProviderDispatchExecutionGates, summarizeProviderDispatchExecutionGates } from "../../../lib/provider-dispatch-execution-gate-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const providerDispatchExecutionGates=listProviderDispatchExecutionGates(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchExecutionGates(providerDispatchExecutionGates), providerDispatchExecutionGates }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Execution Gates konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const gate=createProviderDispatchExecutionGate({ providerDispatchFinalPreflightId: typeof body.providerDispatchFinalPreflightId==="string" ? body.providerDispatchFinalPreflightId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, gate }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Execution Gate konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Preflight={id:string;decision:string;timestamp:string;preflightMode:string};
type Gate={id:string;timestamp:string;decision:string;reason:string;gateMode:string;providerDispatchExecutionGatePrepared:boolean;executionGateOpen:boolean;finalDispatchAllowed:boolean;networkCallAllowed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchExecutionGatePage(){
 const [preflights,setPreflights]=useState<Preflight[]>([]); const [gates,setGates]=useState<Gate[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [pRes,gRes]=await Promise.all([fetch("/api/provider-dispatch-final-preflight?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-execution-gate?limit=100",{cache:"no-store"})]); const p=await pRes.json(); const g=await gRes.json(); if(pRes.ok){ const list=Array.isArray(p.providerDispatchFinalPreflights)?p.providerDispatchFinalPreflights:[]; setPreflights(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!gRes.ok) throw new Error(g?.error||"Execution Gates konnten nicht geladen werden."); setGates(Array.isArray(g.providerDispatchExecutionGates)?g.providerDispatchExecutionGates:[]); setSummary(g.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createGate(){ const res=await fetch("/api/provider-dispatch-execution-gate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchFinalPreflightId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Execution Gate fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-execution-gate" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Execution Gate</h1><p style={{lineHeight:1.6}}>Phase 36.0 bereitet das Provider Dispatch Execution Gate vor. Execution Gate bleibt geschlossen. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Execution Gate vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{preflights.map((item)=><option key={item.id} value={item.id}>{item.preflightMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={createGate} disabled={!selected}>Provider Dispatch Execution Gate vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Execution Gates</h2>{gates.length===0?<p>Noch keine Execution Gates.</p>:gates.map((item)=><article key={item.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{item.gateMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Prepared:</strong> {String(item.providerDispatchExecutionGatePrepared)} · <strong>Gate open:</strong> {String(item.executionGateOpen)} · <strong>Final dispatch allowed:</strong> {String(item.finalDispatchAllowed)} · <strong>Network allowed:</strong> {String(item.networkCallAllowed)}</p><p><strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-execution-gate')){ console.log("SKIP UnifiedNavigation: Execution Gate bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-execution-gate", label: "Dispatch Execution Gate", key: "provider-dispatch-execution-gate" },'; const markers=['{ href: "/provider-dispatch-final-preflight-dashboard", label: "Dispatch Final Dashboard", key: "provider-dispatch-final-preflight-dashboard" },','{ href: "/provider-dispatch-final-preflight", label: "Dispatch Final Preflight", key: "provider-dispatch-final-preflight" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Execution Gate Link ergänzt."); }
function patchDocs(){ ensureFile("phase36-0-provider-dispatch-execution-gate.md", `# Phase 36.0 – Controlled Provider Dispatch Execution Gate / Still No Provider Call\n\n## Ziel\nDas Provider Dispatch Execution Gate wird vorbereitet, aber bleibt geschlossen. Kein Dispatch und kein Provider-/Netzwerk-Aufruf.\n\n## UI/API\n- UI: /provider-dispatch-execution-gate\n- API: /api/provider-dispatch-execution-gate\n\n## Sicherheitsinvarianten\n- providerDispatchExecutionGatePrepared=true\n- executionGateOpen=false\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- providerDispatchFinalPreflightPrepared=true\n- tokenBoundToDispatch=false\n- tokenBindingActive=false\n- tokenActive=false\n- metadataOnly=true\n- provider=none\n- modelSelected=none\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- executionAllowed=false\n- toolExecutionAllowed=false\n- agentExecutionAllowed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 36.1 – Provider Dispatch Execution Gate Policy & Audit\n`); ensureFile("docs/phase36-provider-dispatch-execution-gate-runbook.md", `# Runbook – Phase 36.0 Provider Dispatch Execution Gate\n\n## Patch\n\`\`\`powershell\nnpm run phase36:0:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase36:0:verify\nnpm run build\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-execution-gate-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-execution-gate/route.ts", api);
ensureFile("frontend/app/provider-dispatch-execution-gate/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 36.0 Patch abgeschlossen.");
