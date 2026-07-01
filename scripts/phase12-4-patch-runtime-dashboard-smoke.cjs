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
  pkg.scripts["phase12:4:patch"]="node scripts/phase12-4-patch-runtime-dashboard-smoke.cjs";
  pkg.scripts["phase12:4:verify"]="node scripts/phase12-4-verify-runtime-dashboard-smoke.cjs";
  pkg.scripts["phase12:4:smoke"]="node scripts/phase12-4-runtime-dashboard-smoke.cjs";
  pkg.scripts["runtime:release:check"]="npm run phase12:0:verify && npm run phase12:1:verify && npm run phase12:2:verify && npm run phase12:3:verify && npm run phase12:4:verify && npm run phase12:4:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.4 Scripts eingetragen.");
}
const dashboardPage = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { ok?: boolean; summary?: any; items?: any[]; error?: string };
async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { cache: "no-store" });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.error || "Request failed: " + url);
  return payload;
}
export default function AgentRuntimeDashboardPage(){
  const [runtime,setRuntime]=useState<ApiState>({});
  const [consent,setConsent]=useState<ApiState>({});
  const [resume,setResume]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [runtimePayload, consentPayload, resumePayload, policyPayload, auditPayload] = await Promise.all([
        fetchJson("/api/agent-runtime?limit=100"),
        fetchJson("/api/agent-runtime-consent"),
        fetchJson("/api/agent-runtime-resume?limit=100"),
        fetchJson("/api/agent-runtime-policy?limit=100"),
        fetchJson("/api/governance-audit?limit=100"),
      ]);
      setRuntime({ ok:true, summary: runtimePayload.summary, items: runtimePayload.envelopes || [] });
      setConsent({ ok:true, summary: consentPayload.summary, items: consentPayload.bindings || [] });
      setResume({ ok:true, summary: resumePayload.summary, items: resumePayload.envelopes || [] });
      setPolicy({ ok:true, summary: policyPayload.summary, items: policyPayload.simulations || [] });
      setAudit({ ok:true, summary: auditPayload.summary, items: auditPayload.events || [] });
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  const cards = [
    ["Runtime Envelopes", runtime, "/agent-runtime"],
    ["Runtime Consent Bindings", consent, "/agent-runtime-consent"],
    ["Runtime Resume Envelopes", resume, "/agent-runtime-resume"],
    ["Policy Simulations", policy, "/agent-runtime-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="agent-runtime-dashboard" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)", borderColor:"#c7d2fe" }}><h1 className="section-title">Runtime Dashboard</h1><p style={{ lineHeight:1.6 }}>Phase 12.4 fasst Runtime Envelopes, Consent Bindings, Resume Envelopes, Policy Simulationen und Governance Audit zusammen. Keine echte Tool-Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Runtime Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{ textDecoration:"none", color:"inherit" }}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{ whiteSpace:"pre-wrap", marginTop:8 }}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li><strong>toolExecutionAllowed</strong> muss weiterhin false bleiben.</li><li><strong>dryRunOnly</strong> muss weiterhin true bleiben.</li><li><strong>Policy Simulationen</strong> sind nur Simulationen.</li><li><strong>Consent Approval</strong> erlaubt in Phase 12.4 noch keine echte Ausführung.</li></ul></section></div></main>;
}
`;
const smokeScript = String.raw`const endpoints = [
  ["UI Agent Runtime", "http://localhost:3000/agent-runtime"],
  ["UI Runtime Consent", "http://localhost:3000/agent-runtime-consent"],
  ["UI Runtime Resume", "http://localhost:3000/agent-runtime-resume"],
  ["UI Runtime Policy", "http://localhost:3000/agent-runtime-policy"],
  ["UI Runtime Dashboard", "http://localhost:3000/agent-runtime-dashboard"],
  ["API Agent Runtime", "http://localhost:3000/api/agent-runtime"],
  ["API Runtime Consent", "http://localhost:3000/api/agent-runtime-consent"],
  ["API Runtime Resume", "http://localhost:3000/api/agent-runtime-resume"],
  ["API Runtime Policy", "http://localhost:3000/api/agent-runtime-policy"],
  ["API Governance Audit", "http://localhost:3000/api/governance-audit"],
  ["API Health", "http://localhost:7071/health"],
];
async function main(){
  console.log("======================================");
  console.log(" Phase 12.4 Runtime Dashboard Smoke");
  console.log("======================================");
  let ok=true;
  for(const entry of endpoints){
    const label = entry[0];
    const url = entry[1];
    try{
      const res = await fetch(url, { cache: "no-store" });
      const good = res.status >= 200 && res.status < 400;
      console.log((good ? "OK  " : "MISS") + " " + label + ": " + res.status + " " + url);
      if(!good) ok=false;
    } catch(error){
      console.log("MISS " + label + ": " + url);
      console.log(error instanceof Error ? error.message : String(error));
      ok=false;
    }
  }
  if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); }
  console.log("Smoke OK. Phase 12 Runtime URLs sind erreichbar.");
}
main();
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "agent-runtime-dashboard"')){
    const marker='  { href: "/agent-runtime-policy", label: "Runtime Policy", key: "agent-runtime-policy" },';
    const line='  { href: "/agent-runtime-dashboard", label: "Runtime Dashboard", key: "agent-runtime-dashboard" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line);
    else content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', line+'\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Runtime Dashboard Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Runtime Dashboard bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase12-4-runtime-dashboard-smoke.md", `# Phase 12.4 – Runtime Dashboard & Phase-12 Smoke

## Ziel
Phase 12.4 ergänzt ein Runtime Dashboard und einen Smoke-Test für den Phase-12-Runtime-Block.

## Dashboard
- /agent-runtime-dashboard
- fasst Runtime Envelopes, Consent Bindings, Resume Envelopes, Policy Simulations und Governance Audit zusammen

## Smoke
- npm run phase12:4:smoke prüft Runtime UI/API Routen

## Sicherheitsprinzip
Keine echte Tool-Ausführung. Dashboard und Smoke validieren nur Erreichbarkeit und Dry-run-Governance.

## Nächster Schritt
Phase 12.5 kann Final Runtime Handoff / Release Summary vorbereiten.
`);
  ensureFile("docs/phase12-runtime-dashboard-smoke-runbook.md", `# Runbook – Phase 12.4 Runtime Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase12:4:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase12-4-patch-runtime-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase12:4:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase12:4:smoke
\`\`\`

## Manuelle Prüfung
1. /agent-runtime-dashboard öffnen.
2. Cards für Runtime, Consent, Resume, Policy, Audit prüfen.
3. Smoke Script muss alle Runtime Routen mit OK melden.
`);
}
function patchPackage(){
  const file="package.json"; const pkg=JSON.parse(read(file)); pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase12:4:patch"]="node scripts/phase12-4-patch-runtime-dashboard-smoke.cjs";
  pkg.scripts["phase12:4:verify"]="node scripts/phase12-4-verify-runtime-dashboard-smoke.cjs";
  pkg.scripts["phase12:4:smoke"]="node scripts/phase12-4-runtime-dashboard-smoke.cjs";
  pkg.scripts["runtime:release:check"]="npm run phase12:0:verify && npm run phase12:1:verify && npm run phase12:2:verify && npm run phase12:3:verify && npm run phase12:4:verify && npm run phase12:4:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 12.4 Scripts eingetragen.");
}
patchPackage();
ensureFile("frontend/app/agent-runtime-dashboard/page.tsx", dashboardPage);
ensureFile("scripts/phase12-4-runtime-dashboard-smoke.cjs", smokeScript);
patchNavigation();
patchDocs();
console.log("Phase 12.4 Patch abgeschlossen.");
