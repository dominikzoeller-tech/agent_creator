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
  pkg.scripts["phase19:2:patch"]="node scripts/phase19-2-patch-real-llm-gate-dashboard-smoke.cjs";
  pkg.scripts["phase19:2:verify"]="node scripts/phase19-2-verify-real-llm-gate-dashboard-smoke.cjs";
  pkg.scripts["phase19:2:smoke"]="node scripts/phase19-2-real-llm-gate-dashboard-smoke.cjs";
  pkg.scripts["llm:real-gate:release:check"]="npm run phase19:0:verify && npm run phase19:1:verify && npm run phase19:2:verify && npm run phase19:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 19.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function RealLlmGateDashboardPage(){
  const [stubResponses,setStubResponses]=useState<ApiState>({});
  const [gates,setGates]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [r,g,p,a]=await Promise.all([
        fetchJson("/api/llm-stub-response?limit=200"),
        fetchJson("/api/real-llm-call-gate?limit=200"),
        fetchJson("/api/real-llm-gate-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setStubResponses({summary:r.summary,items:r.responses||[]});
      setGates({summary:g.summary,items:g.gates||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Stub Responses", stubResponses, "/llm-stub-response"],
    ["Real LLM Call Gates", gates, "/real-llm-call-gate"],
    ["Gate Policy Simulations", policy, "/real-llm-gate-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="real-llm-gate-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)",borderColor:"#fdba74"}}><h1 className="section-title">Real LLM Gate Dashboard</h1><p style={{lineHeight:1.6}}>Phase 19.2 fasst Stub Responses, Real LLM Call Gates, Gate Policy Simulationen und Audit zusammen. Kein produktiver LLM-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Real LLM Gate Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>policyGateRequired=true</li><li>Kein produktiver LLM-Aufruf.</li><li>Secret Scan, Output Contract und Audit bleiben Pflicht vor echter Invocation.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content;
 if(!content.includes('key: "real-llm-gate-dashboard"')){ const marker='{ href: "/real-llm-gate-policy", label: "Real LLM Policy", key: "real-llm-gate-policy" },'; const line='  { href: "/real-llm-gate-dashboard", label: "Real LLM Dashboard", key: "real-llm-gate-dashboard" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Real LLM Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Real LLM Dashboard bereits vorhanden.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return; let content=read(file); const original=content;
 if(!content.includes('/real-llm-gate-dashboard')){ content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Real LLM Gate</h2><p>Policy-gated Real LLM Invocation Prep ohne produktiven LLM-Aufruf.</p><a className="secondary-button" href="/real-llm-gate-dashboard">Real LLM Gate Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>'); }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Real LLM Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Real LLM Gate Dashboard","http://localhost:3000/real-llm-gate-dashboard"],
 ["UI Real LLM Call Gate","http://localhost:3000/real-llm-call-gate"],
 ["UI Real LLM Gate Policy","http://localhost:3000/real-llm-gate-policy"],
 ["API Real LLM Call Gate","http://localhost:3000/api/real-llm-call-gate"],
 ["API Real LLM Gate Policy","http://localhost:3000/api/real-llm-gate-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 19.2 Real LLM Gate Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Real LLM Gate URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase19-2-real-llm-gate-dashboard-smoke.md", `# Phase 19.2 – Real LLM Gate Dashboard & Smoke

## Ziel
Real LLM Call Gates und Real LLM Gate Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /real-llm-gate-dashboard

## Enthalten
- Stub Responses
- Real LLM Call Gates
- Real LLM Gate Policy Simulations
- Governance Audit

## Sicherheitsprinzip
- kein produktiver LLM-Aufruf
- realLlmCallAllowed=false
- llmCallPerformed=false
- policyGateRequired=true
- Secret Scan, Output Contract und Audit bleiben Pflicht vor echter Invocation
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 19.3 kann Final Real LLM Gate Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase19-real-llm-gate-dashboard-smoke-runbook.md", `# Runbook – Phase 19.2 Real LLM Gate Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase19:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase19-2-patch-real-llm-gate-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase19:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase19:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/real-llm-gate-dashboard/page.tsx", page);
ensureFile("scripts/phase19-2-real-llm-gate-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 19.2 Patch abgeschlossen.");
