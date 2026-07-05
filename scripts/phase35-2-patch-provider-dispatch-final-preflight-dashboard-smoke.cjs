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
  pkg.scripts["phase35:2:patch"]="node scripts/phase35-2-patch-provider-dispatch-final-preflight-dashboard-smoke.cjs";
  pkg.scripts["phase35:2:verify"]="node scripts/phase35-2-verify-provider-dispatch-final-preflight-dashboard-smoke.cjs";
  pkg.scripts["phase35:2:smoke"]="node scripts/phase35-2-provider-dispatch-final-preflight-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-dispatch-final-preflight:release:check"]="npm run phase35:0:verify && npm run phase35:1:verify && npm run phase35:2:verify && npm run phase35:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 35.2 Scripts eingetragen.");
}
const page = `"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: unknown; items?: unknown[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderDispatchFinalPreflightDashboardPage(){
  const [finalPreflights,setFinalPreflights]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [tokenBindings,setTokenBindings]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [f,p,t,a]=await Promise.all([
        fetchJson("/api/provider-dispatch-final-preflight?limit=200"),
        fetchJson("/api/provider-dispatch-final-preflight-policy?limit=200"),
        fetchJson("/api/provider-dispatch-token-binding?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setFinalPreflights({summary:f.summary,items:f.providerDispatchFinalPreflights||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setTokenBindings({summary:t.summary,items:t.providerDispatchTokenBindings||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Provider Dispatch Final Preflights",finalPreflights,"/provider-dispatch-final-preflight"],
    ["Provider Dispatch Final Policy",policy,"/provider-dispatch-final-preflight-policy"],
    ["Provider Dispatch Token Bindings",tokenBindings,"/provider-dispatch-token-binding"],
    ["Governance Audit",audit,"/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-final-preflight-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Final Preflight Dashboard</h1><p style={{lineHeight:1.6}}>Phase 35.2 fasst Provider Dispatch Final Preflights, Policy Simulationen, Provider Dispatch Token Bindings und Governance Audit zusammen. Final Dispatch bleibt blockiert. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Dispatch Final Preflight Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_provider_dispatch_final_preflight_no_provider_call</li><li>providerDispatchFinalPreflightPrepared=true</li><li>finalDispatchAllowed=false</li><li>providerDispatchPerformed=false</li><li>providerDispatchTokenBindingPrepared=true</li><li>tokenBoundToDispatch=false</li><li>tokenBindingActive=false</li><li>tokenActive=false</li><li>metadataOnly=true</li><li>provider=none</li><li>modelSelected=none</li><li>dispatchPayloadIncluded=false</li><li>promptPayloadIncluded=false</li><li>promptIncluded=false</li><li>secretValuesIncluded=false</li><li>requestBodyIncluded=false</li><li>sensitiveRequestBodyIncluded=false</li><li>networkCallAllowed=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
const smoke=`const endpoints=[
 ["UI Provider Dispatch Final Preflight Dashboard","http://localhost:3000/provider-dispatch-final-preflight-dashboard"],
 ["UI Provider Dispatch Final Preflight","http://localhost:3000/provider-dispatch-final-preflight"],
 ["UI Provider Dispatch Final Policy","http://localhost:3000/provider-dispatch-final-preflight-policy"],
 ["API Provider Dispatch Final Preflight","http://localhost:3000/api/provider-dispatch-final-preflight"],
 ["API Provider Dispatch Final Policy","http://localhost:3000/api/provider-dispatch-final-preflight-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 35.2 Provider Dispatch Final Preflight Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Dispatch Final Preflight URLs sind erreichbar."); }
main();
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-final-preflight-dashboard')){ console.log("SKIP UnifiedNavigation: Final Preflight Dashboard bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-final-preflight-dashboard", label: "Dispatch Final Dashboard", key: "provider-dispatch-final-preflight-dashboard" },'; const markers=['{ href: "/provider-dispatch-final-preflight-policy", label: "Dispatch Final Policy", key: "provider-dispatch-final-preflight-policy" },','{ href: "/provider-dispatch-final-preflight", label: "Dispatch Final Preflight", key: "provider-dispatch-final-preflight" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Final Dashboard Link ergänzt."); }
function patchCockpit(){ const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return; let content=read(file); if(content.includes('/provider-dispatch-final-preflight-dashboard')) return; const insert='<section className="panel-card"><h2>Provider Dispatch Final Preflight</h2><p>Final Preflight bleibt vorbereitet, Final Dispatch bleibt blockiert und ohne Provider-/Netzwerk-Aufruf.</p><a className="secondary-button" href="/provider-dispatch-final-preflight-dashboard">Dispatch Final Dashboard</a></section>'; const marker='<section className="panel-card"><h2>Safety Invariants</h2>'; if(content.includes(marker)){ content=content.replace(marker, insert+marker); write(file, content); console.log("OK master-cockpit: Dispatch Final Dashboard Link ergänzt."); } }
function patchDocs(){ ensureFile("phase35-2-provider-dispatch-final-preflight-dashboard-smoke.md", `# Phase 35.2 – Provider Dispatch Final Preflight Dashboard & Smoke\n\n## Ziel\nProvider Dispatch Final Preflights und Policy Simulationen werden im Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.\n\n## Neue UI\n- /provider-dispatch-final-preflight-dashboard\n\n## Sicherheitsinvarianten\n- providerDispatchFinalPreflightPrepared=true\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- providerDispatchTokenBindingPrepared=true\n- tokenBoundToDispatch=false\n- tokenBindingActive=false\n- tokenActive=false\n- metadataOnly=true\n- provider=none\n- modelSelected=none\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 35.3 – Final Provider Dispatch Final Preflight Handoff / Release Summary\n`); ensureFile("docs/phase35-provider-dispatch-final-preflight-dashboard-smoke-runbook.md", `# Runbook – Phase 35.2 Provider Dispatch Final Preflight Dashboard & Smoke\n\n## Patch\n\`\`\`powershell\nnpm run phase35:2:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase35:2:verify\nnpm run build\n\`\`\`\n\n## Smoke\n\`\`\`powershell\nnpm run stack:up:detached\nnpm run stack:health\nnpm run phase35:2:smoke\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/app/provider-dispatch-final-preflight-dashboard/page.tsx", page);
ensureFile("scripts/phase35-2-provider-dispatch-final-preflight-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 35.2 Patch abgeschlossen.");
