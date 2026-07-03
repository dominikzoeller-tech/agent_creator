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
  pkg.scripts["phase18:2:patch"]="node scripts/phase18-2-patch-llm-stub-dashboard-smoke.cjs";
  pkg.scripts["phase18:2:verify"]="node scripts/phase18-2-verify-llm-stub-dashboard-smoke.cjs";
  pkg.scripts["phase18:2:smoke"]="node scripts/phase18-2-llm-stub-dashboard-smoke.cjs";
  pkg.scripts["llm:stub:release:check"]="npm run phase18:0:verify && npm run phase18:1:verify && npm run phase18:2:verify && npm run phase18:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 18.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function LlmStubDashboardPage(){
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [responses,setResponses]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [e,r,p,a]=await Promise.all([
        fetchJson("/api/llm-routing-envelope?limit=200"),
        fetchJson("/api/llm-stub-response?limit=200"),
        fetchJson("/api/llm-stub-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setEnvelopes({summary:e.summary,items:e.envelopes||[]});
      setResponses({summary:r.summary,items:r.responses||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards = [
    ["LLM Routing Envelopes", envelopes, "/llm-routing-envelope"],
    ["Stub Responses", responses, "/llm-stub-response"],
    ["Stub Policy Simulations", policy, "/llm-stub-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="llm-stub-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">LLM Stub Dashboard</h1><p style={{lineHeight:1.6}}>Phase 18.2 fasst Controlled LLM Routing Envelopes, Dry-run Explainer Responses, Stub Policy Simulationen und Audit zusammen. Kein LLM-Aufruf, keine echte Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Stub Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>llmCallPerformed=false</li><li>stubOnly=true</li><li>Kein produktiver LLM-Aufruf.</li><li>Keine echte Tool- oder Agent-Ausführung.</li><li>Output bleibt Erklärung/Empfehlung.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content; if(!content.includes('key: "llm-stub-dashboard"')){ const marker='{ href: "/llm-stub-policy", label: "Stub Policy", key: "llm-stub-policy" },'; const line='  { href: "/llm-stub-dashboard", label: "Stub Dashboard", key: "llm-stub-dashboard" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); } if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Stub Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Stub Dashboard bereits vorhanden."); }
function patchCockpit(){ const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return; let content=read(file); const original=content; if(!content.includes('/llm-stub-dashboard')){ content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>LLM Stub</h2><p>Dry-run Explainer Responses und Stub Policy Simulationen.</p><a className="secondary-button" href="/llm-stub-dashboard">Stub Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>'); } if(content!==original){ write(file, content); console.log("OK master-cockpit: Stub Dashboard Link ergänzt."); } }
const smoke = String.raw`const endpoints=[
 ["UI LLM Stub Dashboard","http://localhost:3000/llm-stub-dashboard"],
 ["UI LLM Stub Response","http://localhost:3000/llm-stub-response"],
 ["UI LLM Stub Policy","http://localhost:3000/llm-stub-policy"],
 ["API LLM Stub Response","http://localhost:3000/api/llm-stub-response"],
 ["API LLM Stub Policy","http://localhost:3000/api/llm-stub-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 18.2 LLM Stub Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. LLM Stub URLs sind erreichbar."); }
main();
`;
function patchDocs(){ ensureFile("phase18-2-llm-stub-dashboard-smoke.md", `# Phase 18.2 – LLM Stub Dashboard & Smoke

## Ziel
Dry-run Explainer Responses und Stub Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /llm-stub-dashboard

## Enthalten
- Controlled LLM Routing Envelopes
- Dry-run Explainer Responses
- Stub Policy Simulations
- Governance Audit

## Sicherheitsprinzip
- kein produktiver LLM-Aufruf
- llmCallPerformed=false
- stubOnly=true
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- Output bleibt Erklärung/Empfehlung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 18.3 kann Final LLM Stub Handoff / Release Summary vorbereiten.
`);
ensureFile("docs/phase18-llm-stub-dashboard-smoke-runbook.md", `# Runbook – Phase 18.2 LLM Stub Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase18:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase18-2-patch-llm-stub-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase18:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase18:2:smoke
\`\`\`
`); }
patchPackage();
ensureFile("frontend/app/llm-stub-dashboard/page.tsx", page);
ensureFile("scripts/phase18-2-llm-stub-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 18.2 Patch abgeschlossen.");
