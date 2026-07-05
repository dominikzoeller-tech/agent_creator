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
  pkg.scripts["phase30:2:patch"]="node scripts/phase30-2-patch-token-backed-provider-preflight-dashboard-smoke.cjs";
  pkg.scripts["phase30:2:verify"]="node scripts/phase30-2-verify-token-backed-provider-preflight-dashboard-smoke.cjs";
  pkg.scripts["phase30:2:smoke"]="node scripts/phase30-2-token-backed-provider-preflight-dashboard-smoke.cjs";
  pkg.scripts["llm:token-backed-provider:release:check"]="npm run phase30:0:verify && npm run phase30:1:verify && npm run phase30:2:verify && npm run phase30:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 30.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function TokenBackedProviderPreflightDashboardPage(){
  const [preflights,setPreflights]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [activationGates,setActivationGates]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [p,pol,aud,act]=await Promise.all([
        fetchJson("/api/token-backed-provider-invocation-preflight?limit=200"),
        fetchJson("/api/token-backed-provider-preflight-policy?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
        fetchJson("/api/approval-token-activation-gate?limit=200"),
      ]);
      setPreflights({summary:p.summary,items:p.tokenBackedProviderInvocationPreflights||[]});
      setPolicy({summary:pol.summary,items:pol.simulations||[]});
      setAudit({summary:aud.summary,items:aud.events||[]});
      setActivationGates({summary:act.summary,items:act.approvalTokenActivationGates||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Token-backed Provider Preflights", preflights, "/token-backed-provider-invocation-preflight"],
    ["Token-backed Provider Policy", policy, "/token-backed-provider-preflight-policy"],
    ["Approval Token Activation Gates", activationGates, "/approval-token-activation-gate"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="token-backed-provider-preflight-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#ecfeff 0%,#f8fafc 100%)",borderColor:"#67e8f9"}}><h1 className="section-title">Token-Backed Provider Preflight Dashboard</h1><p style={{lineHeight:1.6}}>Phase 30.2 fasst Token-backed Provider Invocation Preflights, Policy Simulationen, Approval Token Activation Gates und Audit zusammen. Kein Provider-/Netzwerk-Aufruf, kein Prompt und keine Secret-Werte.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Token-Backed Provider Preflight Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_token_backed_provider_invocation_preflight_no_provider_call</li><li>tokenBackedPreflightPrepared=true</li><li>tokenActive=false</li><li>provider=none</li><li>modelSelected=none</li><li>promptIncluded=false</li><li>secretValuesIncluded=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "token-backed-provider-preflight-dashboard"')){
   const line='  { href: "/token-backed-provider-preflight-dashboard", label: "Token Provider Dashboard", key: "token-backed-provider-preflight-dashboard" },';
   const markers=['{ href: "/token-backed-provider-preflight-policy", label: "Token Provider Policy", key: "token-backed-provider-preflight-policy" },','{ href: "/token-backed-provider-invocation-preflight", label: "Token Provider Preflight", key: "token-backed-provider-invocation-preflight" },'];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Token Provider Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Token Provider Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/token-backed-provider-preflight-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Token-Backed Provider Preflight</h2><p>Token-backed Provider Preflight und Policy ohne Provider-/Netzwerk-Aufruf.</p><a className="secondary-button" href="/token-backed-provider-preflight-dashboard">Token Provider Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Token Provider Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Token Provider Dashboard","http://localhost:3000/token-backed-provider-preflight-dashboard"],
 ["UI Token Provider Preflight","http://localhost:3000/token-backed-provider-invocation-preflight"],
 ["UI Token Provider Policy","http://localhost:3000/token-backed-provider-preflight-policy"],
 ["API Token Provider Preflight","http://localhost:3000/api/token-backed-provider-invocation-preflight"],
 ["API Token Provider Policy","http://localhost:3000/api/token-backed-provider-preflight-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 30.2 Token-Backed Provider Preflight Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Token-backed Provider URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase30-2-token-backed-provider-preflight-dashboard-smoke.md", `# Phase 30.2 – Token-Backed Provider Preflight Dashboard & Smoke

## Ziel
Token-backed Provider Invocation Preflights und Token-backed Provider Preflight Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /token-backed-provider-preflight-dashboard

## Enthalten
- Token-backed Provider Invocation Preflights
- Token-backed Provider Preflight Policy Simulations
- Approval Token Activation Gates
- Governance Audit

## Sicherheitsprinzip
- controlled_token_backed_provider_invocation_preflight_no_provider_call
- tokenBackedPreflightPrepared=true
- tokenActive=false
- provider=none
- modelSelected=none
- promptIncluded=false
- secretValuesIncluded=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 30.3 kann Final Token-Backed Provider Preflight Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase30-token-backed-provider-preflight-dashboard-smoke-runbook.md", `# Runbook – Phase 30.2 Token-Backed Provider Preflight Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase30:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase30-2-patch-token-backed-provider-preflight-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase30:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase30:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/token-backed-provider-preflight-dashboard/page.tsx", page);
ensureFile("scripts/phase30-2-token-backed-provider-preflight-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 30.2 Patch abgeschlossen.");
