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
  pkg.scripts["phase13:4:patch"]="node scripts/phase13-4-patch-tool-adapter-dashboard-smoke.cjs";
  pkg.scripts["phase13:4:verify"]="node scripts/phase13-4-verify-tool-adapter-dashboard-smoke.cjs";
  pkg.scripts["phase13:4:smoke"]="node scripts/phase13-4-tool-adapter-smoke.cjs";
  pkg.scripts["tool-adapter:release:check"]="npm run phase13:0:verify && npm run phase13:1:verify && npm run phase13:2:verify && npm run phase13:3:verify && npm run phase13:4:verify && npm run phase13:4:smoke";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 13.4 Scripts eingetragen.");
}
const dashboardPage = String.raw`"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: any; items?: any[]; error?: string };
async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { cache: "no-store" });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.error || "Request failed: " + url);
  return payload;
}
export default function ToolAdapterDashboardPage(){
  const [adapters,setAdapters]=useState<ApiState>({});
  const [plans,setPlans]=useState<ApiState>({});
  const [bindings,setBindings]=useState<ApiState>({});
  const [resumes,setResumes]=useState<ApiState>({});
  const [policy,setPolicy]=useState<ApiState>({});
  const [audit,setAudit]=useState<ApiState>({});
  const [error,setError]=useState<string|null>(null);
  async function load(){
    setError(null);
    try{
      const [adapterPayload, bindingPayload, resumePayload, policyPayload, auditPayload] = await Promise.all([
        fetchJson("/api/tool-adapters?limit=100"),
        fetchJson("/api/tool-adapter-consent"),
        fetchJson("/api/tool-adapter-resume?limit=100"),
        fetchJson("/api/tool-adapter-policy?limit=100"),
        fetchJson("/api/governance-audit?limit=100"),
      ]);
      setAdapters({ summary: adapterPayload.adapterSummary, items: adapterPayload.adapters || [] });
      setPlans({ summary: adapterPayload.planSummary, items: adapterPayload.plans || [] });
      setBindings({ summary: bindingPayload.summary, items: bindingPayload.bindings || [] });
      setResumes({ summary: resumePayload.summary, items: resumePayload.plans || [] });
      setPolicy({ summary: policyPayload.summary, items: policyPayload.simulations || [] });
      setAudit({ summary: auditPayload.summary, items: auditPayload.events || [] });
    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
  }
  useEffect(()=>{ load(); }, []);
  const cards = [
    ["Tool Adapters", adapters, "/tool-sandbox"],
    ["Dry-run Plans", plans, "/tool-sandbox"],
    ["Consent Bindings", bindings, "/tool-adapter-consent"],
    ["Resume Plans", resumes, "/tool-adapter-resume"],
    ["Policy Simulations", policy, "/tool-adapter-policy"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;
  return <main className="page-wrap"><UnifiedNavigation active="tool-adapter-dashboard" /><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#f8fafc 0%,#ecfeff 100%)", borderColor:"#67e8f9" }}><h1 className="section-title">Tool Adapter Dashboard</h1><p style={{ lineHeight:1.6 }}>Phase 13.4 fasst Tool Adapter, Dry-run Plans, Consent Bindings, Resume Plans, Policy Simulationen und Governance Audit zusammen. Keine echte Tool-Ausführung.</p><button className="secondary-button" type="button" onClick={load}>Dashboard aktualisieren</button></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Tool Adapter Übersicht</h2><div className="metrics-grid">{cards.map(([title,state,href])=><a className="metric-card" href={href} key={title} style={{ textDecoration:"none", color:"inherit" }}><span className="metric-label">{title}</span><strong className="metric-value">{state.items?.length ?? 0}</strong><pre style={{ whiteSpace:"pre-wrap", marginTop:8 }}>{JSON.stringify(state.summary ?? {}, null, 2)}</pre></a>)}</div></section><section className="panel-card"><h2>Safety Invariants</h2><ul><li><strong>toolExecutionAllowed</strong> bleibt false.</li><li><strong>dryRunOnly</strong> bleibt true.</li><li><strong>Tool Adapter</strong> sind nur Registry-/Plan-/Simulationsobjekte.</li><li><strong>Consent Approval</strong> erlaubt in Phase 13.4 noch keine echte Ausführung.</li></ul></section></div></main>;
}
`;
const smokeScript = String.raw`const endpoints = [
  ["UI Tool Sandbox", "http://localhost:3000/tool-sandbox"],
  ["UI Tool Adapter Consent", "http://localhost:3000/tool-adapter-consent"],
  ["UI Tool Adapter Resume", "http://localhost:3000/tool-adapter-resume"],
  ["UI Tool Adapter Policy", "http://localhost:3000/tool-adapter-policy"],
  ["UI Tool Adapter Dashboard", "http://localhost:3000/tool-adapter-dashboard"],
  ["API Tool Adapters", "http://localhost:3000/api/tool-adapters"],
  ["API Tool Adapter Consent", "http://localhost:3000/api/tool-adapter-consent"],
  ["API Tool Adapter Resume", "http://localhost:3000/api/tool-adapter-resume"],
  ["API Tool Adapter Policy", "http://localhost:3000/api/tool-adapter-policy"],
  ["API Governance Audit", "http://localhost:3000/api/governance-audit"],
  ["API Health", "http://localhost:7071/health"],
];
async function main(){
  console.log("======================================");
  console.log(" Phase 13.4 Tool Adapter Dashboard Smoke");
  console.log("======================================");
  let ok=true;
  for(const [label, url] of endpoints){
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
  console.log("Smoke OK. Phase 13 Tool Adapter URLs sind erreichbar.");
}
main();
`;
function patchNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  if(!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content=read(file); const original=content;
  if(!content.includes('key: "tool-adapter-dashboard"')){
    const marker='  { href: "/tool-adapter-policy", label: "Tool Policy", key: "tool-adapter-policy" },';
    const line='  { href: "/tool-adapter-dashboard", label: "Tool Dashboard", key: "tool-adapter-dashboard" },';
    if(content.includes(marker)) content=content.replace(marker, marker+'\n'+line);
    else content=content.replace('  { href: "/analytics", label: "Analytics", key: "analytics" },', line+'\n  { href: "/analytics", label: "Analytics", key: "analytics" },');
  }
  if(content!==original){ write(file, content); console.log("OK UnifiedNavigation: Tool Adapter Dashboard Link ergänzt."); }
  else console.log("SKIP UnifiedNavigation: Tool Adapter Dashboard bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase13-4-tool-adapter-dashboard-smoke.md", `# Phase 13.4 – Tool Adapter Dashboard & Phase-13 Smoke

## Ziel
Phase 13.4 ergänzt ein Tool Adapter Dashboard und einen Smoke-Test für den Phase-13-Tool-Adapter-Block.

## Dashboard
- /tool-adapter-dashboard
- fasst Tool Adapter Registry, Dry-run Plans, Consent Bindings, Resume Plans, Policy Simulations und Governance Audit zusammen

## Smoke
- npm run phase13:4:smoke prüft Tool Adapter UI/API Routen

## Sicherheitsprinzip
Keine echte Tool-Ausführung. Dashboard und Smoke validieren nur Erreichbarkeit und Dry-run-Governance.

## Nächster Schritt
Phase 13.5 kann Final Tool Adapter Handoff / Release Summary vorbereiten.
`);
  ensureFile("docs/phase13-tool-adapter-dashboard-smoke-runbook.md", `# Runbook – Phase 13.4 Tool Adapter Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase13:4:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase13-4-patch-tool-adapter-dashboard-smoke.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase13:4:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase13:4:smoke
\`\`\`

## Manuelle Prüfung
1. /tool-adapter-dashboard öffnen.
2. Cards für Adapter, Plans, Consent, Resume, Policy, Audit prüfen.
3. Smoke Script muss alle Tool Adapter Routen mit OK melden.
`);
}
patchPackage();
ensureFile("frontend/app/tool-adapter-dashboard/page.tsx", dashboardPage);
ensureFile("scripts/phase13-4-tool-adapter-smoke.cjs", smokeScript);
patchNavigation();
patchDocs();
console.log("Phase 13.4 Patch abgeschlossen.");
