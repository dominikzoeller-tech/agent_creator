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
  pkg.scripts["phase27:2:patch"]="node scripts/phase27-2-patch-approval-token-request-dashboard-smoke.cjs";
  pkg.scripts["phase27:2:verify"]="node scripts/phase27-2-verify-approval-token-request-dashboard-smoke.cjs";
  pkg.scripts["phase27:2:smoke"]="node scripts/phase27-2-approval-token-request-dashboard-smoke.cjs";
  pkg.scripts["llm:approval-token-request:release:check"]="npm run phase27:0:verify && npm run phase27:1:verify && npm run phase27:2:verify && npm run phase27:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 27.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ApprovalTokenRequestDashboardPage(){
  const [requests,setRequests]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [gates,setGates]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [r,p,g,a]=await Promise.all([
        fetchJson("/api/human-approval-token-request?limit=200"),
        fetchJson("/api/approval-token-request-policy?limit=200"),
        fetchJson("/api/controlled-real-provider-invocation-gate?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setRequests({summary:r.summary,items:r.approvalTokenRequests||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setGates({summary:g.summary,items:g.gates||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Approval Token Requests", requests, "/human-approval-token-request"],
    ["Approval Token Policy", policy, "/approval-token-request-policy"],
    ["Real Provider Gates", gates, "/controlled-real-provider-invocation-gate"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="approval-token-request-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)",borderColor:"#fdba74"}}><h1 className="section-title">Approval Token Request Dashboard</h1><p style={{lineHeight:1.6}}>Phase 27.2 fasst Human Approval Token Requests, Approval Token Request Policy Simulationen, Real Provider Gates und Audit zusammen. Approval Token wird nicht automatisch erteilt und es findet kein Provider-/Netzwerk-Aufruf statt.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Approval Token Request Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>explicit_human_approval_token_request_no_provider_call</li><li>approvalTokenRequested=true</li><li>approvalTokenIssued=false</li><li>humanApproved=false</li><li>humanApprovalRequired=true</li><li>provider=none</li><li>modelSelected=none</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx";
 if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "approval-token-request-dashboard"')){
   const line='  { href: "/approval-token-request-dashboard", label: "Approval Token Dashboard", key: "approval-token-request-dashboard" },';
   const markers=[
    '{ href: "/approval-token-request-policy", label: "Approval Token Policy", key: "approval-token-request-policy" },',
    '{ href: "/human-approval-token-request", label: "Approval Token Request", key: "human-approval-token-request" },'
   ];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Approval Token Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Approval Token Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx";
 if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/approval-token-request-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Approval Token Request</h2><p>Human Approval Token Request und Policy ohne automatische Token-Erteilung.</p><a className="secondary-button" href="/approval-token-request-dashboard">Approval Token Request Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Approval Token Request Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Approval Token Request Dashboard","http://localhost:3000/approval-token-request-dashboard"],
 ["UI Human Approval Token Request","http://localhost:3000/human-approval-token-request"],
 ["UI Approval Token Request Policy","http://localhost:3000/approval-token-request-policy"],
 ["API Human Approval Token Request","http://localhost:3000/api/human-approval-token-request"],
 ["API Approval Token Request Policy","http://localhost:3000/api/approval-token-request-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 27.2 Approval Token Request Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Approval Token Request URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase27-2-approval-token-request-dashboard-smoke.md", `# Phase 27.2 – Approval Token Request Dashboard & Smoke

## Ziel
Human Approval Token Requests und Approval Token Request Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /approval-token-request-dashboard

## Enthalten
- Human Approval Token Requests
- Approval Token Request Policy Simulations
- Controlled Real Provider Invocation Gates
- Governance Audit

## Sicherheitsprinzip
- explicit_human_approval_token_request_no_provider_call
- approvalTokenRequested=true
- approvalTokenIssued=false
- humanApproved=false
- humanApprovalRequired=true
- Token wird nicht automatisch erteilt
- kein automatischer Provider-/Netzwerk-Aufruf
- provider=none
- modelSelected=none
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- dryRunOnly=true

## Nächster Schritt
Phase 27.3 kann Final Approval Token Request Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase27-approval-token-request-dashboard-smoke-runbook.md", `# Runbook – Phase 27.2 Approval Token Request Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase27:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase27-2-patch-approval-token-request-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase27:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase27:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/approval-token-request-dashboard/page.tsx", page);
ensureFile("scripts/phase27-2-approval-token-request-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 27.2 Patch abgeschlossen.");
