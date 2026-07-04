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
  pkg.scripts["phase26:2:patch"]="node scripts/phase26-2-patch-real-provider-gate-dashboard-smoke.cjs";
  pkg.scripts["phase26:2:verify"]="node scripts/phase26-2-verify-real-provider-gate-dashboard-smoke.cjs";
  pkg.scripts["phase26:2:smoke"]="node scripts/phase26-2-real-provider-gate-dashboard-smoke.cjs";
  pkg.scripts["llm:real-provider-gate:release:check"]="npm run phase26:0:verify && npm run phase26:1:verify && npm run phase26:2:verify && npm run phase26:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 26.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function RealProviderGateDashboardPage(){
  const [gates,setGates]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [simulation,setSimulation]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [g,p,s,a]=await Promise.all([
        fetchJson("/api/controlled-real-provider-invocation-gate?limit=200"),
        fetchJson("/api/real-provider-gate-policy?limit=200"),
        fetchJson("/api/controlled-provider-invocation-simulation-envelope?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setGates({summary:g.summary,items:g.gates||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setSimulation({summary:s.summary,items:s.simulationEnvelopes||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Real Provider Gates", gates, "/controlled-real-provider-invocation-gate"],
    ["Real Gate Policy", policy, "/real-provider-gate-policy"],
    ["Simulation Envelopes", simulation, "/controlled-provider-invocation-simulation-envelope"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="real-provider-gate-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff1f2 0%,#f8fafc 100%)",borderColor:"#fda4af"}}><h1 className="section-title">Real Provider Gate Dashboard</h1><p style={{lineHeight:1.6}}>Phase 26.2 fasst Controlled Real Provider Invocation Gates, Gate Policy Simulationen, Simulation Envelopes und Audit zusammen. Kein automatischer Provider-/Netzwerk-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Real Provider Gate Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_real_provider_invocation_gate_human_approval_required</li><li>humanApprovalRequired=true</li><li>humanApproved=false</li><li>approvalTokenIssued=false</li><li>providerSelectionAllowed=false</li><li>provider=none</li><li>modelSelected=none</li><li>automaticInvocationAllowed=false</li><li>networkCallAllowed=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx";
 if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "real-provider-gate-dashboard"')){
   const line='  { href: "/real-provider-gate-dashboard", label: "Real Gate Dashboard", key: "real-provider-gate-dashboard" },';
   const markers=[
    '{ href: "/real-provider-gate-policy", label: "Real Gate Policy", key: "real-provider-gate-policy" },',
    '{ href: "/controlled-real-provider-invocation-gate", label: "Real Provider Gate", key: "controlled-real-provider-invocation-gate" },'
   ];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Real Gate Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Real Gate Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx";
 if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/real-provider-gate-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Real Provider Gate</h2><p>Gate und Policy für echte Provider Invocation mit Human Approval Required.</p><a className="secondary-button" href="/real-provider-gate-dashboard">Real Provider Gate Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Real Provider Gate Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Real Provider Gate Dashboard","http://localhost:3000/real-provider-gate-dashboard"],
 ["UI Controlled Real Provider Gate","http://localhost:3000/controlled-real-provider-invocation-gate"],
 ["UI Real Provider Gate Policy","http://localhost:3000/real-provider-gate-policy"],
 ["API Controlled Real Provider Gate","http://localhost:3000/api/controlled-real-provider-invocation-gate"],
 ["API Real Provider Gate Policy","http://localhost:3000/api/real-provider-gate-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 26.2 Real Provider Gate Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Real Provider Gate URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase26-2-real-provider-gate-dashboard-smoke.md", `# Phase 26.2 – Real Provider Gate Dashboard & Smoke

## Ziel
Controlled Real Provider Invocation Gates und Real Provider Gate Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /real-provider-gate-dashboard

## Enthalten
- Controlled Real Provider Invocation Gates
- Real Provider Gate Policy Simulations
- Controlled Provider Invocation Simulation Envelopes
- Governance Audit

## Sicherheitsprinzip
- controlled_real_provider_invocation_gate_human_approval_required
- Human Approval zwingend
- humanApprovalRequired=true
- humanApproved=false
- approvalTokenIssued=false
- providerSelectionAllowed=false
- provider=none
- modelSelected=none
- automaticInvocationAllowed=false
- networkCallAllowed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- dryRunOnly=true

## Nächster Schritt
Phase 26.3 kann Final Real Provider Gate Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase26-real-provider-gate-dashboard-smoke-runbook.md", `# Runbook – Phase 26.2 Real Provider Gate Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase26:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase26-2-patch-real-provider-gate-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase26:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase26:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/real-provider-gate-dashboard/page.tsx", page);
ensureFile("scripts/phase26-2-real-provider-gate-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 26.2 Patch abgeschlossen.");
