const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensureFile(file, content){ if(!exists(file)){ write(file, content); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase36:2:patch"]="node scripts/phase36-2-patch-provider-dispatch-execution-gate-dashboard-smoke.cjs";
  pkg.scripts["phase36:2:verify"]="node scripts/phase36-2-verify-provider-dispatch-execution-gate-dashboard-smoke.cjs";
  pkg.scripts["phase36:2:smoke"]="node scripts/phase36-2-provider-dispatch-execution-gate-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-dispatch-execution-gate:release:check"]="npm run phase36:0:verify && npm run phase36:1:verify && npm run phase36:2:verify && npm run phase36:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 36.2 Scripts eingetragen.");
}
const page = `"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: unknown; items?: unknown[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderDispatchExecutionGateDashboardPage(){
  const [gates,setGates]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [finalPreflights,setFinalPreflights]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [g,p,f,a]=await Promise.all([
        fetchJson("/api/provider-dispatch-execution-gate?limit=200"),
        fetchJson("/api/provider-dispatch-execution-gate-policy?limit=200"),
        fetchJson("/api/provider-dispatch-final-preflight?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setGates({summary:g.summary,items:g.providerDispatchExecutionGates||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setFinalPreflights({summary:f.summary,items:f.providerDispatchFinalPreflights||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Provider Dispatch Execution Gates",gates,"/provider-dispatch-execution-gate"],
    ["Provider Dispatch Execution Policy",policy,"/provider-dispatch-execution-gate-policy"],
    ["Provider Dispatch Final Preflights",finalPreflights,"/provider-dispatch-final-preflight"],
    ["Governance Audit",audit,"/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-execution-gate-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Execution Gate Dashboard</h1><p style={{lineHeight:1.6}}>Phase 36.2 fasst Provider Dispatch Execution Gates, Policy Simulationen, Provider Dispatch Final Preflights und Governance Audit zusammen. Execution Gate bleibt geschlossen. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Dispatch Execution Gate Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_provider_dispatch_execution_gate_no_provider_call</li><li>providerDispatchExecutionGatePrepared=true</li><li>executionGateOpen=false</li><li>finalDispatchAllowed=false</li><li>providerDispatchPerformed=false</li><li>providerDispatchFinalPreflightPrepared=true</li><li>tokenBoundToDispatch=false</li><li>tokenBindingActive=false</li><li>tokenActive=false</li><li>metadataOnly=true</li><li>provider=none</li><li>modelSelected=none</li><li>dispatchPayloadIncluded=false</li><li>promptPayloadIncluded=false</li><li>promptIncluded=false</li><li>secretValuesIncluded=false</li><li>requestBodyIncluded=false</li><li>sensitiveRequestBodyIncluded=false</li><li>networkCallAllowed=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
const smoke=`const endpoints=[
 ["UI Provider Dispatch Execution Gate Dashboard","http://localhost:3000/provider-dispatch-execution-gate-dashboard"],
 ["UI Provider Dispatch Execution Gate","http://localhost:3000/provider-dispatch-execution-gate"],
 ["UI Provider Dispatch Execution Policy","http://localhost:3000/provider-dispatch-execution-gate-policy"],
 ["API Provider Dispatch Execution Gate","http://localhost:3000/api/provider-dispatch-execution-gate"],
 ["API Provider Dispatch Execution Policy","http://localhost:3000/api/provider-dispatch-execution-gate-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 36.2 Provider Dispatch Execution Gate Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Dispatch Execution Gate URLs sind erreichbar."); }
main();
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-execution-gate-dashboard')){ console.log("SKIP UnifiedNavigation: Execution Gate Dashboard bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-execution-gate-dashboard", label: "Dispatch Execution Dashboard", key: "provider-dispatch-execution-gate-dashboard" },'; const markers=['{ href: "/provider-dispatch-execution-gate-policy", label: "Dispatch Execution Policy", key: "provider-dispatch-execution-gate-policy" },','{ href: "/provider-dispatch-execution-gate", label: "Dispatch Execution Gate", key: "provider-dispatch-execution-gate" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Execution Dashboard Link ergänzt."); }
function patchCockpit(){ const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return; let content=read(file); if(content.includes('/provider-dispatch-execution-gate-dashboard')) return; const insert='<section className="panel-card"><h2>Provider Dispatch Execution Gate</h2><p>Execution Gate bleibt vorbereitet, geschlossen und ohne Provider-/Netzwerk-Aufruf.</p><a className="secondary-button" href="/provider-dispatch-execution-gate-dashboard">Dispatch Execution Dashboard</a></section>'; const marker='<section className="panel-card"><h2>Safety Invariants</h2>'; if(content.includes(marker)){ content=content.replace(marker, insert+marker); write(file, content); console.log("OK master-cockpit: Dispatch Execution Dashboard Link ergänzt."); } }
function patchDocs(){ ensureFile("phase36-2-provider-dispatch-execution-gate-dashboard-smoke.md", `# Phase 36.2 – Provider Dispatch Execution Gate Dashboard & Smoke\n\n## Ziel\nProvider Dispatch Execution Gates und Policy Simulationen werden im Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.\n\n## Neue UI\n- /provider-dispatch-execution-gate-dashboard\n\n## Sicherheitsinvarianten\n- providerDispatchExecutionGatePrepared=true\n- executionGateOpen=false\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- providerDispatchFinalPreflightPrepared=true\n- tokenBoundToDispatch=false\n- tokenBindingActive=false\n- tokenActive=false\n- metadataOnly=true\n- provider=none\n- modelSelected=none\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 36.3 – Final Provider Dispatch Execution Gate Handoff / Release Summary\n`); ensureFile("docs/phase36-provider-dispatch-execution-gate-dashboard-smoke-runbook.md", `# Runbook – Phase 36.2 Provider Dispatch Execution Gate Dashboard & Smoke\n\n## Patch\n\`\`\`powershell\nnpm run phase36:2:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase36:2:verify\nnpm run build\n\`\`\`\n\n## Smoke\n\`\`\`powershell\nnpm run stack:up:detached\nnpm run stack:health\nnpm run phase36:2:smoke\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/app/provider-dispatch-execution-gate-dashboard/page.tsx", page);
ensureFile("scripts/phase36-2-provider-dispatch-execution-gate-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 36.2 Patch abgeschlossen.");
