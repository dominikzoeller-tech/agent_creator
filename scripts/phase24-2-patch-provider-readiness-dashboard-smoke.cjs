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
  pkg.scripts["phase24:2:patch"]="node scripts/phase24-2-patch-provider-readiness-dashboard-smoke.cjs";
  pkg.scripts["phase24:2:verify"]="node scripts/phase24-2-verify-provider-readiness-dashboard-smoke.cjs";
  pkg.scripts["phase24:2:smoke"]="node scripts/phase24-2-provider-readiness-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-readiness:release:check"]="npm run phase24:0:verify && npm run phase24:1:verify && npm run phase24:2:verify && npm run phase24:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 24.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderReadinessDashboardPage(){
  const [preflights,setPreflights]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [config,setConfig]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [p,pol,c,a]=await Promise.all([
        fetchJson("/api/provider-invocation-readiness-preflight?limit=200"),
        fetchJson("/api/provider-readiness-policy?limit=200"),
        fetchJson("/api/provider-config-secret-boundary?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setPreflights({summary:p.summary,items:p.preflights||[]});
      setPolicy({summary:pol.summary,items:pol.simulations||[]});
      setConfig({summary:c.summary,items:c.boundaryChecks||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Readiness Preflights", preflights, "/provider-invocation-readiness-preflight"],
    ["Readiness Policy Simulations", policy, "/provider-readiness-policy"],
    ["Provider Config Boundary", config, "/provider-config-secret-boundary"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-readiness-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)",borderColor:"#93c5fd"}}><h1 className="section-title">Provider Readiness Dashboard</h1><p style={{lineHeight:1.6}}>Phase 24.2 fasst Provider Invocation Readiness Preflights, Readiness Policy Simulationen, Provider Config Boundary und Audit zusammen. Kein Provider-/Netzwerk-Aufruf und kein produktiver LLM-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Readiness Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>provider_invocation_readiness_preflight_no_provider_call</li><li>Operational Defaults nur Metadata</li><li>Output Contract locked</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>keine Tool-Ausführung</li><li>keine Agent-Ausführung</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx";
 if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "provider-readiness-dashboard"')){
   const line='  { href: "/provider-readiness-dashboard", label: "Readiness Dashboard", key: "provider-readiness-dashboard" },';
   const markers=[
    '{ href: "/provider-readiness-policy", label: "Readiness Policy", key: "provider-readiness-policy" },',
    '{ href: "/provider-invocation-readiness-preflight", label: "Provider Readiness", key: "provider-invocation-readiness-preflight" },'
   ];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Readiness Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Readiness Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx";
 if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/provider-readiness-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Provider Readiness</h2><p>Readiness Preflight und Policy ohne Provider-/Netzwerk-Aufruf.</p><a className="secondary-button" href="/provider-readiness-dashboard">Provider Readiness Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Provider Readiness Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Provider Readiness Dashboard","http://localhost:3000/provider-readiness-dashboard"],
 ["UI Provider Invocation Readiness Preflight","http://localhost:3000/provider-invocation-readiness-preflight"],
 ["UI Provider Readiness Policy","http://localhost:3000/provider-readiness-policy"],
 ["API Provider Invocation Readiness Preflight","http://localhost:3000/api/provider-invocation-readiness-preflight"],
 ["API Provider Readiness Policy","http://localhost:3000/api/provider-readiness-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 24.2 Provider Readiness Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Readiness URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase24-2-provider-readiness-dashboard-smoke.md", `# Phase 24.2 – Provider Readiness Dashboard & Smoke

## Ziel
Provider Invocation Readiness Preflights und Readiness Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /provider-readiness-dashboard

## Enthalten
- Provider Invocation Readiness Preflights
- Provider Readiness Policy Simulations
- Provider Config Boundary Checks
- Governance Audit

## Sicherheitsprinzip
- provider_invocation_readiness_preflight_no_provider_call
- kein Provider-/Netzwerk-Aufruf
- kein produktiver LLM-Aufruf
- Operational Defaults nur Metadata
- Output Contract locked
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
Phase 24.3 kann Final Provider Readiness Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase24-provider-readiness-dashboard-smoke-runbook.md", `# Runbook – Phase 24.2 Provider Readiness Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase24:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase24-2-patch-provider-readiness-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase24:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase24:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/provider-readiness-dashboard/page.tsx", page);
ensureFile("scripts/phase24-2-provider-readiness-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 24.2 Patch abgeschlossen.");
