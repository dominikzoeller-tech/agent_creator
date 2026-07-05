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
  pkg.scripts["phase36:1:patch"]="node scripts/phase36-1-patch-provider-dispatch-execution-gate-policy-audit.cjs";
  pkg.scripts["phase36:1:verify"]="node scripts/phase36-1-verify-provider-dispatch-execution-gate-policy-audit.cjs";
  pkg.scripts["llm:provider-dispatch-execution-gate:policy:verify"]="node scripts/phase36-1-verify-provider-dispatch-execution-gate-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 36.1 Scripts eingetragen.");
}
const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchExecutionGatePolicyDecision =
  | "provider_dispatch_execution_gate_policy_allowed_execution_blocked_no_provider_call"
  | "blocked_missing_execution_gate"
  | "blocked_execution_gate_not_prepared"
  | "blocked_execution_gate_open"
  | "blocked_final_dispatch_allowed"
  | "blocked_dispatch_performed"
  | "blocked_token_bound_or_active"
  | "blocked_provider_selection_attempt"
  | "blocked_network_or_provider_execution_attempt"
  | "blocked_payload_or_request_body_included"
  | "blocked_secret_values_included"
  | "blocked_execution_not_safe";

export interface ProviderDispatchExecutionGatePolicySimulation {
  id:string;
  timestamp:string;
  providerDispatchExecutionGateId?:string;
  providerDispatchFinalPreflightId?:string;
  providerDispatchTokenBindingId?:string;
  providerDispatchReadinessId?:string;
  decision:ProviderDispatchExecutionGatePolicyDecision;
  policyMode:"provider_dispatch_execution_gate_policy_execution_blocked_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
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
  simulated:true;
  reason:string;
  metadata?:Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function gatePath(): string { return path.join(dataDir(), "provider-dispatch-execution-gates.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-dispatch-execution-gate-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderDispatchExecutionGatePolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }

export function listProviderDispatchExecutionGatePolicySimulations(limit=100): ProviderDispatchExecutionGatePolicySimulation[] {
  ensureStore();
  return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500)));
}

export function simulateProviderDispatchExecutionGatePolicy(input:{ providerDispatchExecutionGateId?: string; metadata?: Record<string, unknown> }): ProviderDispatchExecutionGatePolicySimulation {
  ensureStore();
  const gates=readJsonl(gatePath());
  const gate=input.providerDispatchExecutionGateId ? gates.find((entry:any)=>entry.id===input.providerDispatchExecutionGateId) : gates[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"execution_gate_exists", passed:Boolean(gate), reason:gate?"Provider Dispatch Execution Gate gefunden.":"Provider Dispatch Execution Gate fehlt." });
  checks.push({ name:"execution_gate_prepared", passed:gate?.providerDispatchExecutionGatePrepared===true, reason:"Execution Gate muss nur vorbereitet sein." });
  checks.push({ name:"execution_gate_closed", passed:gate?.executionGateOpen===false, reason:"Execution Gate muss geschlossen bleiben." });
  checks.push({ name:"final_dispatch_not_allowed", passed:gate?.finalDispatchAllowed===false, reason:"Final Dispatch darf nicht erlaubt sein." });
  checks.push({ name:"dispatch_not_performed", passed:gate?.providerDispatchPerformed===false, reason:"Provider Dispatch darf nicht ausgeführt sein." });
  checks.push({ name:"token_not_bound_or_active", passed:gate?.tokenBoundToDispatch===false && gate?.tokenBindingActive===false && gate?.tokenActive===false, reason:"Token darf nicht gebunden oder aktiv sein." });
  checks.push({ name:"metadata_only", passed:gate?.metadataOnly===true, reason:"Execution Gate bleibt metadata-only." });
  checks.push({ name:"provider_none", passed:gate?.provider==="none" && gate?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"payloads_not_included", passed:gate?.dispatchPayloadIncluded===false && gate?.promptPayloadIncluded===false && gate?.promptIncluded===false && gate?.requestBodyIncluded===false && gate?.sensitiveRequestBodyIncluded===false, reason:"Dispatch-, Prompt- und Request-Payloads dürfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:gate?.secretValuesIncluded===false && gate?.noSecretsIncluded===true && !containsSecretValue(gate), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:gate?.networkCallAllowed===false && gate?.networkCallPerformed===false && gate?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:gate?.realLlmCallAllowed===false && gate?.llmCallPerformed===false, reason:"LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:gate?.executionAllowed===false && gate?.toolExecutionAllowed===false && gate?.agentExecutionAllowed===false && gate?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });

  let decision:ProviderDispatchExecutionGatePolicyDecision="provider_dispatch_execution_gate_policy_allowed_execution_blocked_no_provider_call";
  let reason="Provider Dispatch Execution Gate Policy erlaubt nur execution-blocked no-provider-call Simulation. Execution Gate bleibt geschlossen.";
  if(!gate){ decision="blocked_missing_execution_gate"; reason="Provider Dispatch Execution Gate fehlt."; }
  else if(gate.providerDispatchExecutionGatePrepared!==true){ decision="blocked_execution_gate_not_prepared"; reason="Execution Gate ist nicht vorbereitet."; }
  else if(gate.executionGateOpen!==false){ decision="blocked_execution_gate_open"; reason="Execution Gate ist offen."; }
  else if(gate.finalDispatchAllowed!==false){ decision="blocked_final_dispatch_allowed"; reason="Final Dispatch ist erlaubt."; }
  else if(gate.providerDispatchPerformed!==false){ decision="blocked_dispatch_performed"; reason="Provider Dispatch wurde ausgeführt."; }
  else if(gate.tokenBoundToDispatch!==false || gate.tokenBindingActive!==false || gate.tokenActive!==false){ decision="blocked_token_bound_or_active"; reason="Token ist gebunden oder aktiv."; }
  else if(gate.provider!=="none" || gate.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(gate.networkCallAllowed!==false || gate.networkCallPerformed!==false || gate.providerExecutionAllowed!==false){ decision="blocked_network_or_provider_execution_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(gate.dispatchPayloadIncluded!==false || gate.promptPayloadIncluded!==false || gate.promptIncluded!==false || gate.requestBodyIncluded!==false || gate.sensitiveRequestBodyIncluded!==false){ decision="blocked_payload_or_request_body_included"; reason="Payload oder Request Body ist enthalten."; }
  else if(gate.secretValuesIncluded!==false || gate.noSecretsIncluded!==true || containsSecretValue(gate)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(gate.executionAllowed!==false || gate.toolExecutionAllowed!==false || gate.agentExecutionAllowed!==false || gate.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }

  const sim:ProviderDispatchExecutionGatePolicySimulation={
    id:makeId("provider-dispatch-execution-gate-policy-sim"),
    timestamp:new Date().toISOString(),
    providerDispatchExecutionGateId:gate?.id||input.providerDispatchExecutionGateId,
    providerDispatchFinalPreflightId:gate?.providerDispatchFinalPreflightId,
    providerDispatchTokenBindingId:gate?.providerDispatchTokenBindingId,
    providerDispatchReadinessId:gate?.providerDispatchReadinessId,
    decision,
    policyMode:"provider_dispatch_execution_gate_policy_execution_blocked_no_provider_call",
    policyChecks:checks,
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
    simulated:true,
    reason,
    metadata:{ ...(input.metadata||{}), phase:"36.1", noProviderCall:true, noNetworkCall:true, noDispatch:true, executionGateOpen:false, finalDispatchAllowed:false }
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerDispatchExecutionGateId, status:sim.decision, riskLevel:"critical", summary:"Provider Dispatch Execution Gate Policy Simulation: "+sim.decision, metadata:{ source:"phase36.1-provider-dispatch-execution-gate-policy", simulationId:sim.id, providerDispatchExecutionGateId:sim.providerDispatchExecutionGateId, executionGateOpen:false, finalDispatchAllowed:false, networkCallAllowed:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderDispatchExecutionGatePolicySimulations(sims:ProviderDispatchExecutionGatePolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=`import { listProviderDispatchExecutionGatePolicySimulations, simulateProviderDispatchExecutionGatePolicy, summarizeProviderDispatchExecutionGatePolicySimulations } from "../../../lib/provider-dispatch-execution-gate-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listProviderDispatchExecutionGatePolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderDispatchExecutionGatePolicySimulations(simulations), simulations }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Execution Gate Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const simulation=simulateProviderDispatchExecutionGatePolicy({ providerDispatchExecutionGateId: typeof body.providerDispatchExecutionGateId==="string" ? body.providerDispatchExecutionGateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Dispatch Execution Gate Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Gate={id:string;decision:string;timestamp:string;gateMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;policyMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;providerDispatchExecutionGatePrepared:boolean;executionGateOpen:boolean;finalDispatchAllowed:boolean;networkCallAllowed:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderDispatchExecutionGatePolicyPage(){
 const [gates,setGates]=useState<Gate[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [gRes,sRes]=await Promise.all([fetch("/api/provider-dispatch-execution-gate?limit=100",{cache:"no-store"}),fetch("/api/provider-dispatch-execution-gate-policy?limit=100",{cache:"no-store"})]); const g=await gRes.json(); const s=await sRes.json(); if(gRes.ok){ const list=Array.isArray(g.providerDispatchExecutionGates)?g.providerDispatchExecutionGates:[]; setGates(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/provider-dispatch-execution-gate-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerDispatchExecutionGateId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Policy Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-execution-gate-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Provider Dispatch Execution Gate Policy</h1><p style={{lineHeight:1.6}}>Phase 36.1 simuliert Policy Checks für Provider Dispatch Execution Gates. Execution Gate bleibt geschlossen. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{gates.map((item)=><option key={item.id} value={item.id}>{item.gateMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Provider Dispatch Execution Gate Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0?<p>Noch keine Policy Simulations.</p>:sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.policyMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Prepared:</strong> {String(sim.providerDispatchExecutionGatePrepared)} · <strong>Gate open:</strong> {String(sim.executionGateOpen)} · <strong>Final dispatch allowed:</strong> {String(sim.finalDispatchAllowed)} · <strong>Network allowed:</strong> {String(sim.networkCallAllowed)}</p><p><strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-execution-gate-policy')){ console.log("SKIP UnifiedNavigation: Execution Gate Policy bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-execution-gate-policy", label: "Dispatch Execution Policy", key: "provider-dispatch-execution-gate-policy" },'; const markers=['{ href: "/provider-dispatch-execution-gate", label: "Dispatch Execution Gate", key: "provider-dispatch-execution-gate" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Execution Policy Link ergänzt."); }
function patchDocs(){ ensureFile("phase36-1-provider-dispatch-execution-gate-policy-audit.md", `# Phase 36.1 – Provider Dispatch Execution Gate Policy & Audit\n\n## Ziel\nProvider Dispatch Execution Gate wird per Policy Simulation geprüft und als Governance Audit Event protokolliert.\n\n## UI/API\n- UI: /provider-dispatch-execution-gate-policy\n- API: /api/provider-dispatch-execution-gate-policy\n\n## Sicherheitsinvarianten\n- providerDispatchExecutionGatePrepared=true\n- executionGateOpen=false\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 36.2 – Provider Dispatch Execution Gate Dashboard & Smoke\n`); ensureFile("docs/phase36-provider-dispatch-execution-gate-policy-audit-runbook.md", `# Runbook – Phase 36.1 Provider Dispatch Execution Gate Policy & Audit\n\n## Patch\n\`\`\`powershell\nnpm run phase36:1:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase36:1:verify\nnpm run build\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/lib/provider-dispatch-execution-gate-policy-store.ts", store);
ensureFile("frontend/app/api/provider-dispatch-execution-gate-policy/route.ts", api);
ensureFile("frontend/app/provider-dispatch-execution-gate-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 36.1 Patch abgeschlossen.");
