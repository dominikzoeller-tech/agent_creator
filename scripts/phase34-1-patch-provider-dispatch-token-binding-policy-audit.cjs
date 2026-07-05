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
  pkg.scripts["phase34:1:patch"]="node scripts/phase34-1-patch-provider-dispatch-token-binding-policy-audit.cjs";
  pkg.scripts["phase34:1:verify"]="node scripts/phase34-1-verify-provider-dispatch-token-binding-policy-audit.cjs";
  pkg.scripts["llm:provider-dispatch-token-binding:policy:verify"]="node scripts/phase34-1-verify-provider-dispatch-token-binding-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 34.1 Scripts eingetragen.");
}
const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchTokenBindingPolicyDecision =
  | "provider_dispatch_token_binding_policy_allowed_no_provider_call"
  | "blocked_missing_token_binding"
  | "blocked_binding_not_prepared"
  | "blocked_token_bound_or_active"
  | "blocked_token_active"
  | "blocked_dispatch_performed"
  | "blocked_provider_selection_attempt"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_prompt_or_payload_included"
  | "blocked_secret_values_included"
  | "blocked_execution_not_safe";

export interface ProviderDispatchTokenBindingPolicySimulation {
  id:string;
  timestamp:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  tokenActivationGateId?:string;
  decision:ProviderDispatchTokenBindingPolicyDecision;
  policyMode:"provider_dispatch_token_binding_policy_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
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
  simulated:true;
  reason:string;
  metadata?:Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function bindingPath(): string { return path.join(dataDir(), "provider-dispatch-token-bindings.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-token-binding-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderDispatchTokenBindingPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderDispatchTokenBindingPolicySimulations(limit=100): ProviderDispatchTokenBindingPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderDispatchTokenBindingPolicy(input:{ providerDispatchTokenBindingId?: string; metadata?: Record<string, unknown> }): ProviderDispatchTokenBindingPolicySimulation {
  ensureStore();
  const bindings=readJsonl(bindingPath());
  const binding=input.providerDispatchTokenBindingId ? bindings.find((entry:any)=>entry.id===input.providerDispatchTokenBindingId) : bindings[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"binding_exists", passed:Boolean(binding), reason:binding?"Provider Dispatch Token Binding gefunden.":"Provider Dispatch Token Binding fehlt." });
  checks.push({ name:"binding_prepared", passed:binding?.providerDispatchTokenBindingPrepared===true, reason:"Token Binding muss nur vorbereitet sein." });
  checks.push({ name:"token_not_bound_or_active", passed:binding?.tokenBoundToDispatch===false && binding?.tokenBindingActive===false && binding?.tokenActive===false, reason:"Token darf nicht aktiv gebunden sein." });
  checks.push({ name:"dispatch_not_performed", passed:binding?.providerDispatchPerformed===false, reason:"Provider Dispatch darf nicht ausgeführt sein." });
  checks.push({ name:"metadata_only", passed:binding?.metadataOnly===true, reason:"Binding bleibt metadata-only." });
  checks.push({ name:"provider_none", passed:binding?.provider==="none" && binding?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"payloads_not_included", passed:binding?.dispatchPayloadIncluded===false && binding?.promptPayloadIncluded===false && binding?.requestBodyIncluded===false && binding?.sensitiveRequestBodyIncluded===false, reason:"Dispatch-, Prompt- und Request-Payloads dürfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:binding?.secretValuesIncluded===false && binding?.noSecretsIncluded===true && !containsSecretValue(binding), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:binding?.networkCallPerformed===false && binding?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:binding?.realLlmCallAllowed===false && binding?.llmCallPerformed===false, reason:"LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:binding?.executionAllowed===false && binding?.toolExecutionAllowed===false && binding?.agentExecutionAllowed===false && binding?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderDispatchTokenBindingPolicyDecision="provider_dispatch_token_binding_policy_allowed_no_provider_call";
  let reason="Provider Dispatch Token Binding Policy erlaubt nur no-provider-call Simulation. Token bleibt nicht aktiv gebunden.";
  if(!binding){ decision="blocked_missing_token_binding"; reason="Provider Dispatch Token Binding fehlt."; }
  else if(binding.providerDispatchTokenBindingPrepared!==true){ decision="blocked_binding_not_prepared"; reason="Provider Dispatch Token Binding ist nicht vorbereitet."; }
  else if(binding.tokenBoundToDispatch!==false || binding.tokenBindingActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden oder Binding aktiv."; }
  else if(binding.tokenActive!==false){ decision="blocked_token_active"; reason="Token ist aktiv."; }
  else if(binding.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgeführt."; }
  else if(binding.provider!=="none" || binding.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(binding.networkCallPerformed!==false || binding.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(binding.dispatchPayloadIncluded!==false || binding.promptPayloadIncluded!==false || binding.requestBodyIncluded!==false || binding.sensitiveRequestBodyIncluded!==false){ decision="blocked_prompt_or_payload_included"; reason="Payload oder Request Body ist enthalten."; }
  else if(binding.secretValuesIncluded!==false || binding.noSecretsIncluded!==true || containsSecretValue(binding)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(binding.executionAllowed!==false || binding.toolExecutionAllowed!==false || binding.agentExecutionAllowed!==false || binding.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ProviderDispatchTokenBindingPolicySimulation={ id:makeId("provider-dispatch-token-binding-policy-sim"), timestamp:new Date().toISOString(), providerDispatchTokenBindingId:binding?.id||input.providerDispatchTokenBindingId, providerDispatchReadinessId:binding?.providerDispatchReadinessId, tokenActivationGateId:binding?.tokenActivationGateId, decision, policyMode:"provider_dispatch_token_binding_policy_no_provider_call", policyChecks:checks, providerDispatchTokenBindingPrepared:true, tokenBoundToDispatch:false, tokenBindingActive:false, tokenActive:false, providerDispatchPrepared:true, providerDispatchPerformed:false, metadataOnly:true, provider:"none", modelSelected:"none", dispatchPayloadIncluded:false, promptPayloadIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, sensitiveRequestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason, metadata:{ ...(input.metadata||{}), phase:"34.1", noProviderCall:true, noNetworkCall:true, noDispatch:true, tokenBoundToDispatch:false, tokenBindingActive:false, tokenActive:false } };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerDispatchTokenBindingId, status:sim.decision, riskLevel:"critical", summary:"Provider Dispatch Token Binding Policy Simulation: "+sim.decision, metadata:{ source:"phase34.1-provider-dispatch-token-binding-policy", simulationId:sim.id, providerDispatchTokenBindingId:sim.providerDispatchTokenBindingId, tokenBoundToDispatch:false, tokenBindingActive:false, tokenActive:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderDispatchTokenBindingPolicySimulations(sims:ProviderDispatchTokenBindingPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api = `import { listProviderDispatchTokenBindingPolicySimulations, simulateProviderDispatchTokenBindingPolicy, summarizeProviderDispatchTokenBindingPolicySimulations } from "../../../lib/provider-dispatch-token-binding-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listProviderDispatchTokenBindingPolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchTokenBindingPolicySimulations(simulations), simulations }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Token Binding Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const simulation=simulateProviderDispatchTokenBindingPolicy({ providerDispatchTokenBindingId: typeof body.providerDispatchTokenBindingId==="string" ? body.providerDispatchTokenBindingId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Token Binding Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page = `"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Binding={id:string;decision:string;timestamp:string;bindingMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;policyMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;providerDispatchTokenBindingPrepared:boolean;tokenBoundToDispatch:boolean;tokenBindingActive:boolean;tokenActive:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchTokenBindingPolicyPage(){
 const [bindings,setBindings]=useState<Binding[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [bRes,sRes]=await Promise.all([fetch("/api/provider-dispatch-token-binding?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-token-binding-policy?limit=100",{cache:"no-store"})]); const b=await bRes.json(); const s=await sRes.json(); if(bRes.ok){ const list=Array.isArray(b.providerDispatchTokenBindings)?b.providerDispatchTokenBindings:[]; setBindings(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/provider-dispatch-token-binding-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchTokenBindingId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Policy Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-token-binding-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Provider Dispatch Token Binding Policy</h1><p style={{lineHeight:1.6}}>Phase 34.1 simuliert Policy Checks für Provider Dispatch Token Bindings. Token bleibt nicht aktiv gebunden. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{bindings.map((item)=><option key={item.id} value={item.id}>{item.bindingMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Provider Dispatch Token Binding Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0?<p>Noch keine Policy Simulations.</p>:sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.policyMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Prepared:</strong> {String(sim.providerDispatchTokenBindingPrepared)} · <strong>Token bound:</strong> {String(sim.tokenBoundToDispatch)} · <strong>Binding active:</strong> {String(sim.tokenBindingActive)} · <strong>Token active:</strong> {String(sim.tokenActive)}</p><p><strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-token-binding-policy')){ console.log("SKIP UnifiedNavigation: Token Binding Policy bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-token-binding-policy", label: "Dispatch Token Policy", key: "provider-dispatch-token-binding-policy" },'; const markers=['{ href: "/provider-dispatch-token-binding", label: "Dispatch Token Binding", key: "provider-dispatch-token-binding" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Token Policy Link ergänzt."); }
function patchDocs(){ ensureFile("phase34-1-provider-dispatch-token-binding-policy-audit.md", `# Phase 34.1 – Provider Dispatch Token Binding Policy & Audit\n\n## Ziel\nProvider Dispatch Token Binding wird per Policy Simulation geprüft und als Governance Audit Event protokolliert.\n\n## UI/API\n- UI: /provider-dispatch-token-binding-policy\n- API: /api/provider-dispatch-token-binding-policy\n\n## Sicherheitsinvarianten\n- providerDispatchTokenBindingPrepared=true\n- tokenBoundToDispatch=false\n- tokenBindingActive=false\n- tokenActive=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 34.2 – Provider Dispatch Token Binding Dashboard & Smoke\n`); ensureFile("docs/phase34-provider-dispatch-token-binding-policy-audit-runbook.md", `# Runbook – Phase 34.1 Provider Dispatch Token Binding Policy & Audit\n\n## Patch\n\`\`\`powershell\nnpm run phase34:1:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase34:1:verify\nnpm run build\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-token-binding-policy-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-token-binding-policy/route.ts", api);
ensureFile("frontend/app/provider-dispatch-token-binding-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 34.1 Patch abgeschlossen.");
