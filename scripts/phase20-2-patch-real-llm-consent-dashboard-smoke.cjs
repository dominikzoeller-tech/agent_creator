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
  pkg.scripts["phase20:2:patch"]="node scripts/phase20-2-patch-real-llm-consent-dashboard-smoke.cjs";
  pkg.scripts["phase20:2:verify"]="node scripts/phase20-2-verify-real-llm-consent-dashboard-smoke.cjs";
  pkg.scripts["phase20:2:smoke"]="node scripts/phase20-2-real-llm-consent-dashboard-smoke.cjs";
  pkg.scripts["llm:real-consent:release:check"]="npm run phase20:0:verify && npm run phase20:1:verify && npm run phase20:2:verify && npm run phase20:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 20.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function RealLlmConsentDashboardPage(){
  const [gates,setGates]=useState<ApiState>({});
  const [consentRequests,setConsentRequests]=useState<ApiState>({});
  const [decisions,setDecisions]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [g,c,d,a]=await Promise.all([
        fetchJson("/api/real-llm-call-gate?limit=200"),
        fetchJson("/api/real-llm-consent?limit=200"),
        fetchJson("/api/real-llm-consent-decision?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setGates({summary:g.summary,items:g.gates||[]});
      setConsentRequests({summary:c.summary,items:c.consentRequests||[]});
      setDecisions({summary:d.summary,items:d.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Real LLM Call Gates", gates, "/real-llm-call-gate"],
    ["Consent Requests", consentRequests, "/real-llm-consent"],
    ["Consent Decision Simulations", decisions, "/real-llm-consent-decision"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="real-llm-consent-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)",borderColor:"#93c5fd"}}><h1 className="section-title">Real LLM Consent Dashboard</h1><p style={{lineHeight:1.6}}>Phase 20.2 fasst Real LLM Gates, Consent Requests, Consent Decision Simulationen und Audit zusammen. Kein produktiver LLM-Aufruf ohne explizite Freigabe.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Real LLM Consent Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>consentRequired=true</li><li>humanApprovalRequired=true</li><li>simulatedDecision=pending_review_only</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>Kein produktiver LLM-Aufruf ohne explizite Freigabe.</li><li>Secret Scan, Output Contract und Audit bleiben Pflicht.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content;
 if(!content.includes('key: "real-llm-consent-dashboard"')){ const marker='{ href: "/real-llm-consent-decision", label: "Consent Decision", key: "real-llm-consent-decision" },'; const line='  { href: "/real-llm-consent-dashboard", label: "Consent Dashboard", key: "real-llm-consent-dashboard" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Consent Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Consent Dashboard bereits vorhanden.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return; let content=read(file); const original=content;
 if(!content.includes('/real-llm-consent-dashboard')){ content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Real LLM Consent</h2><p>Human Approval Gate für spätere echte LLM-Aufrufe.</p><a className="secondary-button" href="/real-llm-consent-dashboard">Consent Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>'); }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Consent Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Real LLM Consent Dashboard","http://localhost:3000/real-llm-consent-dashboard"],
 ["UI Real LLM Consent","http://localhost:3000/real-llm-consent"],
 ["UI Real LLM Consent Decision","http://localhost:3000/real-llm-consent-decision"],
 ["API Real LLM Consent","http://localhost:3000/api/real-llm-consent"],
 ["API Real LLM Consent Decision","http://localhost:3000/api/real-llm-consent-decision"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 20.2 Real LLM Consent Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Real LLM Consent URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase20-2-real-llm-consent-dashboard-smoke.md", `# Phase 20.2 – Real LLM Consent Dashboard & Smoke

## Ziel
Real LLM Consent Requests und Consent Decision Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /real-llm-consent-dashboard

## Enthalten
- Real LLM Call Gates
- Real LLM Consent Requests
- Real LLM Consent Decision Simulations
- Governance Audit

## Sicherheitsprinzip
- kein produktiver LLM-Aufruf ohne explizite Nutzerfreigabe
- consentRequired=true
- humanApprovalRequired=true
- simulatedDecision=pending_review_only
- realLlmCallAllowed=false
- llmCallPerformed=false
- Secret Scan, Output Contract und Audit bleiben Pflicht
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 20.3 kann Final Real LLM Consent Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase20-real-llm-consent-dashboard-smoke-runbook.md", `# Runbook – Phase 20.2 Real LLM Consent Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase20:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase20-2-patch-real-llm-consent-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase20:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase20:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/real-llm-consent-dashboard/page.tsx", page);
ensureFile("scripts/phase20-2-real-llm-consent-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 20.2 Patch abgeschlossen.");
