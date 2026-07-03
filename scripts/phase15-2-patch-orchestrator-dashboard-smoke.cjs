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
  pkg.scripts["phase15:2:patch"]="node scripts/phase15-2-patch-orchestrator-dashboard-smoke.cjs";
  pkg.scripts["phase15:2:verify"]="node scripts/phase15-2-verify-orchestrator-dashboard-smoke.cjs";
  pkg.scripts["phase15:2:smoke"]="node scripts/phase15-2-orchestrator-dashboard-smoke.cjs";
  pkg.scripts["orchestrator:release:check"]="npm run phase15:0:verify && npm run phase15:1:verify && npm run phase15:2:verify && npm run phase15:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 15.2 Scripts eingetragen.");
}
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState={summary?:any;items?:any[];error?:string};
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function MasterOrchestratorDashboardPage(){
 const [actions,setActions]=useState<ApiState>({}); const [plans,setPlans]=useState<ApiState>({}); const [policy,setPolicy]=useState<ApiState>({}); const [audit,setAudit]=useState<ApiState>({}); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [a,p,s,g]=await Promise.all([fetchJson("/api/cockpit-actions?limit=200"),fetchJson("/api/master-orchestrator?limit=200"),fetchJson("/api/master-orchestrator-policy?limit=200"),fetchJson("/api/governance-audit?limit=200")]); setActions({summary:a.summary,items:a.plans||[]}); setPlans({summary:p.summary,items:p.plans||[]}); setPolicy({summary:s.summary,items:s.simulations||[]}); setAudit({summary:g.summary,items:g.events||[]}); } catch(e){ setError(e instanceof Error?e.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 const cards=[ ["Cockpit Actions",actions,"/cockpit-actions"], ["Orchestration Plans",plans,"/master-orchestrator"], ["Policy Simulations",policy,"/master-orchestrator-policy"], ["Governance Audit",audit,"/governance-audit"] ] as const;
 return <main className="page-wrap"><UnifiedNavigation active="master-orchestrator-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#eef2ff 0%,#f8fafc 100%)",borderColor:"#a5b4fc"}}><h1 className="section-title">Master Orchestrator Dashboard</h1><p style={{lineHeight:1.6}}>Phase 15.2 fasst Cockpit Actions, Orchestration Plans, Policy Simulationen und Audit zusammen. Keine echte Tool- oder Agent-Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Orchestrator Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li><li>Consent/Policy/Audit bleiben vor echter Ausführung verpflichtend.</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content;
 if(!content.includes('key: "master-orchestrator-dashboard"')){ const marker='{ href: "/master-orchestrator-policy", label: "Orch Policy", key: "master-orchestrator-policy" },'; const line='  { href: "/master-orchestrator-dashboard", label: "Orch Dashboard", key: "master-orchestrator-dashboard" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Orchestrator Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Orchestrator Dashboard bereits vorhanden.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return; let content=read(file); const original=content;
 if(!content.includes('/master-orchestrator-dashboard')){ content=content.replace('<a className="primary-button" href="/master-orchestrator">Orchestrator öffnen</a>', '<a className="primary-button" href="/master-orchestrator">Orchestrator öffnen</a> <a className="secondary-button" href="/master-orchestrator-dashboard">Orchestrator Dashboard</a>'); }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Orchestrator Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Master Cockpit","http://localhost:3000/master-cockpit"],
 ["UI Master Orchestrator Dashboard","http://localhost:3000/master-orchestrator-dashboard"],
 ["UI Master Orchestrator","http://localhost:3000/master-orchestrator"],
 ["UI Master Orchestrator Policy","http://localhost:3000/master-orchestrator-policy"],
 ["API Cockpit Actions","http://localhost:3000/api/cockpit-actions"],
 ["API Master Orchestrator","http://localhost:3000/api/master-orchestrator"],
 ["API Master Orchestrator Policy","http://localhost:3000/api/master-orchestrator-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 15.2 Orchestrator Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Orchestrator Dashboard URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase15-2-orchestrator-dashboard-smoke.md", `# Phase 15.2 – Orchestrator Dashboard & Smoke

## Ziel
Phase 15.2 fasst Master-Agent-Orchestrierung in einem Dashboard zusammen und ergänzt Smoke-Checks.

## Neue UI
- /master-orchestrator-dashboard

## Enthalten
- Cockpit Actions
- Orchestration Plans
- Policy Simulations
- Governance Audit

## Sicherheitsprinzip
- keine echte Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 15.3 kann Final Orchestrator Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase15-orchestrator-dashboard-smoke-runbook.md", `# Runbook – Phase 15.2 Orchestrator Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase15:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase15-2-patch-orchestrator-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase15:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase15:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/master-orchestrator-dashboard/page.tsx", page);
ensureFile("scripts/phase15-2-orchestrator-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 15.2 Patch abgeschlossen.");
