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
  pkg.scripts["phase31:1:patch"]="node scripts/phase31-1-patch-provider-request-contract-policy-audit.cjs";
  pkg.scripts["phase31:1:verify"]="node scripts/phase31-1-verify-provider-request-contract-policy-audit.cjs";
  pkg.scripts["llm:provider-request-contract:policy:verify"]="node scripts/phase31-1-verify-provider-request-contract-policy-audit.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 31.1 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderRequestContractPolicyDecision =
  | "provider_request_contract_policy_allowed_metadata_only_no_provider_call"
  | "blocked_missing_provider_request_contract"
  | "blocked_contract_not_prepared"
  | "blocked_not_metadata_only"
  | "blocked_prompt_included"
  | "blocked_secret_values_included"
  | "blocked_request_body_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderRequestContractPolicySimulation {
  id:string;
  timestamp:string;
  providerRequestContractId?:string;
  tokenBackedPreflightId?:string;
  activationGateId?:string;
  issuanceGateId?:string;
  decision:ProviderRequestContractPolicyDecision;
  policyMode:"provider_request_contract_policy_metadata_only_no_provider_call";
  policyChecks:Array<{name:string; passed:boolean; reason:string}>;
  providerRequestContractPrepared:true;
  metadataOnly:true;
  provider:"none";
  modelSelected:"none";
  promptIncluded:false;
  promptRedactedPreviewIncluded:false;
  secretValuesIncluded:false;
  requestBodyIncluded:false;
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
function contractPath(): string { return path.join(dataDir(), "provider-request-contracts.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "provider-request-contract-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendSimulation(sim:ProviderRequestContractPolicySimulation): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(sim)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderRequestContractPolicySimulations(limit=100): ProviderRequestContractPolicySimulation[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function simulateProviderRequestContractPolicy(input:{ providerRequestContractId?: string; metadata?: Record<string, unknown> }): ProviderRequestContractPolicySimulation {
  ensureStore();
  const contracts=readJsonl(contractPath());
  const contract=input.providerRequestContractId ? contracts.find((entry:any)=>entry.id===input.providerRequestContractId) : contracts[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"contract_exists", passed:Boolean(contract), reason:contract?"Provider Request Contract gefunden.":"Provider Request Contract fehlt." });
  checks.push({ name:"contract_mode_metadata_only_no_provider_call", passed:contract?.contractMode === "controlled_provider_request_contract_metadata_only_no_provider_call", reason:"Contract muss metadata-only und no-provider-call bleiben." });
  checks.push({ name:"contract_prepared", passed:contract?.providerRequestContractPrepared===true, reason:"Provider Request Contract muss vorbereitet sein." });
  checks.push({ name:"metadata_only", passed:contract?.metadataOnly===true, reason:"Contract muss metadata-only bleiben." });
  checks.push({ name:"provider_none", passed:contract?.provider==="none" && contract?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"prompt_not_included", passed:contract?.promptIncluded===false && contract?.promptRedactedPreviewIncluded===false, reason:"Prompt und redacted preview dürfen nicht enthalten sein." });
  checks.push({ name:"secrets_not_included", passed:contract?.secretValuesIncluded===false && contract?.noSecretsIncluded===true && !containsSecretValue(contract), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:contract?.requestBodyIncluded===false, reason:"Request Body darf nicht enthalten sein." });
  checks.push({ name:"network_provider_blocked", passed:contract?.networkCallPerformed===false && contract?.providerExecutionAllowed===false, reason:"Netzwerk-/Provider-Ausführung bleibt blockiert." });
  checks.push({ name:"llm_blocked", passed:contract?.realLlmCallAllowed===false && contract?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:contract?.executionAllowed===false && contract?.toolExecutionAllowed===false && contract?.agentExecutionAllowed===false && contract?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderRequestContractPolicyDecision="provider_request_contract_policy_allowed_metadata_only_no_provider_call";
  let reason="Provider Request Contract Policy erlaubt nur metadata-only Simulation. Kein Provider-/Netzwerk-Aufruf.";
  if(!contract){ decision="blocked_missing_provider_request_contract"; reason="Provider Request Contract fehlt."; }
  else if(contract.providerRequestContractPrepared!==true){ decision="blocked_contract_not_prepared"; reason="Provider Request Contract ist nicht vorbereitet."; }
  else if(contract.metadataOnly!==true){ decision="blocked_not_metadata_only"; reason="Provider Request Contract ist nicht metadata-only."; }
  else if(contract.promptIncluded!==false || contract.promptRedactedPreviewIncluded!==false){ decision="blocked_prompt_included"; reason="Prompt oder redacted Preview ist enthalten."; }
  else if(contract.secretValuesIncluded!==false || contract.noSecretsIncluded!==true || containsSecretValue(contract)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(contract.requestBodyIncluded!==false){ decision="blocked_request_body_included"; reason="Request Body ist enthalten."; }
  else if(contract.provider!=="none" || contract.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(contract.networkCallPerformed!==false || contract.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(contract.executionAllowed!==false || contract.toolExecutionAllowed!==false || contract.agentExecutionAllowed!==false || contract.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const sim:ProviderRequestContractPolicySimulation={
    id:makeId("provider-request-contract-policy-sim"), timestamp:new Date().toISOString(), providerRequestContractId:contract?.id||input.providerRequestContractId, tokenBackedPreflightId:contract?.tokenBackedPreflightId, activationGateId:contract?.activationGateId, issuanceGateId:contract?.issuanceGateId,
    decision, policyMode:"provider_request_contract_policy_metadata_only_no_provider_call", policyChecks:checks,
    providerRequestContractPrepared:true, metadataOnly:true, provider:"none", modelSelected:"none", promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", simulated:true, reason,
    metadata:{ ...(input.metadata||{}), phase:"31.1", providerRequestContractPolicyOnly:true, metadataOnly:true, noNetworkCall:true, noProviderCall:true, noPromptIncluded:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendSimulation(sim);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:sim.providerRequestContractId, status:sim.decision, riskLevel:"critical", summary:"Provider Request Contract Policy Simulation: "+sim.decision, metadata:{ source:"phase31.1-provider-request-contract-policy", simulationId:sim.id, providerRequestContractId:sim.providerRequestContractId, metadataOnly:true, promptIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return sim;
}
export function summarizeProviderRequestContractPolicySimulations(sims:ProviderRequestContractPolicySimulation[]){ const byDecision:Record<string,number>={}; for(const sim of sims){ byDecision[sim.decision]=(byDecision[sim.decision]||0)+1; } return { total:sims.length, byDecision }; }
`;
const api=String.raw`import { listProviderRequestContractPolicySimulations, simulateProviderRequestContractPolicy, summarizeProviderRequestContractPolicySimulations } from "../../../lib/provider-request-contract-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listProviderRequestContractPolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderRequestContractPolicySimulations(simulations), simulations }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Request Contract Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const simulation=simulateProviderRequestContractPolicy({ providerRequestContractId: typeof body.providerRequestContractId==="string" ? body.providerRequestContractId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Request Contract Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Contract={id:string;decision:string;timestamp:string;contractMode:string};
type Sim={id:string;timestamp:string;decision:string;reason:string;policyMode:string;policyChecks:Array<{name:string;passed:boolean;reason:string}>;providerRequestContractPrepared:boolean;metadataOnly:boolean;provider:string;modelSelected:string;promptIncluded:boolean;promptRedactedPreviewIncluded:boolean;secretValuesIncluded:boolean;requestBodyIncluded:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean;noSecretsIncluded:boolean};
export default function ProviderRequestContractPolicyPage(){
 const [contracts,setContracts]=useState<Contract[]>([]); const [sims,setSims]=useState<Sim[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [cRes,sRes]=await Promise.all([fetch("/api/provider-request-contract?limit=100",{cache:"no-store"}),fetch("/api/provider-request-contract-policy?limit=100",{cache:"no-store"})]); const c=await cRes.json(); const s=await sRes.json(); if(cRes.ok){ const list=Array.isArray(c.providerRequestContracts)?c.providerRequestContracts:[]; setContracts(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!sRes.ok) throw new Error(s?.error||"Policy Simulations konnten nicht geladen werden."); setSims(Array.isArray(s.simulations)?s.simulations:[]); setSummary(s.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function simulate(){ const res=await fetch("/api/provider-request-contract-policy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerRequestContractId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Policy Simulation fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-request-contract-policy" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Provider Request Contract Policy</h1><p style={{lineHeight:1.6}}>Phase 31.1 simuliert Policy Checks für Provider Request Contracts. Contract bleibt metadata-only. Kein Provider-/Netzwerk-Aufruf, kein Prompt, keine Secret-Werte, kein Request Body.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Policy Simulation erstellen</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{contracts.map((item)=><option key={item.id} value={item.id}>{item.contractMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={simulate} disabled={!selected}>Provider Request Contract Policy simulieren</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Policy Simulations</h2>{sims.length===0?<p>Noch keine Policy Simulations.</p>:sims.map((sim)=><article key={sim.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{sim.policyMode}</strong> <span className="chip">{sim.decision}</span></div><div className="helper-text"><code>{sim.id}</code> · {sim.timestamp}</div><p><strong>Reason:</strong> {sim.reason}</p><p><strong>Prepared:</strong> {String(sim.providerRequestContractPrepared)} · <strong>Metadata-only:</strong> {String(sim.metadataOnly)} · <strong>Provider:</strong> {sim.provider} · <strong>Model:</strong> {sim.modelSelected}</p><p><strong>Prompt:</strong> {String(sim.promptIncluded)} · <strong>Redacted preview:</strong> {String(sim.promptRedactedPreviewIncluded)} · <strong>Secrets:</strong> {String(sim.secretValuesIncluded)} · <strong>Request body:</strong> {String(sim.requestBodyIncluded)}</p><p><strong>Network call:</strong> {String(sim.networkCallPerformed)} · <strong>Provider execution:</strong> {String(sim.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(sim.llmCallPerformed)} · <strong>Dry-run:</strong> {String(sim.dryRunOnly)}</p><ul>{sim.policyChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-request-contract-policy"')){ const line='  { href: "/provider-request-contract-policy", label: "Provider Request Policy", key: "provider-request-contract-policy" },'; const marker='{ href: "/provider-request-contract", label: "Provider Request Contract", key: "provider-request-contract" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Request Policy Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Request Policy bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase31-1-provider-request-contract-policy-audit.md", `# Phase 31.1 – Provider Request Contract Policy & Audit

## Ziel
Provider Request Contracts werden per Policy Simulation geprüft und als Governance Audit Event protokolliert.

## UI/API
- UI: /provider-request-contract-policy
- API: /api/provider-request-contract-policy

## Sicherheitsprinzip
- provider_request_contract_policy_metadata_only_no_provider_call
- providerRequestContractPrepared=true
- metadataOnly=true
- provider=none
- modelSelected=none
- promptIncluded=false
- promptRedactedPreviewIncluded=false
- secretValuesIncluded=false
- requestBodyIncluded=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 31.2 – Provider Request Contract Dashboard & Smoke
`);
ensureFile("docs/phase31-provider-request-contract-policy-audit-runbook.md", `# Runbook – Phase 31.1 Provider Request Contract Policy & Audit

## Patch
\`\`\`powershell
npm run phase31:1:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase31-1-patch-provider-request-contract-policy-audit.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase31:1:verify
npm run build
\`\`\`
`); }
patchPackage();
ensureFile("frontend/lib/provider-request-contract-policy-store.ts", store);
ensureFile("frontend/app/api/provider-request-contract-policy/route.ts", api);
ensureFile("frontend/app/provider-request-contract-policy/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 31.1 Patch abgeschlossen.");
