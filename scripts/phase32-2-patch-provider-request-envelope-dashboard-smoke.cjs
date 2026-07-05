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
  pkg.scripts["phase32:2:patch"]="node scripts/phase32-2-patch-provider-request-envelope-dashboard-smoke.cjs";
  pkg.scripts["phase32:2:verify"]="node scripts/phase32-2-verify-provider-request-envelope-dashboard-smoke.cjs";
  pkg.scripts["phase32:2:smoke"]="node scripts/phase32-2-provider-request-envelope-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-request-envelope:release:check"]="npm run phase32:0:verify && npm run phase32:1:verify && npm run phase32:2:verify && npm run phase32:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 32.2 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderRequestEnvelopeDashboardPage(){
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [contracts,setContracts]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [e,p,c,a]=await Promise.all([
        fetchJson("/api/provider-request-envelope?limit=200"),
        fetchJson("/api/provider-request-envelope-policy?limit=200"),
        fetchJson("/api/provider-request-contract?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setEnvelopes({summary:e.summary,items:e.providerRequestEnvelopes||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setContracts({summary:c.summary,items:c.providerRequestContracts||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Provider Request Envelopes", envelopes, "/provider-request-envelope"],
    ["Provider Request Envelope Policy", policy, "/provider-request-envelope-policy"],
    ["Provider Request Contracts", contracts, "/provider-request-contract"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-request-envelope-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f0fdfa 0%,#f8fafc 100%)",borderColor:"#5eead4"}}><h1 className="section-title">Provider Request Envelope Dashboard</h1><p style={{lineHeight:1.6}}>Phase 32.2 fasst Provider Request Envelopes, Policy Simulationen, Provider Request Contracts und Audit zusammen. Envelope bleibt metadata-only. Kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte und kein sensibler Request Body.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Request Envelope Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_provider_request_envelope_metadata_only_no_provider_call</li><li>providerRequestEnvelopeAssembled=true</li><li>metadataOnly=true</li><li>provider=none</li><li>modelSelected=none</li><li>envelopePayloadIncluded=false</li><li>promptPayloadIncluded=false</li><li>promptIncluded=false</li><li>promptRedactedPreviewIncluded=false</li><li>secretValuesIncluded=false</li><li>requestBodyIncluded=false</li><li>sensitiveRequestBodyIncluded=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchNavigation(){
 const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
 let content=read(file); const original=content;
 if(!content.includes('key: "provider-request-envelope-dashboard"')){
   const line='  { href: "/provider-request-envelope-dashboard", label: "Provider Envelope Dashboard", key: "provider-request-envelope-dashboard" },';
   const markers=['{ href: "/provider-request-envelope-policy", label: "Provider Envelope Policy", key: "provider-request-envelope-policy" },','{ href: "/provider-request-envelope", label: "Provider Request Envelope", key: "provider-request-envelope" },'];
   for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); break; } }
 }
 if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Provider Envelope Dashboard Link ergänzt."); } else console.log("SKIP UnifiedNavigation: Provider Envelope Dashboard bereits vorhanden oder Marker fehlt.");
}
function patchCockpit(){
 const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return;
 let content=read(file); const original=content;
 if(!content.includes('/provider-request-envelope-dashboard')){
   content=content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Provider Request Envelope</h2><p>Provider Request Envelope und Policy metadata-only ohne Provider-/Netzwerk-Aufruf.</p><a className="secondary-button" href="/provider-request-envelope-dashboard">Provider Envelope Dashboard</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
 }
 if(content!==original){ write(file, content); console.log("OK master-cockpit: Provider Envelope Dashboard Link ergänzt."); }
}
const smoke=String.raw`const endpoints=[
 ["UI Provider Envelope Dashboard","http://localhost:3000/provider-request-envelope-dashboard"],
 ["UI Provider Request Envelope","http://localhost:3000/provider-request-envelope"],
 ["UI Provider Envelope Policy","http://localhost:3000/provider-request-envelope-policy"],
 ["API Provider Request Envelope","http://localhost:3000/api/provider-request-envelope"],
 ["API Provider Envelope Policy","http://localhost:3000/api/provider-request-envelope-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 32.2 Provider Request Envelope Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Request Envelope URLs sind erreichbar."); }
main();
`;
function patchDocs(){
 ensureFile("phase32-2-provider-request-envelope-dashboard-smoke.md", `# Phase 32.2 – Provider Request Envelope Dashboard & Smoke

## Ziel
Provider Request Envelopes und Provider Request Envelope Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /provider-request-envelope-dashboard

## Enthalten
- Provider Request Envelopes
- Provider Request Envelope Policy Simulations
- Provider Request Contracts
- Governance Audit

## Sicherheitsprinzip
- controlled_provider_request_envelope_metadata_only_no_provider_call
- providerRequestEnvelopeAssembled=true
- metadataOnly=true
- provider=none
- modelSelected=none
- envelopePayloadIncluded=false
- promptPayloadIncluded=false
- promptIncluded=false
- promptRedactedPreviewIncluded=false
- secretValuesIncluded=false
- requestBodyIncluded=false
- sensitiveRequestBodyIncluded=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 32.3 kann Final Provider Request Envelope Handoff / Release Summary vorbereiten.
`);
 ensureFile("docs/phase32-provider-request-envelope-dashboard-smoke-runbook.md", `# Runbook – Phase 32.2 Provider Request Envelope Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase32:2:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase32-2-patch-provider-request-envelope-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase32:2:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase32:2:smoke
\`\`\`
`);
}
patchPackage();
ensureFile("frontend/app/provider-request-envelope-dashboard/page.tsx", page);
ensureFile("scripts/phase32-2-provider-request-envelope-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 32.2 Patch abgeschlossen.");
