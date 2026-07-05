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
  pkg.scripts["phase30:1:patch"]="node scripts/phase30-1-patch-token-backed-provider-preflight-policy-audit.cjs";
  pkg.scripts["phase30:1:verify"]="node scripts/phase30-1-verify-token-backed-provider-preflight-policy-audit.cjs";
  pkg.scripts["llm:token-backed-provider:policy:verify"]="node scripts/phase30-1-verify-token-backed-provider-preflight-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 30.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type TokenBackedProviderPreflightPolicyDecision =
  | "token_backed_provider_preflight_policy_allowed_no_provider_call"
  | "blocked_missing_token_backed_preflight"
  | "blocked_token_active_not_allowed_yet"
  | "blocked_prompt_included"
  | "blocked_secret_values_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";
export interface TokenBackedProviderPreflightPolicySimulation {
  id:string; timestamp:string; preflightId?:string; activationGateId?:string; issuanceGateId?:string; approvalTokenRequestId?:string;
  decision: TokenBackedProviderPreflightPolicyDecision;
  policyMode:"token_backed_provider_preflight_policy_no_provider_call";
  policyChecks:Array<{name:string;passed:boolean;reason:string}>;
  tokenBackedPreflightPrepared:true; tokenActive:false; provider:"none"; modelSelected:"none"; promptIncluded:false; secretValuesIncluded:false;
  networkCallPerformed:false; providerExecutionAllowed:false; realLlmCallAllowed:false; llmCallPerformed:false;
  executionAllowed:false; toolExecutionAllowed:false; agentExecutionAllowed:false; dryRunOnly:true; noSecretsIncluded:boolean; simulated:true; reason:string; metadata?:Record<string, unknown>;
}
function dataDir(){ return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function preflightPath(){ return path.join(dataDir(), "token-backed-provider-invocation-preflights.jsonl"); }
function simulationPath(){ return path.join(dataDir(), "token-backed-provider-preflight-policy-simulations.jsonl"); }
function ensureStore(){ mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string){ const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:TokenBackedProviderPreflightPolicySimulation){ ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
export function listTokenBackedProviderPreflightPolicySimulations(limit=100): TokenBackedProviderPreflightPolicySimulation[]{ ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateTokenBackedProviderPreflightPolicy(input:{ preflightId?:string; metadata?:Record<string, unknown> }):TokenBackedProviderPreflightPolicySimulation{
  ensureStore();
  const preflights=readJsonl(preflightPath());
  const preflight=input.preflightId ? preflights.find((entry:any)=>entry.id===input.preflightId) : preflights[0];
  const checks:Array<{name:string;passed:boolean;reason:string}>=[];
  checks.push({name:"preflight_exists",passed:Boolean(preflight),reason:preflight?"Token-backed Provider Preflight gefunden.":"Token-backed Provider Preflight fehlt."});
  checks.push({name:"preflight_mode_no_provider_call",passed:preflight?.preflightMode==="controlled_token_backed_provider_invocation_preflight_no_provider_call",reason:"Preflight muss No-Provider-Call bleiben."});
  checks.push({name:"token_backed_preflight_prepared",passed:preflight?.tokenBackedPreflightPrepared===true,reason:"Token-backed Preflight muss vorbereitet sein."});
  checks.push({name:"token_not_active",passed:preflight?.tokenActive===false,reason:"Token darf in Phase 30.1 nicht aktiv sein."});
  checks.push({name:"provider_none",passed:preflight?.provider==="none" && preflight?.modelSelected==="none",reason:"Provider und Modell bleiben none."});
  checks.push({name:"prompt_not_included",passed:preflight?.promptIncluded===false,reason:"Prompt darf nicht enthalten sein."});
  checks.push({name:"secrets_not_included",passed:preflight?.secretValuesIncluded===false && preflight?.noSecretsIncluded===true,reason:"Secret-Werte dürfen nicht enthalten sein."});
  checks.push({name:"network_provider_blocked",passed:preflight?.networkCallPerformed===false && preflight?.providerExecutionAllowed===false,reason:"Netzwerk-/Provider-Ausführung bleibt blockiert."});
  checks.push({name:"llm_blocked",passed:preflight?.realLlmCallAllowed===false && preflight?.llmCallPerformed===false,reason:"Real LLM Call bleibt blockiert."});
  checks.push({name:"execution_blocked",passed:preflight?.executionAllowed===false && preflight?.toolExecutionAllowed===false && preflight?.agentExecutionAllowed===false && preflight?.dryRunOnly===true,reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert."});
  let decision:TokenBackedProviderPreflightPolicyDecision="token_backed_provider_preflight_policy_allowed_no_provider_call";
  let reason="Token-backed Provider Preflight Policy erlaubt nur Simulation. Kein Provider-/Netzwerk-Aufruf.";
  if(!preflight){ decision="blocked_missing_token_backed_preflight"; reason="Token-backed Provider Preflight fehlt."; }
  else if(preflight.tokenActive!==false){ decision="blocked_token_active_not_allowed_yet"; reason="Token ist aktiv oder Status ist nicht false."; }
  else if(preflight.promptIncluded!==false){ decision="blocked_prompt_included"; reason="Prompt ist enthalten."; }
  else if(preflight.secretValuesIncluded!==false || preflight.noSecretsIncluded!==true){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(preflight.provider!=="none" || preflight.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(preflight.networkCallPerformed!==false || preflight.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(preflight.executionAllowed!==false || preflight.toolExecutionAllowed!==false || preflight.agentExecutionAllowed!==false || preflight.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:TokenBackedProviderPreflightPolicySimulation={
    id:makeId("token-backed-provider-policy-sim"), timestamp:new Date().toISOString(), preflightId:preflight?.id||input.preflightId, activationGateId:preflight?.activationGateId, issuanceGateId:preflight?.issuanceGateId, approvalTokenRequestId:preflight?.approvalTokenRequestId,
    decision, policyMode:"token_backed_provider_preflight_policy_no_provider_call", policyChecks:checks,
    tokenBackedPreflightPrepared:true, tokenActive:false, provider:"none", modelSelected:"none", promptIncluded:false, secretValuesIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason,
    metadata:{...(input.metadata||{}), phase:"30.1", tokenBackedProviderPreflightPolicyOnly:true, noNetworkCall:true, noProviderCall:true, noPromptIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included"}
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.preflightId, status:sim.decision, riskLevel:"critical", summary:"Token-backed Provider Preflight Policy Simulation: "+sim.decision, metadata:{ source:"phase30.1-token-backed-provider-preflight-policy", simulationId:sim.id, preflightId:sim.preflightId, tokenActive:false, promptIncluded:false, secretValuesIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeTokenBackedProviderPreflightPolicySimulations(sims:TokenBackedProviderPreflightPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=String.raw`import { listTokenBackedProviderPreflightPolicySimulations, simulateTokenBackedProviderPreflightPolicy, summarizeTokenBackedProviderPreflightPolicySimulations } from "../../../lib/token-backed-provider-preflight-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listTokenBackedProviderPreflightPolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeTokenBackedProviderPreflightPolicySimulations(simulations), simulations }); } catch(error){ const message=error instanceof Error ? error.message : "Token-backed Provider Preflight Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const simulation=simulateTokenBackedProviderPreflightPolicy({ preflightId: typeof body.preflightId==="string" ? body.preflightId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); } catch(error){ const message=error instanceof Error ? error.message : "Token-backed Provider Preflight Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Preflight={id:string;decision:string;timestamp:string;preflightMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;policyMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;tokenBackedPreflightPrepared:boolean;tokenActive:boolean;provider:string;modelSelected:string;promptIncluded:boolean;secretValuesIncluded:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function TokenBackedProviderPreflightPolicyPage(){
 const [preflights,setPreflights]=useState<Preflight[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [pRes,sRes]=await Promise.all([fetch("/api/token-backed-provider-invocation-preflight?limit=100",{cache:"no-store"}),fetch("/api/token-backed-provider-preflight-policy?limit=100",{cache:"no-store"})]); const p=await pRes.json(); const s=await sRes.json(); if(pRes.ok){ const list=Array.isArray(p.tokenBackedProviderInvocationPreflights)?p.tokenBackedProviderInvocationPreflights:[]; setPreflights(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/token-backed-provider-preflight-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({preflightId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Policy Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="token-backed-provider-preflight-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f5f3ff 0%,#f8fafc 100%)",borderColor:"#ddd6fe"}}><h1 className="section-title">Token-Backed Provider Preflight Policy</h1><p style={{lineHeight:1.6}}>Phase 30.1 simuliert Policy Checks für Token-backed Provider Preflights. Kein Provider-/Netzwerk-Aufruf, kein Prompt, keine Secret-Werte.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{preflights.map((item)=><option key={item.id} value={item.id}>{item.preflightMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Token-backed Provider Preflight Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0?<p>Noch keine Policy Simulations.</p>:sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.policyMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Preflight:</strong> {String(sim.tokenBackedPreflightPrepared)} · <strong>Token active:</strong> {String(sim.tokenActive)} · <strong>Provider:</strong> {sim.provider} · <strong>Model:</strong> {sim.modelSelected}</p><p><strong>Prompt included:</strong> {String(sim.promptIncluded)} · <strong>Secrets:</strong> {String(sim.secretValuesIncluded)} · <strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "token-backed-provider-preflight-policy"')){ const line='  { href: "/token-backed-provider-preflight-policy", label: "Token Provider Policy", key: "token-backed-provider-preflight-policy" },'; const marker='{ href: "/token-backed-provider-invocation-preflight", label: "Token Provider Preflight", key: "token-backed-provider-invocation-preflight" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Token Provider Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Token Provider Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase30-1-token-backed-provider-preflight-policy-audit.md", `# Phase 30.1 – Token-Backed Provider Preflight Policy & Audit

## Ziel
Token-backed Provider Invocation Preflights werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## UI/API
- UI: /token-backed-provider-preflight-policy
- API: /api/token-backed-provider-preflight-policy

## Sicherheitsprinzip
- token_backed_provider_preflight_policy_no_provider_call
- tokenBackedPreflightPrepared=true
- tokenActive=false
- provider=none
- modelSelected=none
- promptIncluded=false
- secretValuesIncluded=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 30.2 – Token-Backed Provider Preflight Dashboard & Smoke
`);
ensureFile("docs/phase30-token-backed-provider-preflight-policy-audit-runbook.md", `# Runbook – Phase 30.1 Token-Backed Provider Preflight Policy & Audit

## Patch
\`\`\`powershell
npm run phase30:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase30-1-patch-token-backed-provider-preflight-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase30:1:verify
npm run build
\`\`\`
`); }
patchPackage();
ensureFile("frontend/lib/token-backed-provider-preflight-policy-store.ts", store);
ensureFile("frontend/app/api/token-backed-provider-preflight-policy/route.ts", api);
ensureFile("frontend/app/token-backed-provider-preflight-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 30.1 Patch abgeschlossen.");
