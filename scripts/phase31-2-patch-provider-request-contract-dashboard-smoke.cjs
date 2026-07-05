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
  pkg.scripts["phase31:2:patch"]="node scripts/phase31-2-patch-provider-request-contract-dashboard-smoke.cjs";
  pkg.scripts["phase31:2:verify"]="node scripts/phase31-2-verify-provider-request-contract-dashboard-smoke.cjs";
  pkg.scripts["phase31:2:smoke"]="node scripts/phase31-2-provider-request-contract-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-request-contract:release:check"]="npm run phase31:0:verify && npm run phase31:1:verify && npm run phase31:2:verify && npm run phase31:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 31.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderRequestContractDashboardPage(){
  const [contracts,setContracts]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [preflights,setPreflights]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [c,p,pre,a]=await Promise.all([
        fetchJson("/api/provider-request-contract?limit=200"),
        fetchJson("/api/provider-request-contract-policy?limit=200"),
        fetchJson("/api/token-backed-provider-invocation-preflight?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setContracts({summary:c.summary,items:c.providerRequestContracts||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setPreflights({summary:pre.summary,items:pre.tokenBackedProviderInvocationPreflights||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Provider Request Contracts", contracts, "/provider-request-contract"],
    ["Provider Request Contract Policy", policy, "/provider-request-contract-policy"],
    ["Token-backed Provider Preflights", preflights, "/token-backed-provider-invocation-preflight"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-request-contract-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)",borderColor:"#fdba74"}}><h1 className="section-title">Provider Request Contract Dashboard</h1><p style={{lineHeight:1.6}}>Phase 31.2 fasst Provider Request Contracts, Policy Simulationen, Token-backed Provider Preflights und Audit zusammen. Contract bleibt metadata-only. Kein Provider-/Netzwerk-Aufruf, kein Prompt, keine Secret-Werte und kein Request Body.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Request Contract Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_provider_request_contract_metadata_only_no_provider_call</li><li>providerRequestContractPrepared=true</li><li>metadataOnly=true</li><li>provider=none</li><li>modelSelected=none</li><li>promptIncluded=false</li><li>promptRedactedPreviewIncluded=false</li><li>secretValuesIncluded=false</li><li>requestBodyIncluded=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "provider-request-contract-dashboard"')){
   const line='  { href: "/provider-request-contract-dashboard", label: "Provider Request Dashboard", key: "provider-request-contract-dashboard" },';
   const markers=['{ href: "/provider-request-contract-policy", label: "Provider Request Policy", key: "provider-request-contract-policy" },','{ href: "/provider-request-contract", label: "Provider Request Contract", key: "provider-request-contract" },'];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Request Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Request Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/provider-request-contract-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Provider Request Contract</h2><p>Provider Request Contract und Policy metadata-only ohne Provider-/Netzwerk-Aufruf.</p><a className="secondary-button" href="/provider-request-contract-dashboard">Provider Request Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Provider Request Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Provider Request Dashboard","http://localhost:3000/provider-request-contract-dashboard"],
 ["UI Provider Request Contract","http://localhost:3000/provider-request-contract"],
 ["UI Provider Request Policy","http://localhost:3000/provider-request-contract-policy"],
 ["API Provider Request Contract","http://localhost:3000/api/provider-request-contract"],
 ["API Provider Request Policy","http://localhost:3000/api/provider-request-contract-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 31.2 Provider Request Contract Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Request Contract URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase31-2-provider-request-contract-dashboard-smoke.md", `# Phase 31.2 – Provider Request Contract Dashboard & Smoke

## Ziel
Provider Request Contracts und Provider Request Contract Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /provider-request-contract-dashboard

## Enthalten
- Provider Request Contracts
- Provider Request Contract Policy Simulations
- Token-backed Provider Invocation Preflights
- Governance Audit

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
Phase 31.3 kann Final Provider Request Contract Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase31-provider-request-contract-dashboard-smoke-runbook.md", `# Runbook – Phase 31.2 Provider Request Contract Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase31:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase31-2-patch-provider-request-contract-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase31:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase31:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/provider-request-contract-dashboard/page.tsx", page);
ensureFile("scripts/phase31-2-provider-request-contract-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 31.2 Patch abgeschlossen.");
