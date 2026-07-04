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
  pkg.scripts["phase25:2:patch"]="node scripts/phase25-2-patch-provider-simulation-dashboard-smoke.cjs";
  pkg.scripts["phase25:2:verify"]="node scripts/phase25-2-verify-provider-simulation-dashboard-smoke.cjs";
  pkg.scripts["phase25:2:smoke"]="node scripts/phase25-2-provider-simulation-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-simulation:release:check"]="npm run phase25:0:verify && npm run phase25:1:verify && npm run phase25:2:verify && npm run phase25:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 25.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderSimulationDashboardPage(){
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [readiness,setReadiness]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [e,p,r,a]=await Promise.all([
        fetchJson("/api/controlled-provider-invocation-simulation-envelope?limit=200"),
        fetchJson("/api/controlled-provider-invocation-simulation-policy?limit=200"),
        fetchJson("/api/provider-invocation-readiness-preflight?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setEnvelopes({summary:e.summary,items:e.simulationEnvelopes||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setReadiness({summary:r.summary,items:r.preflights||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Simulation Envelopes", envelopes, "/controlled-provider-invocation-simulation-envelope"],
    ["Simulation Policy", policy, "/controlled-provider-invocation-simulation-policy"],
    ["Readiness Preflights", readiness, "/provider-invocation-readiness-preflight"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-simulation-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)",borderColor:"#67e8f9"}}><h1 className="section-title">Provider Simulation Dashboard</h1><p style={{lineHeight:1.6}}>Phase 25.2 fasst Controlled Provider Invocation Simulation Envelopes, Simulation Policy, Readiness Preflights und Audit zusammen. Kein externer Provider-/Netzwerk-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Simulation Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_provider_invocation_simulation_envelope_no_external_call</li><li>metadata-only Simulation</li><li>provider=none</li><li>modelSelected=none</li><li>promptIncluded=false</li><li>secretValuesIncluded=false</li><li>networkCallAllowed=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx";
 if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "provider-simulation-dashboard"')){
   const line='  { href: "/provider-simulation-dashboard", label: "Simulation Dashboard", key: "provider-simulation-dashboard" },';
   const markers=[
    '{ href: "/controlled-provider-invocation-simulation-policy", label: "Simulation Policy", key: "controlled-provider-invocation-simulation-policy" },',
    '{ href: "/controlled-provider-invocation-simulation-envelope", label: "Provider Simulation", key: "controlled-provider-invocation-simulation-envelope" },'
   ];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Simulation Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Simulation Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx";
 if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/provider-simulation-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Provider Simulation</h2><p>Controlled Provider Invocation Simulation ohne externe Calls.</p><a className="secondary-button" href="/provider-simulation-dashboard">Provider Simulation Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Provider Simulation Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Provider Simulation Dashboard","http://localhost:3000/provider-simulation-dashboard"],
 ["UI Provider Simulation Envelope","http://localhost:3000/controlled-provider-invocation-simulation-envelope"],
 ["UI Provider Simulation Policy","http://localhost:3000/controlled-provider-invocation-simulation-policy"],
 ["API Provider Simulation Envelope","http://localhost:3000/api/controlled-provider-invocation-simulation-envelope"],
 ["API Provider Simulation Policy","http://localhost:3000/api/controlled-provider-invocation-simulation-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 25.2 Provider Simulation Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Simulation URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase25-2-provider-simulation-dashboard-smoke.md", `# Phase 25.2 – Provider Simulation Dashboard & Smoke

## Ziel
Controlled Provider Invocation Simulation Envelopes und Provider Simulation Policy Simulations werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /provider-simulation-dashboard

## Enthalten
- Controlled Provider Invocation Simulation Envelopes
- Controlled Provider Simulation Policy Simulations
- Provider Invocation Readiness Preflights
- Governance Audit

## Sicherheitsprinzip
- controlled_provider_invocation_simulation_envelope_no_external_call
- metadata-only Simulation
- provider=none
- modelSelected=none
- promptIncluded=false
- secretValuesIncluded=false
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
Phase 25.3 kann Final Provider Simulation Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase25-provider-simulation-dashboard-smoke-runbook.md", `# Runbook – Phase 25.2 Provider Simulation Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase25:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase25-2-patch-provider-simulation-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase25:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase25:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/provider-simulation-dashboard/page.tsx", page);
ensureFile("scripts/phase25-2-provider-simulation-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 25.2 Patch abgeschlossen.");
