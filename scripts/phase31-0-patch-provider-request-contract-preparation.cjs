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
  pkg.scripts["phase31:0:patch"]="node scripts/phase31-0-patch-provider-request-contract-preparation.cjs";
  pkg.scripts["phase31:0:verify"]="node scripts/phase31-0-verify-provider-request-contract-preparation.cjs";
  pkg.scripts["llm:provider-request-contract:verify"]="node scripts/phase31-0-verify-provider-request-contract-preparation.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 31.0 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderRequestContractDecision =
  | "provider_request_contract_prepared_no_provider_call"
  | "blocked_missing_token_backed_preflight"
  | "blocked_preflight_not_prepared"
  | "blocked_token_active_not_allowed_yet"
  | "blocked_prompt_included"
  | "blocked_secret_values_included"
  | "blocked_provider_selection_attempt"
  | "blocked_network_call_attempt"
  | "blocked_execution_not_safe";

export interface ProviderRequestContract {
  id: string;
  timestamp: string;
  tokenBackedPreflightId?: string;
  activationGateId?: string;
  issuanceGateId?: string;
  approvalTokenRequestId?: string;
  decision: ProviderRequestContractDecision;
  contractMode: "controlled_provider_request_contract_metadata_only_no_provider_call";
  contractChecks: Array<{ name: string; passed: boolean; reason: string }>;
  requestContract: {
    provider: "none";
    modelSelected: "none";
    promptIncluded: false;
    promptRedactedPreviewIncluded: false;
    secretValuesIncluded: false;
    requestBodyIncluded: false;
    metadataOnly: true;
  };
  operationalControls: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  providerRequestContractPrepared: true;
  tokenBackedPreflightPrepared: true;
  tokenActive: false;
  provider: "none";
  modelSelected: "none";
  promptIncluded: false;
  promptRedactedPreviewIncluded: false;
  secretValuesIncluded: false;
  requestBodyIncluded: false;
  metadataOnly: true;
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
function preflightPath(): string { return path.join(dataDir(), "token-backed-provider-invocation-preflights.jsonl"); }
function contractPath(): string { return path.join(dataDir(), "provider-request-contracts.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendContract(item: ProviderRequestContract): void { ensureStore(); appendFileSync(contractPath(), JSON.stringify(item)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listProviderRequestContracts(limit=100): ProviderRequestContract[] { ensureStore(); return readJsonl(contractPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createProviderRequestContract(input:{ tokenBackedPreflightId?: string; metadata?: Record<string, unknown> }): ProviderRequestContract {
  ensureStore();
  const preflights=readJsonl(preflightPath());
  const preflight=input.tokenBackedPreflightId ? preflights.find((entry:any)=>entry.id===input.tokenBackedPreflightId) : preflights[0];
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"token_backed_preflight_exists", passed:Boolean(preflight), reason:preflight?"Token-backed Provider Preflight gefunden.":"Token-backed Provider Preflight fehlt." });
  checks.push({ name:"token_backed_preflight_prepared", passed:preflight?.tokenBackedPreflightPrepared===true, reason:"Token-backed Preflight muss vorbereitet sein." });
  checks.push({ name:"token_not_active", passed:preflight?.tokenActive===false, reason:"Provider Request Contract darf Token nicht aktiv setzen." });
  checks.push({ name:"provider_none", passed:preflight?.provider==="none" && preflight?.modelSelected==="none", reason:"Provider und Modell bleiben none." });
  checks.push({ name:"prompt_not_included", passed:preflight?.promptIncluded===false, reason:"Prompt darf nicht enthalten sein." });
  checks.push({ name:"secret_values_not_included", passed:preflight?.secretValuesIncluded===false && preflight?.noSecretsIncluded===true && !containsSecretValue(preflight), reason:"Secret-Werte dürfen nicht enthalten sein." });
  checks.push({ name:"request_body_not_included", passed:true, reason:"Request Body wird in Phase 31.0 nicht eingebettet." });
  checks.push({ name:"metadata_only_contract", passed:true, reason:"Provider Request Contract bleibt metadata-only." });
  checks.push({ name:"network_provider_blocked", passed:preflight?.networkCallPerformed===false && preflight?.providerExecutionAllowed===false, reason:"Kein Netzwerk-/Provider-Aufruf." });
  checks.push({ name:"llm_blocked", passed:preflight?.realLlmCallAllowed===false && preflight?.llmCallPerformed===false, reason:"Real LLM Call bleibt blockiert." });
  checks.push({ name:"execution_blocked", passed:preflight?.executionAllowed===false && preflight?.toolExecutionAllowed===false && preflight?.agentExecutionAllowed===false && preflight?.dryRunOnly===true, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  let decision:ProviderRequestContractDecision="provider_request_contract_prepared_no_provider_call";
  let reason="Provider Request Contract metadata-only vorbereitet. Kein Provider-/Netzwerk-Aufruf, kein Prompt, keine Secret-Werte, kein Request Body.";
  if(!preflight){ decision="blocked_missing_token_backed_preflight"; reason="Token-backed Provider Preflight fehlt."; }
  else if(preflight.tokenBackedPreflightPrepared!==true){ decision="blocked_preflight_not_prepared"; reason="Token-backed Provider Preflight ist nicht vorbereitet."; }
  else if(preflight.tokenActive!==false){ decision="blocked_token_active_not_allowed_yet"; reason="Token ist aktiv oder Status ist nicht false."; }
  else if(preflight.promptIncluded!==false){ decision="blocked_prompt_included"; reason="Prompt ist enthalten."; }
  else if(preflight.secretValuesIncluded!==false || preflight.noSecretsIncluded!==true || containsSecretValue(preflight)){ decision="blocked_secret_values_included"; reason="Secret Boundary verletzt."; }
  else if(preflight.provider!=="none" || preflight.modelSelected!=="none"){ decision="blocked_provider_selection_attempt"; reason="Provider- oder Modell-Auswahl erkannt."; }
  else if(preflight.networkCallPerformed!==false || preflight.providerExecutionAllowed!==false){ decision="blocked_network_call_attempt"; reason="Netzwerk-/Provider-Aufruf erkannt."; }
  else if(preflight.executionAllowed!==false || preflight.toolExecutionAllowed!==false || preflight.agentExecutionAllowed!==false || preflight.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const item:ProviderRequestContract={
    id:makeId("provider-request-contract"), timestamp:new Date().toISOString(), tokenBackedPreflightId:preflight?.id||input.tokenBackedPreflightId, activationGateId:preflight?.activationGateId, issuanceGateId:preflight?.issuanceGateId, approvalTokenRequestId:preflight?.approvalTokenRequestId, decision,
    contractMode:"controlled_provider_request_contract_metadata_only_no_provider_call", contractChecks:checks,
    requestContract:{ provider:"none", modelSelected:"none", promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, metadataOnly:true },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    providerRequestContractPrepared:true, tokenBackedPreflightPrepared:true, tokenActive:false, provider:"none", modelSelected:"none", promptIncluded:false, promptRedactedPreviewIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, metadataOnly:true,
    networkCallPerformed:false, providerExecutionAllowed:false, realLlmCallAllowed:false, llmCallPerformed:false, executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, noSecretsIncluded:decision!=="blocked_secret_values_included", reason,
    metadata:{ ...(input.metadata||{}), phase:"31.0", providerRequestContractOnly:true, metadataOnly:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, noPromptIncluded:true, noRequestBodyIncluded:true, noSecretsIncluded:decision!=="blocked_secret_values_included" }
  };
  appendContract(item);
  appendGovernanceAuditEvent({ type:"agent_registry_status_changed", actor:"api", entityType:"agent-registry", entityId:item.id, status:item.decision, riskLevel:"critical", summary:"Provider Request Contract prepared: "+item.decision, metadata:{ source:"phase31.0-provider-request-contract", contractId:item.id, tokenBackedPreflightId:item.tokenBackedPreflightId, metadataOnly:true, promptIncluded:false, secretValuesIncluded:false, requestBodyIncluded:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false } });
  return item;
}
export function summarizeProviderRequestContracts(items:ProviderRequestContract[]){ const byDecision:Record<string,number>={}; for(const item of items){ byDecision[item.decision]=(byDecision[item.decision]||0)+1; } return { total:items.length, byDecision }; }
`;
const api=String.raw`import { createProviderRequestContract, listProviderRequestContracts, summarizeProviderRequestContracts } from "../../../lib/provider-request-contract-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){ try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const providerRequestContracts=listProviderRequestContracts(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeProviderRequestContracts(providerRequestContracts), providerRequestContracts }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Request Contracts konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body=await request.json(); const contract=createProviderRequestContract({ tokenBackedPreflightId: typeof body.tokenBackedPreflightId==="string" ? body.tokenBackedPreflightId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, providerRequestContract:contract }); } catch(error){ const message=error instanceof Error ? error.message : "Provider Request Contract konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
`;
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type Preflight={id:string;decision:string;timestamp:string;preflightMode:string};
type Contract={id:string;timestamp:string;decision:string;reason:string;contractMode:string;contractChecks:Array<{name:string;passed:boolean;reason:string}>;providerRequestContractPrepared:boolean;metadataOnly:boolean;provider:string;modelSelected:string;promptIncluded:boolean;promptRedactedPreviewIncluded:boolean;secretValuesIncluded:boolean;requestBodyIncluded:boolean;networkCallPerformed:boolean;providerExecutionAllowed:boolean;llmCallPerformed:boolean;dryRunOnly:boolean};
export default function ProviderRequestContractPage(){
 const [preflights,setPreflights]=useState<Preflight[]>([]); const [contracts,setContracts]=useState<Contract[]>([]); const [summary,setSummary]=useState<any>(null); const [selected,setSelected]=useState(""); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [pRes,cRes]=await Promise.all([fetch("/api/token-backed-provider-invocation-preflight?limit=100",{cache:"no-store"}),fetch("/api/provider-request-contract?limit=100",{cache:"no-store"})]); const p=await pRes.json(); const c=await cRes.json(); if(pRes.ok){ const list=Array.isArray(p.tokenBackedProviderInvocationPreflights)?p.tokenBackedProviderInvocationPreflights:[]; setPreflights(list); if(!selected && list[0]?.id) setSelected(list[0].id); } if(!cRes.ok) throw new Error(c?.error||"Provider Request Contracts konnten nicht geladen werden."); setContracts(Array.isArray(c.providerRequestContracts)?c.providerRequestContracts:[]); setSummary(c.summary||null); }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 async function create(){ const res=await fetch("/api/provider-request-contract",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tokenBackedPreflightId:selected})}); if(!res.ok){ const p=await res.json(); setError(p?.error||"Provider Request Contract fehlgeschlagen"); } await load(); }
 return <main className="page-wrap"><UnifiedNavigation active="provider-request-contract" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fdf2f8 0%,#f8fafc 100%)",borderColor:"#f9a8d4"}}><h1 className="section-title">Provider Request Contract</h1><p style={{lineHeight:1.6}}>Phase 31.0 bereitet einen metadata-only Provider Request Contract vor. Kein Provider-/Netzwerk-Aufruf, kein Prompt, keine Secret-Werte, kein Request Body.</p></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Request Contract vorbereiten</h2><select className="text-input" value={selected} onChange={(ev)=>setSelected(ev.target.value)}>{preflights.map((item)=><option key={item.id} value={item.id}>{item.preflightMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={create} disabled={!selected}>Provider Request Contract vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(summary??{},null,2)}</pre></section><section className="panel-card"><h2>Contracts</h2>{contracts.length===0?<p>Noch keine Provider Request Contracts.</p>:contracts.map((item)=><article key={item.id} style={{borderTop:"1px solid #e5e7eb",padding:"12px 0"}}><div><strong>{item.contractMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Contract:</strong> {String(item.providerRequestContractPrepared)} · <strong>Metadata-only:</strong> {String(item.metadataOnly)} · <strong>Provider:</strong> {item.provider} · <strong>Model:</strong> {item.modelSelected}</p><p><strong>Prompt:</strong> {String(item.promptIncluded)} · <strong>Redacted preview:</strong> {String(item.promptRedactedPreviewIncluded)} · <strong>Secrets:</strong> {String(item.secretValuesIncluded)} · <strong>Request body:</strong> {String(item.requestBodyIncluded)}</p><p><strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p><ul>{item.contractChecks?.map((check)=><li key={check.name}><strong>{check.name}:</strong> {String(check.passed)} – {check.reason}</li>)}</ul></article>)}</section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "provider-request-contract"')){ const line='  { href: "/provider-request-contract", label: "Provider Request Contract", key: "provider-request-contract" },'; const marker='{ href: "/token-backed-provider-preflight-dashboard", label: "Token Provider Dashboard", key: "token-backed-provider-preflight-dashboard" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Request Contract Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Request Contract bereits vorhanden oder Marker fehlt."); }
function patchDocs(){ ensureFile("phase31-0-provider-request-contract-preparation.md", `# Phase 31.0 – Controlled Provider Request Contract Preparation / Still No Provider Call

## Ziel
Ein Provider Request Contract wird metadata-only vorbereitet. Kein Provider-/Netzwerk-Aufruf, kein Prompt, keine Secret-Werte und kein Request Body werden eingebettet.

## UI/API
- UI: /provider-request-contract
- API: /api/provider-request-contract

## Sicherheitsprinzip
- controlled_provider_request_contract_metadata_only_no_provider_call
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
Phase 31.1 – Provider Request Contract Policy & Audit
`);
ensureFile("docs/phase31-provider-request-contract-preparation-runbook.md", `# Runbook – Phase 31.0 Provider Request Contract Preparation

## Patch
\`\`\`powershell
npm run phase31:0:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase31-0-patch-provider-request-contract-preparation.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase31:0:verify
npm run build
\`\`\`

## Browser-Test
http://localhost:3000/provider-request-contract
`); }
patchPackage();
ensureFile("frontend/lib/provider-request-contract-store.ts", store);
ensureFile("frontend/app/api/provider-request-contract/route.ts", api);
ensureFile("frontend/app/provider-request-contract/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 31.0 Patch abgeschlossen.");
