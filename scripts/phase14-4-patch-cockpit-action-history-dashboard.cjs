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
  pkg.scripts["phase14:4:patch"]="node scripts/phase14-4-patch-cockpit-action-history-dashboard.cjs";
  pkg.scripts["phase14:4:verify"]="node scripts/phase14-4-verify-cockpit-action-history-dashboard.cjs";
  pkg.scripts["phase14:4:smoke"]="node scripts/phase14-4-cockpit-action-history-smoke.cjs";
  pkg.scripts["cockpit:history:verify"]="node scripts/phase14-4-verify-cockpit-action-history-dashboard.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 14.4 Scripts eingetragen.");
}
const page = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ActionPlan = { id:string; timestamp:string; actionType:string; title:string; targetHref:string; status:string; executionAllowed:boolean; toolExecutionAllowed:boolean; dryRunOnly:boolean; reason:string };
export default function CockpitActionsPage(){
  const [plans,setPlans]=useState<ActionPlan[]>([]);
  const [summary,setSummary]=useState<any>(null);
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const res=await fetch("/api/cockpit-actions?limit=200", { cache:"no-store" });
      const payload=await res.json();
      if(!res.ok) throw new Error(payload?.error || "Cockpit Actions konnten nicht geladen werden.");
      setPlans(Array.isArray(payload.plans) ? payload.plans : []);
      setSummary(payload.summary || null);
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  return <main className="page-wrap"><UnifiedNavigation active="cockpit-actions" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#f8fafc 0%,#f0fdf4 100%)", borderColor:"#86efac" }}><h1 className="section-title">Cockpit Action History</h1><p style={{ lineHeight:1.6 }}>Phase 14.4 zeigt geplante Cockpit Actions als Historie. Diese Pläne bereiten Master-Agent-Orchestrierung vor, führen aber nichts aus.</p><button className="secondary-button" type="button" onClick={load}>Historie aktualisieren</button></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace:"pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Action Plans</h2>{plans.length===0 ? <p>Noch keine Cockpit Action Plans. Im Master Cockpit bei Guided Next Actions auf „Planen“ klicken.</p> : plans.map((plan)=><article key={plan.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{plan.title}</strong> <span className="chip">{plan.actionType}</span> <span className="chip">{plan.status}</span></div><div className="helper-text"><code>{plan.id}</code> · {plan.timestamp}</div><p><strong>Reason:</strong> {plan.reason}</p><p><strong>Execution allowed:</strong> {String(plan.executionAllowed)} · <strong>Tool execution allowed:</strong> {String(plan.toolExecutionAllowed)} · <strong>Dry-run only:</strong> {String(plan.dryRunOnly)}</p><a className="nav-link" href={plan.targetHref}>Ziel öffnen</a></article>)}</section><section className="panel-card"><h2>Safety Invariants</h2><ul><li>Action Plans sind Orchestrierungs-Vorbereitung, keine Ausführung.</li><li>executionAllowed=false</li><li>toolExecutionAllowed=false</li><li>dryRunOnly=true</li></ul></section></div></main>;
}
`;
function patchCockpit(){
  const file="frontend/app/master-cockpit/page.tsx";
  if(!exists(file)) return console.log("SKIP master-cockpit fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('/cockpit-actions')){
    content = content.replace('<section className="panel-card"><h2>Safety Invariants</h2>', '<section className="panel-card"><h2>Action History</h2><p>Cockpit Action Plans werden als sichere Orchestrierungs-Vorbereitung gespeichert.</p><a className="primary-button" href="/cockpit-actions">Cockpit Action History öffnen</a></section><section className="panel-card"><h2>Safety Invariants</h2>');
  }
  if(content!==original){ write(file, content); console.log("OK master-cockpit: Action History Link ergänzt."); }
  else console.log("SKIP master-cockpit: Action History Link bereits vorhanden.");
}
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "cockpit-actions"')){
    const marker='{ href: "/master-cockpit", label: "Master Cockpit", key: "master-cockpit" },';
    const line='  { href: "/cockpit-actions", label: "Actions", key: "cockpit-actions" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line);
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Cockpit Actions Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Cockpit Actions bereits vorhanden.");
}
const smoke = String.raw`const endpoints = [
  ["UI Master Cockpit", "http://localhost:3000/master-cockpit"],
  ["UI Cockpit Actions", "http://localhost:3000/cockpit-actions"],
  ["API Cockpit Actions", "http://localhost:3000/api/cockpit-actions"],
  ["API Health", "http://localhost:7071/health"],
];
async function main(){
  console.log("======================================");
  console.log(" Phase 14.4 Cockpit Action History Smoke");
  console.log("======================================");
  let ok=true;
  for(const [label,url] of endpoints){
    try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }
    catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; }
  }
  if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); }
  console.log("Smoke OK. Cockpit Action History URLs sind erreichbar.");
}
main();
`;
function patchDocs(){
  ensureFile("phase14-4-cockpit-action-history-dashboard.md", `# Phase 14.4 – Cockpit Action Dashboard / Action History

## Ziel
Cockpit Action Plans aus Phase 14.3 werden in einer Action History sichtbar gemacht.

## Neue UI
- /cockpit-actions

## Zweck
Der Master Agent bekommt eine nachvollziehbare Historie geplanter Orchestrierungs-Schritte. Es bleibt Vorbereitung, keine Ausführung.

## Sicherheitsprinzip
- executionAllowed=false
- toolExecutionAllowed=false
- dryRunOnly=true
- keine echte Tool-Ausführung

## Nächster Schritt
Phase 14.5 kann Final Cockpit Handoff / Release Summary vorbereiten.
`);
  ensureFile("docs/phase14-cockpit-action-history-dashboard-runbook.md", `# Runbook – Phase 14.4 Cockpit Action History

## Patch
\`\`\`powershell
npm run phase14:4:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase14-4-patch-cockpit-action-history-dashboard.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase14:4:verify
npm run build
\`\`\`

Docker nur für Browser/Smoke:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase14:4:smoke
\`\`\`

## Manuelle Prüfung
1. /master-cockpit öffnen.
2. Cockpit Action planen.
3. /cockpit-actions öffnen.
4. Action History prüfen.
`);
}
patchPackage();
ensureFile("frontend/app/cockpit-actions/page.tsx", page);
ensureFile("scripts/phase14-4-cockpit-action-history-smoke.cjs", smoke);
patchCockpit();
patchNavigation();
patchDocs();
console.log("Phase 14.4 Patch abgeschlossen.");
