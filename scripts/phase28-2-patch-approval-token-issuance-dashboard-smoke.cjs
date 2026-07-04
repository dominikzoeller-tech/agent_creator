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
  pkg.scripts["phase28:2:patch"]="node scripts/phase28-2-patch-approval-token-issuance-dashboard-smoke.cjs";
  pkg.scripts["phase28:2:verify"]="node scripts/phase28-2-verify-approval-token-issuance-dashboard-smoke.cjs";
  pkg.scripts["phase28:2:smoke"]="node scripts/phase28-2-approval-token-issuance-dashboard-smoke.cjs";
  pkg.scripts["llm:approval-token-issuance:release:check"]="npm run phase28:0:verify && npm run phase28:1:verify && npm run phase28:2:verify && npm run phase28:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 28.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ApprovalTokenIssuanceDashboardPage(){
  const [issuanceGates,setIssuanceGates]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [requests,setRequests]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [g,p,r,a]=await Promise.all([
        fetchJson("/api/approval-token-issuance-gate?limit=200"),
        fetchJson("/api/approval-token-issuance-policy?limit=200"),
        fetchJson("/api/human-approval-token-request?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setIssuanceGates({summary:g.summary,items:g.approvalTokenIssuanceGates||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setRequests({summary:r.summary,items:r.approvalTokenRequests||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Approval Token Issuance Gates", issuanceGates, "/approval-token-issuance-gate"],
    ["Approval Token Issuance Policy", policy, "/approval-token-issuance-policy"],
    ["Approval Token Requests", requests, "/human-approval-token-request"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="approval-token-issuance-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfdf5 0%,#f8fafc 100%)",borderColor:"#86efac"}}><h1 className="section-title">Approval Token Issuance Dashboard</h1><p style={{lineHeight:1.6}}>Phase 28.2 fasst Approval Token Issuance Gates, Issuance Policy Simulationen, Human Approval Token Requests und Audit zusammen. Token wird nicht ausgestellt und es findet kein Provider-/Netzwerk-Aufruf statt.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Approval Token Issuance Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>explicit_human_approval_token_issuance_gate_no_provider_call</li><li>approvalTokenIssuancePrepared=true</li><li>approvalTokenIssued=false</li><li>humanApproved=false</li><li>issuanceIntentRecorded=true</li><li>provider=none</li><li>modelSelected=none</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx";
 if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "approval-token-issuance-dashboard"')){
   const line='  { href: "/approval-token-issuance-dashboard", label: "Token Issuance Dashboard", key: "approval-token-issuance-dashboard" },';
   const markers=[
    '{ href: "/approval-token-issuance-policy", label: "Token Issuance Policy", key: "approval-token-issuance-policy" },',
    '{ href: "/approval-token-issuance-gate", label: "Token Issuance Gate", key: "approval-token-issuance-gate" },'
   ];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Token Issuance Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Token Issuance Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx";
 if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/approval-token-issuance-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Approval Token Issuance</h2><p>Issuance Gate und Policy ohne automatische Token-Ausstellung.</p><a className="secondary-button" href="/approval-token-issuance-dashboard">Approval Token Issuance Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Approval Token Issuance Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Approval Token Issuance Dashboard","http://localhost:3000/approval-token-issuance-dashboard"],
 ["UI Approval Token Issuance Gate","http://localhost:3000/approval-token-issuance-gate"],
 ["UI Approval Token Issuance Policy","http://localhost:3000/approval-token-issuance-policy"],
 ["API Approval Token Issuance Gate","http://localhost:3000/api/approval-token-issuance-gate"],
 ["API Approval Token Issuance Policy","http://localhost:3000/api/approval-token-issuance-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 28.2 Approval Token Issuance Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Approval Token Issuance URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase28-2-approval-token-issuance-dashboard-smoke.md", `# Phase 28.2 – Approval Token Issuance Dashboard & Smoke

## Ziel
Approval Token Issuance Gates und Approval Token Issuance Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /approval-token-issuance-dashboard

## Enthalten
- Approval Token Issuance Gates
- Approval Token Issuance Policy Simulations
- Human Approval Token Requests
- Governance Audit

## Sicherheitsprinzip
- explicit_human_approval_token_issuance_gate_no_provider_call
- approvalTokenIssuancePrepared=true
- approvalTokenIssued=false
- humanApproved=false
- issuanceIntentRecorded=true
- Token wird nicht automatisch ausgestellt
- kein automatischer Provider-/Netzwerk-Aufruf
- provider=none
- modelSelected=none
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- dryRunOnly=true

## Nächster Schritt
Phase 28.3 kann Final Approval Token Issuance Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase28-approval-token-issuance-dashboard-smoke-runbook.md", `# Runbook – Phase 28.2 Approval Token Issuance Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase28:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase28-2-patch-approval-token-issuance-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase28:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase28:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/approval-token-issuance-dashboard/page.tsx", page);
ensureFile("scripts/phase28-2-approval-token-issuance-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 28.2 Patch abgeschlossen.");
