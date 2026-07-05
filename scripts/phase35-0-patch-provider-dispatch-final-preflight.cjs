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
  pkg.scripts["phase35:0:patch"]="node scripts/phase35-0-patch-provider-dispatch-final-preflight.cjs";
  pkg.scripts["phase35:0:verify"]="node scripts/phase35-0-verify-provider-dispatch-final-preflight.cjs";
  pkg.scripts["llm:provider-dispatch-final-preflight:verify"]="node scripts/phase35-0-verify-provider-dispatch-final-preflight.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 35.0 Scripts eingetragen.");
}
const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchFinalPreflightDecision =
  | "provider_dispatch_final_preflight_prepared_no_provider_call"
  | "blocked_missing_token_binding"
  | "blocked_token_binding_not_prepared"
  | "blocked_token_bound_or_active"
  | "blocked_dispatch_not_ready"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_execution_not_safe";

export interface ProviderDispatchFinalPreflight {
  id:string;
  timestamp:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchFinalPreflightDecision;
  preflightMode:"controlled_provider_dispatch_final_preflight_no_provider_call";
  providerDispatchFinalPreflightPrepared:true;
  finalDispatchAllowed:false;
  providerDispatchPerformed:false;
  providerDispatchTokenBindingPrepared:true;
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
function tokenBindingPath(): string { return path.join(dataDir(), "provider-dispatch-token-bindings.jsonl"); }
function preflightPath(): string { return path.join(dataDir(), "provider-dispatch-final-preflights.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendPreflight(preflight:ProviderDispatchFinalPreflight): void { ensureStore(); appendFileSync(preflightPath(), JSON.stringify(preflight)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }

export function listProviderDispatchFinalPreflights(limit=100): ProviderDispatchFinalPreflight[] {
  ensureStore();
  return readJsonl(preflightPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}

export function createProviderDispatchFinalPreflight(input:{ providerDispatchTokenBindingId?: string; metadata?: Record<string, unknown> }): ProviderDispatchFinalPreflight {
  ensureStore();
  const bindings=readJsonl(tokenBindingPath());
  const binding=input.providerDispatchTokenBindingId ? bindings.find((entry:any)=>entry.id===input.providerDispatchTokenBindingId) : bindings[0];

  let decision:ProviderDispatchFinalPreflightDecision="provider_dispatch_final_preflight_prepared_no_provider_call";
  let reason="Provider Dispatch Final Preflight wurde nur vorbereitet. Final Dispatch bleibt nicht erlaubt. Kein Provider-/Netzwerk-Aufruf.";

  if(!binding){ decision="blocked_missing_token_binding"; reason="Provider Dispatch Token Binding fehlt."; }
  else if(binding.providerDispatchTokenBindingPrepared!==true){ decision="blocked_token_binding_not_prepared"; reason="Provider Dispatch Token Binding ist nicht vorbereitet."; }
  else if(binding.tokenBoundToDispatch!==false || binding.tokenBindingActive!==false || binding.tokenActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden, Binding aktiv oder Token aktiv."; }
  else if(binding.providerDispatchPrepared!==true){ decision="blocked_dispatch_not_ready"; reason="Provider Dispatch Readiness ist nicht vorbereitet."; }
  else if(binding.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde bereits ausgeführt oder nicht sicher false."; }
  else if(binding.provider!=="none" || binding.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(binding.dispatchPayloadIncluded!==false || binding.promptPayloadIncluded!==false || binding.requestBodyIncluded!==false || binding.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Dispatch-/Prompt-Payload oder Request Body ist enthalten."; }
  else if(binding.secretValuesIncluded!==false || binding.noSecretsIncluded!==true || containsSecretValue(binding)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(binding.networkCallPerformed!==false || binding.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Ausführung erkannt."; }
  else if(binding.executionAllowed!==false || binding.toolExecutionAllowed!==false || binding.agentExecutionAllowed!==false || binding.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }

  const preflight:ProviderDispatchFinalPreflight={
    id:makeId("provider-dispatch-final-preflight"),
    timestamp:new Date().toISOString(),
    providerDispatchTokenBindingId:binding?.id || input.providerDispatchTokenBindingId,
    providerDispatchReadinessId:binding?.providerDispatchReadinessId,
    decision,
    preflightMode:"controlled_provider_dispatch_final_preflight_no_provider_call",
    providerDispatchFinalPreflightPrepared:true,
    finalDispatchAllowed:false,
    providerDispatchPerformed:false,
    providerDispatchTokenBindingPrepared:true,
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
    metadata:{ ...(input.metadata||{}), phase:"35.0", noProviderCall:true, noNetworkCall:true, noDispatch:true, finalDispatchAllowed:false }
  };

  appendPreflight(preflight);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:preflight.providerDispatchTokenBindingId, status:preflight.decision, riskLevel:"critical", summary:"Provider Dispatch Final Preflight: "+preflight.decision, metadata:{ source:"phase35.0-provider-dispatch-final-preflight", preflightId:preflight.id, providerDispatchTokenBindingId:preflight.providerDispatchTokenBindingId, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return preflight;
}

export function summarizeProviderDispatchFinalPreflights(preflights:ProviderDispatchFinalPreflight[]){ const byDecision:Record<string,number>={}; for(const item of preflights){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:preflights.length, byDecision }; }
`;
const api=`import { createProviderDispatchFinalPreflight, listProviderDispatchFinalPreflights, summarizeProviderDispatchFinalPreflights } from "../../../lib/provider-dispatch-final-preflight-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const providerDispatchFinalPreflights=listProviderDispatchFinalPreflights(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchFinalPreflights(providerDispatchFinalPreflights), providerDispatchFinalPreflights }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Final Preflights konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const preflight=createProviderDispatchFinalPreflight({ providerDispatchTokenBindingId: typeof body.providerDispatchTokenBindingId==="string" ? body.providerDispatchTokenBindingId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, preflight }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Final Preflight konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Binding={id:string;decision:string;timestamp:string;bindingMode:string};
type Preflight={id:string;timestamp:string;decision:string;reason:string;preflightMode:string;providerDispatchFinalPreflightPrepared:boolean;finalDispatchAllowed:boolean;networkCallAllowed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchFinalPreflightPage(){
 const [bindings,setBindings]=useState<Binding[]>([]); const [preflights,setPreflights]=useState<Preflight[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [bRes,pRes]=await Promise.all([fetch("/api/provider-dispatch-token-binding?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-final-preflight?limit=100",{cache:"no-store"})]); const b=await bRes.json(); const p=await pRes.json(); if(bRes.ok){ const list=Array.isArray(b.providerDispatchTokenBindings)?b.providerDispatchTokenBindings:[]; setBindings(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!pRes.ok) throw new Error(p?.error||"Final Preflights konnten nicht geladen werden."); setPreflights(Array.isArray(p.providerDispatchFinalPreflights)?p.providerDispatchFinalPreflights:[]); setSummary(p.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function createPreflight(){ const res=await fetch("/api/provider-dispatch-final-preflight",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchTokenBindingId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Final Preflight fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-final-preflight" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Final Preflight</h1><p style={{lineHeight:1.6}}>Phase 35.0 bereitet den finalen Provider Dispatch Preflight vor. Final Dispatch bleibt nicht erlaubt. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Final Preflight vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{bindings.map((item)=><option key={item.id} value={item.id}>{item.bindingMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={createPreflight} disabled={!selected}>Provider Dispatch Final Preflight vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Final Preflights</h2>{preflights.length===0?<p>Noch keine Final Preflights.</p>:preflights.map((item)=><article key={item.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{item.preflightMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Prepared:</strong> {String(item.providerDispatchFinalPreflightPrepared)} · <strong>Final dispatch allowed:</strong> {String(item.finalDispatchAllowed)} · <strong>Network allowed:</strong> {String(item.networkCallAllowed)}</p><p><strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-final-preflight')){ console.log("SKIP UnifiedNavigation: Final Preflight bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-final-preflight", label: "Dispatch Final Preflight", key: "provider-dispatch-final-preflight" },'; const markers=['{ href: "/provider-dispatch-token-binding-dashboard", label: "Dispatch Token Dashboard", key: "provider-dispatch-token-binding-dashboard" },','{ href: "/provider-dispatch-token-binding", label: "Dispatch Token Binding", key: "provider-dispatch-token-binding" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Final Preflight Link ergänzt."); }
function patchDocs(){ ensureFile("phase35-0-provider-dispatch-final-preflight.md", `# Phase 35.0 – Controlled Provider Dispatch Final Preflight / Still No Provider Call\n\n## Ziel\nDer finale Provider Dispatch Preflight wird vorbereitet, ohne Dispatch zu erlauben oder einen Provider-/Netzwerk-Aufruf auszuführen.\n\n## UI/API\n- UI: /provider-dispatch-final-preflight\n- API: /api/provider-dispatch-final-preflight\n\n## Sicherheitsinvarianten\n- providerDispatchFinalPreflightPrepared=true\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- providerDispatchTokenBindingPrepared=true\n- tokenBoundToDispatch=false\n- tokenBindingActive=false\n- tokenActive=false\n- metadataOnly=true\n- provider=none\n- modelSelected=none\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- executionAllowed=false\n- toolExecutionAllowed=false\n- agentExecutionAllowed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 35.1 – Provider Dispatch Final Preflight Policy & Audit\n`); ensureFile("docs/phase35-provider-dispatch-final-preflight-runbook.md", `# Runbook – Phase 35.0 Provider Dispatch Final Preflight\n\n## Patch\n\`\`\`powershell\nnpm run phase35:0:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase35:0:verify\nnpm run build\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-final-preflight-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-final-preflight/route.ts", api);
ensureFile("frontend/app/provider-dispatch-final-preflight/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 35.0 Patch abgeschlossen.");
