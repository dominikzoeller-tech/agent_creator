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
  pkg.scripts["phase16:2:patch"]="node scripts/phase16-2-patch-planner-dashboard-smoke.cjs";
  pkg.scripts["phase16:2:verify"]="node scripts/phase16-2-verify-planner-dashboard-smoke.cjs";
  pkg.scripts["phase16:2:smoke"]="node scripts/phase16-2-planner-dashboard-smoke.cjs";
  pkg.scripts["planner:release:check"]="npm run phase16:0:verify && npm run phase16:1:verify && npm run phase16:2:verify && npm run phase16:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 16.2 Scripts eingetragen.");
}
const page=String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState={summary?:any;items?:any[]};
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function MasterPlannerDashboardPage(){
 const [orchestrations,setOrchestrations]=useState<ApiState>({}); const [recommendations,setRecommendations]=useState<ApiState>({}); const [policy,setPolicy]=useState<ApiState>({}); const [audit,setAudit]=useState<ApiState>({}); const [error,setError]=useState<string|null>(null);
 async function load(){ setError(null); try{ const [o,r,p,a]=await Promise.all([fetchJson("/api/master-orchestrator?limit=200"),fetchJson("/api/master-planner?limit=200"),fetchJson("/api/master-planner-policy?limit=200"),fetchJson("/api/governance-audit?limit=200")]); setOrchestrations({summary:o.summary,items:o.plans||[]}); setRecommendations({summary:r.summary,items:r.recommendations||[]}); setPolicy({summary:p.summary,items:p.simulations||[]}); setAudit({summary:a.summary,items:a.events||[]}); } catch(e){ setError(e instanceof Error?e.message:"Unbekannter Fehler"); } }
 useEffect(()=>{ load(); },[]);
 const cards=[ ["Orchestration Plans",orchestrations,"/master-orchestrator"], ["Planner Recommendations",recommendations,"/master-planner"], ["Planner Policy Simulations",policy,"/master-planner-policy"], ["Governance Audit",audit,"/governance-audit"] ] as const;
 return <main className="page-wrap"><UnifiedNavigation active="master-planner-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)",borderColor:"#67e8f9"}}><h1 className="section-title">Master Planner Dashboard</h1><p style={{lineHeight:1.6}}>Phase 16.2 fasst Orchestration Plans, Planner Recommendations, Planner Policy Simulationen und Audit zusammen. Weiterhin nur LLM-Routing-Prep, keine echte Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Planner Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li><li>llmRoutingPrepOnly=true</li><li>Keine echte Tool- oder Agent-Ausführung.</li></ul></section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "master-planner-dashboard"')){ const marker='{ href: "/master-planner-policy", label: "Planner Policy", key: "master-planner-policy" },'; const line='  { href: "/master-planner-dashboard", label: "Planner Dashboard", key: "master-planner-dashboard" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Planner Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Planner Dashboard bereits vorhanden."); }
function patchCockpit(){ const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return; let content=read(file); const original=content; if(!content.includes('/master-planner-dashboard')){ content=content.replace('<a className="secondary-button" href="/master-planner">Planner</a>', '<a className="secondary-button" href="/master-planner">Planner</a> <a className="secondary-button" href="/master-planner-dashboard">Planner Dashboard</a>'); } if(content!==original){ write(file, content); console.log("OK master-cockpit: Planner Dashboard Link ergänzt."); } }
const smoke=String.raw`const endpoints=[
 ["UI Master Planner Dashboard","http://localhost:3000/master-planner-dashboard"],
 ["UI Master Planner","http://localhost:3000/master-planner"],
 ["UI Master Planner Policy","http://localhost:3000/master-planner-policy"],
 ["API Master Planner","http://localhost:3000/api/master-planner"],
 ["API Master Planner Policy","http://localhost:3000/api/master-planner-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 16.2 Planner Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Planner Dashboard URLs sind erreichbar."); }
main();
`;
function patchDocs(){ ensureFile("phase16-2-planner-dashboard-smoke.md", `# Phase 16.2 – Planner Dashboard & Smoke

## Ziel
Planner Recommendations und Planner Policy Simulationen werden zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /master-planner-dashboard

## Enthalten
- Orchestration Plans
- Planner Recommendations
- Planner Policy Simulations
- Governance Audit

## Sicherheitsprinzip
- keine echte Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true
- llmRoutingPrepOnly=true

## Nächster Schritt
Phase 16.3 kann Final Planner Handoff / Release Summary vorbereiten.
`);
ensureFile("docs/phase16-planner-dashboard-smoke-runbook.md", `# Runbook – Phase 16.2 Planner Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase16:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase16-2-patch-planner-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase16:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase16:2:smoke
\`\`\`
`); }
patchPackage();
ensureFile("frontend/app/master-planner-dashboard/page.tsx", page);
ensureFile("scripts/phase16-2-planner-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 16.2 Patch abgeschlossen.");
