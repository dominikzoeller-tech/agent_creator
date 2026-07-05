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
  pkg.scripts["phase29:2:patch"]="node scripts/phase29-2-patch-approval-token-activation-dashboard-smoke.cjs";
  pkg.scripts["phase29:2:verify"]="node scripts/phase29-2-verify-approval-token-activation-dashboard-smoke.cjs";
  pkg.scripts["phase29:2:smoke"]="node scripts/phase29-2-approval-token-activation-dashboard-smoke.cjs";
  pkg.scripts["llm:approval-token-activation:release:check"]="npm run phase29:0:verify && npm run phase29:1:verify && npm run phase29:2:verify && npm run phase29:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 29.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ApprovalTokenActivationDashboardPage(){
  const [activationGates,setActivationGates]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [issuanceGates,setIssuanceGates]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [g,p,i,a]=await Promise.all([
        fetchJson("/api/approval-token-activation-gate?limit=200"),
        fetchJson("/api/approval-token-activation-policy?limit=200"),
        fetchJson("/api/approval-token-issuance-gate?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setActivationGates({summary:g.summary,items:g.approvalTokenActivationGates||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setIssuanceGates({summary:i.summary,items:i.approvalTokenIssuanceGates||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Approval Token Activation Gates", activationGates, "/approval-token-activation-gate"],
    ["Approval Token Activation Policy", policy, "/approval-token-activation-policy"],
    ["Approval Token Issuance Gates", issuanceGates, "/approval-token-issuance-gate"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="approval-token-activation-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0f9ff 0%,#f8fafc 100%)",borderColor:"#7dd3fc"}}><h1 className="section-title">Approval Token Activation Dashboard</h1><p style={{lineHeight:1.6}}>Phase 29.2 fasst Approval Token Activation Gates, Activation Policy Simulationen, Issuance Gates und Audit zusammen. Token bleibt nicht aktiv und es findet kein Provider-/Netzwerk-Aufruf statt.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Approval Token Activation Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>explicit_human_approval_token_activation_gate_no_provider_call</li><li>tokenActivationPrepared=true</li><li>tokenActive=false</li><li>activationIntentRecorded=true/false</li><li>provider=none</li><li>modelSelected=none</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx";
 if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "approval-token-activation-dashboard"')){
   const line='  { href: "/approval-token-activation-dashboard", label: "Token Activation Dashboard", key: "approval-token-activation-dashboard" },';
   const markers=[
    '{ href: "/approval-token-activation-policy", label: "Token Activation Policy", key: "approval-token-activation-policy" },',
    '{ href: "/approval-token-activation-gate", label: "Token Activation Gate", key: "approval-token-activation-gate" },'
   ];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Token Activation Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Token Activation Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx";
 if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/approval-token-activation-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Approval Token Activation</h2><p>Token Activation Gate und Policy ohne Provider-/Netzwerk-Aufruf.</p><a className="secondary-button" href="/approval-token-activation-dashboard">Approval Token Activation Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Approval Token Activation Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Approval Token Activation Dashboard","http://localhost:3000/approval-token-activation-dashboard"],
 ["UI Approval Token Activation Gate","http://localhost:3000/approval-token-activation-gate"],
 ["UI Approval Token Activation Policy","http://localhost:3000/approval-token-activation-policy"],
 ["API Approval Token Activation Gate","http://localhost:3000/api/approval-token-activation-gate"],
 ["API Approval Token Activation Policy","http://localhost:3000/api/approval-token-activation-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 29.2 Approval Token Activation Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Approval Token Activation URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase29-2-approval-token-activation-dashboard-smoke.md", `# Phase 29.2 – Approval Token Activation Dashboard & Smoke

## Ziel
Approval Token Activation Gates und Approval Token Activation Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /approval-token-activation-dashboard

## Enthalten
- Approval Token Activation Gates
- Approval Token Activation Policy Simulations
- Approval Token Issuance Gates
- Governance Audit

## Sicherheitsprinzip
- explicit_human_approval_token_activation_gate_no_provider_call
- tokenActivationPrepared=true
- tokenActive=false
- activationIntentRecorded=true/false
- Token wird nicht aktiviert
- kein automatischer Provider-/Netzwerk-Aufruf
- provider=none
- modelSelected=none
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 29.3 kann Final Approval Token Activation Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase29-approval-token-activation-dashboard-smoke-runbook.md", `# Runbook – Phase 29.2 Approval Token Activation Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase29:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase29-2-patch-approval-token-activation-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase29:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase29:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/approval-token-activation-dashboard/page.tsx", page);
ensureFile("scripts/phase29-2-approval-token-activation-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 29.2 Patch abgeschlossen.");
