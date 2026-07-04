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
  pkg.scripts["phase23:2:patch"]="node scripts/phase23-2-patch-provider-config-dashboard-smoke.cjs";
  pkg.scripts["phase23:2:verify"]="node scripts/phase23-2-verify-provider-config-dashboard-smoke.cjs";
  pkg.scripts["phase23:2:smoke"]="node scripts/phase23-2-provider-config-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-config:release:check"]="npm run phase23:0:verify && npm run phase23:1:verify && npm run phase23:2:verify && npm run phase23:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 23.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderConfigDashboardPage(){
  const [boundary,setBoundary]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [adapter,setAdapter]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [b,p,a,ga]=await Promise.all([
        fetchJson("/api/provider-config-secret-boundary?limit=200"),
        fetchJson("/api/provider-config-policy?limit=200"),
        fetchJson("/api/provider-llm-adapter-stub?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setBoundary({summary:b.summary,items:b.boundaryChecks||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAdapter({summary:a.summary,items:a.adapterStubs||[]});
      setAudit({summary:ga.summary,items:ga.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Secret Boundary Checks", boundary, "/provider-config-secret-boundary"],
    ["Provider Config Policy", policy, "/provider-config-policy"],
    ["Provider Adapter Stubs", adapter, "/provider-llm-adapter-stub"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-config-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)",borderColor:"#fdba74"}}><h1 className="section-title">Provider Config Dashboard</h1><p style={{lineHeight:1.6}}>Phase 23.2 fasst Provider Config Secret Boundary Checks, Provider Config Policy Simulationen, Provider Adapter Stubs und Audit zusammen. Keine Secrets und keine Provider-/Netzwerk-Aufrufe.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Config Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>secret_boundary_presence_metadata_only</li><li>noSecretValuesStored=true</li><li>noSecretValuesExposed=true</li><li>nur Presence-/Metadata-Checks</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>keine Tool-Ausführung</li><li>keine Agent-Ausführung</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx";
 if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "provider-config-dashboard"')){
   const line='  { href: "/provider-config-dashboard", label: "Provider Config Dashboard", key: "provider-config-dashboard" },';
   const markers=[
    '{ href: "/provider-config-policy", label: "Provider Config Policy", key: "provider-config-policy" },',
    '{ href: "/provider-config-secret-boundary", label: "Secret Boundary", key: "provider-config-secret-boundary" },'
   ];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Config Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Config Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx";
 if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/provider-config-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Provider Config</h2><p>Secret Boundary und Provider Config Presence Checks ohne Secret Exposure.</p><a className="secondary-button" href="/provider-config-dashboard">Provider Config Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Provider Config Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Provider Config Dashboard","http://localhost:3000/provider-config-dashboard"],
 ["UI Provider Config Secret Boundary","http://localhost:3000/provider-config-secret-boundary"],
 ["UI Provider Config Policy","http://localhost:3000/provider-config-policy"],
 ["API Provider Config Secret Boundary","http://localhost:3000/api/provider-config-secret-boundary"],
 ["API Provider Config Policy","http://localhost:3000/api/provider-config-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 23.2 Provider Config Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Config URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase23-2-provider-config-dashboard-smoke.md", `# Phase 23.2 – Provider Config Dashboard & Smoke

## Ziel
Provider Config Secret Boundary Checks und Provider Config Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /provider-config-dashboard

## Enthalten
- Provider Config Secret Boundary Checks
- Provider Config Policy Simulations
- Provider Adapter Stubs
- Governance Audit

## Sicherheitsprinzip
- secret_boundary_presence_metadata_only
- keine Secrets in UI, Logs oder JSONL Stores
- noSecretValuesStored=true
- noSecretValuesExposed=true
- nur Presence-/Metadata-Checks für ENV Variablen
- kein externer Netzwerk-/Provider-Aufruf
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
Phase 23.3 kann Final Provider Config Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase23-provider-config-dashboard-smoke-runbook.md", `# Runbook – Phase 23.2 Provider Config Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase23:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase23-2-patch-provider-config-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase23:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase23:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/provider-config-dashboard/page.tsx", page);
ensureFile("scripts/phase23-2-provider-config-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 23.2 Patch abgeschlossen.");
