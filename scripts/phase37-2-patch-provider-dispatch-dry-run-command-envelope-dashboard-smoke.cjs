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
  pkg.scripts["phase37:2:patch"]="node scripts/phase37-2-patch-provider-dispatch-dry-run-command-envelope-dashboard-smoke.cjs";
  pkg.scripts["phase37:2:verify"]="node scripts/phase37-2-verify-provider-dispatch-dry-run-command-envelope-dashboard-smoke.cjs";
  pkg.scripts["phase37:2:smoke"]="node scripts/phase37-2-provider-dispatch-dry-run-command-envelope-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-dispatch-dry-run-command-envelope:release:check"]="npm run phase37:0:verify && npm run phase37:1:verify && npm run phase37:2:verify && npm run phase37:2:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 37.2 Scripts eingetragen.");
}
const page = `"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: unknown; items?: unknown[] };
async function fetchJson(url:string){ const res=await fetch(url,{cache:"no-store"}); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error||url); return payload; }
export default function ProviderDispatchDryRunCommandEnvelopeDashboardPage(){
  const [envelopes,setEnvelopes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [executionGates,setExecutionGates]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [e,p,g,a]=await Promise.all([
        fetchJson("/api/provider-dispatch-dry-run-command-envelope?limit=200"),
        fetchJson("/api/provider-dispatch-dry-run-command-envelope-policy?limit=200"),
        fetchJson("/api/provider-dispatch-execution-gate?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setEnvelopes({summary:e.summary,items:e.providerDispatchDryRunCommandEnvelopes||[]});
      setPolicy({summary:p.summary,items:p.simulations||[]});
      setExecutionGates({summary:g.summary,items:g.providerDispatchExecutionGates||[]});
      setAudit({summary:a.summary,items:a.events||[]});
    }catch(err){ setError(err instanceof Error?err.message:"Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); },[]);
  const cards=[
    ["Provider Dispatch Dry-Run Command Envelopes",envelopes,"/provider-dispatch-dry-run-command-envelope"],
    ["Provider Dispatch Dry-Run Policy",policy,"/provider-dispatch-dry-run-command-envelope-policy"],
    ["Provider Dispatch Execution Gates",executionGates,"/provider-dispatch-execution-gate"],
    ["Governance Audit",audit,"/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-dry-run-command-envelope-dashboard" /><div className="page-shell"><section className="hero-card" style={{background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",borderColor:"#c7d2fe"}}><h1 className="section-title">Provider Dispatch Dry-Run Command Envelope Dashboard</h1><p style={{lineHeight:1.6}}>Phase 37.2 fasst Provider Dispatch Dry-Run Command Envelopes, Policy Simulationen, Provider Dispatch Execution Gates und Governance Audit zusammen. Command Envelope bleibt nicht ausgeführt. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{borderColor:"#fecaca",background:"#fef2f2"}}>{error}</section> : null}<section className="panel-card"><h2>Provider Dispatch Dry-Run Command Envelope Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{textDecoration:"none",color:"inherit"}}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{whiteSpace:"pre-wrap",marginTop:8}}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>controlled_provider_dispatch_dry_run_command_envelope_no_provider_call</li><li>providerDispatchDryRunCommandEnvelopePrepared=true</li><li>commandEnvelopePrepared=true</li><li>commandEnvelopeExecuted=false</li><li>executionGateOpen=false</li><li>finalDispatchAllowed=false</li><li>providerDispatchPerformed=false</li><li>metadataOnly=true</li><li>provider=none</li><li>modelSelected=none</li><li>dispatchPayloadIncluded=false</li><li>commandPayloadIncluded=false</li><li>promptPayloadIncluded=false</li><li>promptIncluded=false</li><li>secretValuesIncluded=false</li><li>requestBodyIncluded=false</li><li>sensitiveRequestBodyIncluded=false</li><li>networkCallAllowed=false</li><li>networkCallPerformed=false</li><li>providerExecutionAllowed=false</li><li>realLlmCallAllowed=false</li><li>llmCallPerformed=false</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>agentExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
const smoke=`const endpoints=[
 ["UI Provider Dispatch Dry-Run Command Envelope Dashboard","http://localhost:3000/provider-dispatch-dry-run-command-envelope-dashboard"],
 ["UI Provider Dispatch Dry-Run Command Envelope","http://localhost:3000/provider-dispatch-dry-run-command-envelope"],
 ["UI Provider Dispatch Dry-Run Policy","http://localhost:3000/provider-dispatch-dry-run-command-envelope-policy"],
 ["API Provider Dispatch Dry-Run Command Envelope","http://localhost:3000/api/provider-dispatch-dry-run-command-envelope"],
 ["API Provider Dispatch Dry-Run Policy","http://localhost:3000/api/provider-dispatch-dry-run-command-envelope-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 37.2 Provider Dispatch Dry-Run Command Envelope Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Dispatch Dry-Run Command Envelope URLs sind erreichbar."); }
main();
`;
function patchNavigation(){ const file="frontend/components/UnifiedNavigation.tsx"; if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt."); let content=read(file); if(content.includes('provider-dispatch-dry-run-command-envelope-dashboard')){ console.log("SKIP UnifiedNavigation: Dry-Run Dashboard bereits vorhanden."); return; } const line='  { href: "/provider-dispatch-dry-run-command-envelope-dashboard", label: "Dispatch Dry-Run Dashboard", key: "provider-dispatch-dry-run-command-envelope-dashboard" },'; const markers=['{ href: "/provider-dispatch-dry-run-command-envelope-policy", label: "Dispatch Dry-Run Policy", key: "provider-dispatch-dry-run-command-envelope-policy" },','{ href: "/provider-dispatch-dry-run-command-envelope", label: "Dispatch Dry-Run Command", key: "provider-dispatch-dry-run-command-envelope" },']; let patched=false; for(const marker of markers){ if(content.includes(marker)){ content=content.replace(marker, marker+'\n'+line); patched=true; break; } } if(!patched){ const idx=content.indexOf("];",content.indexOf("href:")); if(idx<0) throw new Error("Konnte Navigation-Liste nicht finden."); content=content.slice(0,idx)+line+'\n'+content.slice(idx); } write(file, content); console.log("OK UnifiedNavigation: Dispatch Dry-Run Dashboard Link ergänzt."); }
function patchCockpit(){ const file="frontend/app/master-cockpit/page.tsx"; if(!exists(file)) return; let content=read(file); if(content.includes('/provider-dispatch-dry-run-command-envelope-dashboard')) return; const insert='<section className="panel-card"><h2>Provider Dispatch Dry-Run Command Envelope</h2><p>Dry-Run Command Envelope bleibt vorbereitet, nicht ausgeführt und ohne Provider-/Netzwerk-Aufruf.</p><a className="secondary-button" href="/provider-dispatch-dry-run-command-envelope-dashboard">Dispatch Dry-Run Dashboard</a></section>'; const marker='<section className="panel-card"><h2>Safety Invariants</h2>'; if(content.includes(marker)){ content=content.replace(marker, insert+marker); write(file, content); console.log("OK master-cockpit: Dispatch Dry-Run Dashboard Link ergänzt."); } }
function patchDocs(){ ensureFile("phase37-2-provider-dispatch-dry-run-command-envelope-dashboard-smoke.md", `# Phase 37.2 – Provider Dispatch Dry-Run Command Envelope Dashboard & Smoke\n\n## Ziel\nProvider Dispatch Dry-Run Command Envelopes und Policy Simulationen werden im Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.\n\n## Neue UI\n- /provider-dispatch-dry-run-command-envelope-dashboard\n\n## Sicherheitsinvarianten\n- providerDispatchDryRunCommandEnvelopePrepared=true\n- commandEnvelopePrepared=true\n- commandEnvelopeExecuted=false\n- executionGateOpen=false\n- finalDispatchAllowed=false\n- providerDispatchPerformed=false\n- metadataOnly=true\n- provider=none\n- modelSelected=none\n- commandPayloadIncluded=false\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 37.3 – Final Provider Dispatch Dry-Run Command Envelope Handoff / Release Summary\n`); ensureFile("docs/phase37-provider-dispatch-dry-run-command-envelope-dashboard-smoke-runbook.md", `# Runbook – Phase 37.2 Provider Dispatch Dry-Run Command Envelope Dashboard & Smoke\n\n## Patch\n\`\`\`powershell\nnpm run phase37:2:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase37:2:verify\nnpm run build\n\`\`\`\n\n## Smoke\n\`\`\`powershell\nnpm run stack:up:detached\nnpm run stack:health\nnpm run phase37:2:smoke\n\`\`\`\n`); }
patchPackage();
ensureFile("frontend/app/provider-dispatch-dry-run-command-envelope-dashboard/page.tsx", page);
ensureFile("scripts/phase37-2-provider-dispatch-dry-run-command-envelope-dashboard-smoke.cjs", smoke);
patchNavigation();
patchCockpit();
patchDocs();
console.log("Phase 37.2 Patch abgeschlossen.");
