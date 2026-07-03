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
  pkg.scripts["phase17:2:patch"]="node scripts/phase17-2-patch-llm-routing-dashboard-smoke.cjs";
  pkg.scripts["phase17:2:verify"]="node scripts/phase17-2-verify-llm-routing-dashboard-smoke.cjs";
  pkg.scripts["phase17:2:smoke"]="node scripts/phase17-2-llm-routing-dashboard-smoke.cjs";
  pkg.scripts["llm:routing:release:check"]="npm run phase17:0:verify && npm run phase17:1:verify && npm run phase17:2:verify && npm run phase17:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 17.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function LlmRoutingDashboardPage(){
  const [recommendations,setRecommendations]=useState<ApiState>({});
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [r,e,p,a]=await Promise.all([
        fetchJson("/api/master-planner?limit=200"),
        fetchJson("/api/llm-routing-envelope?limit=200"),
        fetchJson("/api/llm-routing-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setRecommendations({summary:r.summary,items:r.recommendations||[]});
      setEnvelopes({summary:e.summary,items:e.envelopes||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards = [
    ["Planner Recommendations", recommendations, "/master-planner"],
    ["LLM Routing Envelopes", envelopes, "/llm-routing-envelope"],
    ["LLM Routing Policy", policy, "/llm-routing-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="llm-routing-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0f9ff 0%,#f8fafc 100%)",borderColor:"#7dd3fc"}}><h1 className="section-title">LLM Routing Dashboard</h1><p style={{lineHeight:1.6}}>Phase 17.2 fasst Planner Recommendations, Controlled LLM Routing Envelopes, Policy Simulationen und Audit zusammen. Kein LLM-Aufruf, keine echte Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>LLM Routing Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>Kein LLM-Aufruf in Phase 17.2.</li><li>Keine echte Tool- oder Agent-Ausführung.</li><li>Sanitized Context only.</li><li>Output Contract bleibt recommendation_explanation_only.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li><li>llmRoutingPrepOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "llm-routing-dashboard"')){
    const marker='{ href: "/llm-routing-policy", label: "LLM Policy", key: "llm-routing-policy" },';
    const line='  { href: "/llm-routing-dashboard", label: "LLM Dashboard", key: "llm-routing-dashboard" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line);
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: LLM Dashboard Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: LLM Dashboard bereits vorhanden.");
}
function patchCockpit(){
  const file="frontend/app/master-cockpit/page.tsx";
  if(!exists(file)) return;
  let content=read(file); const original=content;
  if(!content.includes('/llm-routing-dashboard')){
    if(content.includes('/llm-routing-envelope')) content=content.replace('<a className="secondary-button" href="/llm-routing-envelope">LLM Routing</a>', '<a className="secondary-button" href="/llm-routing-envelope">LLM Routing</a> <a className="secondary-button" href="/llm-routing-dashboard">LLM Dashboard</a>');
    else content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>LLM Routing</h2><p>Kontrollierte LLM Routing Envelopes und Policy Simulationen.</p><a className="secondary-button" href="/llm-routing-dashboard">LLM Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
  }
  if(content!==original){ write(file, content); console.log("OK master-cockpit: LLM Dashboard Link ergänzt."); }
}
const smoke = String.raw`const endpoints=[
 ["UI LLM Routing Dashboard","http://localhost:3000/llm-routing-dashboard"],
 ["UI LLM Routing Envelope","http://localhost:3000/llm-routing-envelope"],
 ["UI LLM Routing Policy","http://localhost:3000/llm-routing-policy"],
 ["API LLM Routing Envelope","http://localhost:3000/api/llm-routing-envelope"],
 ["API LLM Routing Policy","http://localhost:3000/api/llm-routing-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 17.2 LLM Routing Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. LLM Routing URLs sind erreichbar."); }
main();
`;
function patchDocs(){
  ensureFile("phase17-2-llm-routing-dashboard-smoke.md", `# Phase 17.2 – LLM Routing Dashboard & Smoke

## Ziel
Controlled LLM Routing Envelopes und LLM Routing Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /llm-routing-dashboard

## Enthalten
- Planner Recommendations
- Controlled LLM Routing Envelopes
- LLM Routing Policy Simulations
- Governance Audit

## Sicherheitsprinzip
- kein LLM-Aufruf
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- Sanitized Context only
- Output Contract: recommendation_explanation_only
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true
- llmRoutingPrepOnly=true

## Nächster Schritt
Phase 17.3 kann Final LLM Routing Handoff / Release Summary vorbereiten.
`);
  ensureFile("docs/phase17-llm-routing-dashboard-smoke-runbook.md", `# Runbook – Phase 17.2 LLM Routing Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase17:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase17-2-patch-llm-routing-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase17:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase17:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/llm-routing-dashboard/page.tsx", page);
ensureFile("scripts/phase17-2-llm-routing-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 17.2 Patch abgeschlossen.");
