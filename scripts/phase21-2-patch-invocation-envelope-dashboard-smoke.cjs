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
  pkg.scripts["phase21:2:patch"]="node scripts/phase21-2-patch-invocation-envelope-dashboard-smoke.cjs";
  pkg.scripts["phase21:2:verify"]="node scripts/phase21-2-verify-invocation-envelope-dashboard-smoke.cjs";
  pkg.scripts["phase21:2:smoke"]="node scripts/phase21-2-invocation-envelope-dashboard-smoke.cjs";
  pkg.scripts["llm:approved-envelope:release:check"]="npm run phase21:0:verify && npm run phase21:1:verify && npm run phase21:2:verify && npm run phase21:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 21.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function InvocationEnvelopeDashboardPage(){
  const [consentRequests,setConsentRequests]=useState<ApiState>({});
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [c,e,p,a]=await Promise.all([
        fetchJson("/api/real-llm-consent?limit=200"),
        fetchJson("/api/approved-real-llm-invocation-envelope?limit=200"),
        fetchJson("/api/approved-real-llm-invocation-envelope-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setConsentRequests({summary:c.summary,items:c.consentRequests||[]});
      setEnvelopes({summary:e.summary,items:e.invocationEnvelopes||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    } catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Consent Requests", consentRequests, "/real-llm-consent"],
    ["Invocation Envelopes", envelopes, "/approved-real-llm-invocation-envelope"],
    ["Envelope Policy Simulations", policy, "/approved-real-llm-invocation-envelope-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="approved-real-llm-invocation-envelope-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)",borderColor:"#67e8f9"}}><h1 className="section-title">Invocation Envelope Dashboard</h1><p style={{lineHeight:1.6}}>Phase 21.2 fasst Consent Requests, Approved Invocation Envelopes, Envelope Policy Simulationen und Audit zusammen. Kein produktiver LLM-Aufruf und keine Tool-/Agent-Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Invocation Envelope Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>approved_invocation_envelope_prep_only</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>consentRequired=true</li><li>humanApprovalRequired=true</li><li>Output Contract locked</li><li>finaler Secret Scan</li><li>Kein produktiver LLM-Aufruf.</li><li>Keine Tool-Ausführung.</li><li>Keine Agent-Ausführung.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); const original=content;
 if(!content.includes('key: "approved-real-llm-invocation-envelope-dashboard"')){ const marker='{ href: "/approved-real-llm-invocation-envelope-policy", label: "Envelope Policy", key: "approved-real-llm-invocation-envelope-policy" },'; const line='  { href: "/approved-real-llm-invocation-envelope-dashboard", label: "Envelope Dashboard", key: "approved-real-llm-invocation-envelope-dashboard" },'; if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line); }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Envelope Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Envelope Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return; let content=read(file); const original=content;
 if(!content.includes('/approved-real-llm-invocation-envelope-dashboard')){ content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Invocation Envelope</h2><p>Approved Real LLM Invocation Envelope Prep ohne produktiven LLM-Aufruf.</p><a className="secondary-button" href="/approved-real-llm-invocation-envelope-dashboard">Envelope Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>'); }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Envelope Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Invocation Envelope Dashboard","http://localhost:3000/approved-real-llm-invocation-envelope-dashboard"],
 ["UI Invocation Envelope","http://localhost:3000/approved-real-llm-invocation-envelope"],
 ["UI Invocation Envelope Policy","http://localhost:3000/approved-real-llm-invocation-envelope-policy"],
 ["API Invocation Envelope","http://localhost:3000/api/approved-real-llm-invocation-envelope"],
 ["API Invocation Envelope Policy","http://localhost:3000/api/approved-real-llm-invocation-envelope-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 21.2 Invocation Envelope Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Invocation Envelope URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase21-2-invocation-envelope-dashboard-smoke.md", `# Phase 21.2 – Invocation Envelope Dashboard & Smoke

## Ziel
Approved Real LLM Invocation Envelopes und Envelope Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /approved-real-llm-invocation-envelope-dashboard

## Enthalten
- Consent Requests
- Approved Real LLM Invocation Envelopes
- Invocation Envelope Policy Simulations
- Governance Audit

## Sicherheitsprinzip
- nur Envelope/Prep
- kein produktiver LLM-Aufruf
- realLlmCallAllowed=false
- llmCallPerformed=false
- consentRequired=true
- humanApprovalRequired=true
- Output Contract locked
- finaler Secret Scan
- keine Tool-Ausführung
- keine Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 21.3 kann Final Invocation Envelope Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase21-invocation-envelope-dashboard-smoke-runbook.md", `# Runbook – Phase 21.2 Invocation Envelope Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase21:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase21-2-patch-invocation-envelope-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase21:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase21:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/approved-real-llm-invocation-envelope-dashboard/page.tsx", page);
ensureFile("scripts/phase21-2-invocation-envelope-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 21.2 Patch abgeschlossen.");
