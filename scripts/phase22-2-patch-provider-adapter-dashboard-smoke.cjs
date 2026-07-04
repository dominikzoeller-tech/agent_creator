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
  pkg.scripts["phase22:2:patch"]="node scripts/phase22-2-patch-provider-adapter-dashboard-smoke.cjs";
  pkg.scripts["phase22:2:verify"]="node scripts/phase22-2-verify-provider-adapter-dashboard-smoke.cjs";
  pkg.scripts["phase22:2:smoke"]="node scripts/phase22-2-provider-adapter-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-stub:release:check"]="npm run phase22:0:verify && npm run phase22:1:verify && npm run phase22:2:verify && npm run phase22:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 22.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){
  const res=await fetch(url,{cache:"no-store"});
  const payload=await res.json();
  if(!res.ok) throw new Error(payload?.error||url);
  return payload;
}
export default function ProviderAdapterDashboardPage(){
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [adapterStubs,setAdapterStubs]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [e,s,p,a]=await Promise.all([
        fetchJson("/api/approved-real-llm-invocation-envelope?limit=200"),
        fetchJson("/api/provider-llm-adapter-stub?limit=200"),
        fetchJson("/api/provider-llm-adapter-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setEnvelopes({summary:e.summary,items:e.invocationEnvelopes||[]});
      setAdapterStubs({summary:s.summary,items:s.adapterStubs||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Invocation Envelopes", envelopes, "/approved-real-llm-invocation-envelope"],
    ["Provider Adapter Stubs", adapterStubs, "/provider-llm-adapter-stub"],
    ["Provider Adapter Policy", policy, "/provider-llm-adapter-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-llm-adapter-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Provider Adapter Dashboard</h1><p style={{lineHeight:1.6}}>Phase 22.2 fasst Invocation Envelopes, Provider Adapter Stubs, Provider Adapter Policy Simulationen und Audit zusammen. Kein Netzwerk-/Provider-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Adapter Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>provider_agnostic_no_network_stub</li><li>provider=none</li><li>networkCallAllowed=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>Kein produktiver LLM-Aufruf.</li><li>Keine Tool-Ausführung.</li><li>Keine Agent-Ausführung.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx";
 if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "provider-llm-adapter-dashboard"')){
   const line='  { href: "/provider-llm-adapter-dashboard", label: "Provider Dashboard", key: "provider-llm-adapter-dashboard" },';
   const markers=[
    '{ href: "/provider-llm-adapter-policy", label: "Provider Policy", key: "provider-llm-adapter-policy" },',
    '{ href: "/provider-llm-adapter-stub", label: "Provider Stub", key: "provider-llm-adapter-stub" },'
   ];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx";
 if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/provider-llm-adapter-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Provider Adapter Stub</h2><p>Provider-agnostic no-network LLM Adapter Prep.</p><a className="secondary-button" href="/provider-llm-adapter-dashboard">Provider Adapter Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Provider Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Provider Adapter Dashboard","http://localhost:3000/provider-llm-adapter-dashboard"],
 ["UI Provider Adapter Stub","http://localhost:3000/provider-llm-adapter-stub"],
 ["UI Provider Adapter Policy","http://localhost:3000/provider-llm-adapter-policy"],
 ["API Provider Adapter Stub","http://localhost:3000/api/provider-llm-adapter-stub"],
 ["API Provider Adapter Policy","http://localhost:3000/api/provider-llm-adapter-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 22.2 Provider Adapter Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Adapter URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase22-2-provider-adapter-dashboard-smoke.md", `# Phase 22.2 – Provider Adapter Dashboard & Smoke

## Ziel
Provider Adapter Stubs und Provider Adapter Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /provider-llm-adapter-dashboard

## Enthalten
- Approved Real LLM Invocation Envelopes
- Provider-Agnostic LLM Invocation Adapter Stubs
- Provider Adapter Policy Simulations
- Governance Audit

## Sicherheitsprinzip
- provider_agnostic_no_network_stub
- provider=none
- networkCallAllowed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- keine Tool-Ausführung
- keine Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 22.3 kann Final Provider Adapter Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase22-provider-adapter-dashboard-smoke-runbook.md", `# Runbook – Phase 22.2 Provider Adapter Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase22:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase22-2-patch-provider-adapter-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase22:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase22:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/provider-llm-adapter-dashboard/page.tsx", page);
ensureFile("scripts/phase22-2-provider-adapter-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 22.2 Patch abgeschlossen.");
