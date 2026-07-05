const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), content, "utf8");
}
function ensureFile(file, content) {
  if (!exists(file)) {
    write(file, content);
    console.log("OK " + file + ": erstellt.");
  } else {
    console.log("SKIP " + file + ": existiert bereits.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["phase33:2:patch"] = "node scripts/phase33-2-patch-provider-dispatch-readiness-dashboard-smoke.cjs";
  pkg.scripts["phase33:2:verify"] = "node scripts/phase33-2-verify-provider-dispatch-readiness-dashboard-smoke.cjs";
  pkg.scripts["phase33:2:smoke"] = "node scripts/phase33-2-provider-dispatch-readiness-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-dispatch-readiness:release:check"] = "npm run phase33:0:verify && npm run phase33:1:verify && npm run phase33:2:verify && npm run phase33:2:smoke";
  write(file, JSON.stringify(pkg, null, 2) + "\n");
  console.log("OK package.json: Phase 33.2 Scripts eingetragen.");
}

const page = `"use client";

import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ApiState = { summary?: unknown; items?: unknown[] };

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.error || url);
  return payload;
}

export default function ProviderDispatchReadinessDashboardPage() {
  const [readiness, setReadiness] = useState<ApiState>({});
  const [policy, setPolicy] = useState<ApiState>({});
  const [envelopes, setEnvelopes] = useState<ApiState>({});
  const [audit, setAudit] = useState<ApiState>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [r, p, e, a] = await Promise.all([
        fetchJson("/api/provider-dispatch-readiness?limit=200"),
        fetchJson("/api/provider-dispatch-readiness-policy?limit=200"),
        fetchJson("/api/provider-request-envelope?limit=200"),
        fetchJson("/api/governance-audit?limit=200"),
      ]);
      setReadiness({ summary: r.summary, items: r.providerDispatchReadiness || [] });
      setPolicy({ summary: p.summary, items: p.simulations || [] });
      setEnvelopes({ summary: e.summary, items: e.providerRequestEnvelopes || [] });
      setAudit({ summary: a.summary, items: a.events || [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }

  useEffect(() => { load(); }, []);

  const cards = [
    ["Provider Dispatch Readiness", readiness, "/provider-dispatch-readiness"],
    ["Provider Dispatch Readiness Policy", policy, "/provider-dispatch-readiness-policy"],
    ["Provider Request Envelopes", envelopes, "/provider-request-envelope"],
    ["Governance Audit", audit, "/governance-audit"],
  ] as const;

  return (
    <main className="page-wrap">
      <UnifiedNavigation active="provider-dispatch-readiness-dashboard" />
      <div className="page-shell">
        <section
          className="hero-card"
          style={{ background: "linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)", borderColor: "#c7d2fe" }}
        >
          <h1 className="section-title">Provider Dispatch Readiness Dashboard</h1>
          <p style={{ lineHeight: 1.6 }}>
            Phase 33.2 fasst Provider Dispatch Readiness, Policy Simulationen,
            Provider Request Envelopes und Governance Audit zusammen. Readiness bleibt
            metadata-only. Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf,
            kein Prompt Payload, keine Secret-Werte und kein sensibler Request Body.
          </p>
          <button className="secondary-button" type="button" onClick={load}>
            Dashboard aktualisieren
          </button>
        </section>

        {error ? (
          <section className="panel-card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
            {error}
          </section>
        ) : null}

        <section className="panel-card">
          <h2>Provider Dispatch Readiness Übersicht</h2>
          <div className="metrics-grid">
            {cards.map(([title, state, href]) => (
              <a className="metric-card" href={href} key={title} style={{ textDecoration: "none", color: "inherit" }}>
                <span className="metric-label">{title}</span>
                <strong className="metric-value">{state.items?.length ?? 0}</strong>
                <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                  {JSON.stringify(state.summary ?? {}, null, 2)}
                </pre>
              </a>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <h2>Safety Invariants</h2>
          <ul>
            <li>controlled_provider_dispatch_readiness_metadata_only_no_provider_call</li>
            <li>providerDispatchPrepared=true</li>
            <li>providerDispatchPerformed=false</li>
            <li>metadataOnly=true</li>
            <li>provider=none</li>
            <li>modelSelected=none</li>
            <li>dispatchPayloadIncluded=false</li>
            <li>envelopePayloadIncluded=false</li>
            <li>promptPayloadIncluded=false</li>
            <li>promptIncluded=false</li>
            <li>promptRedactedPreviewIncluded=false</li>
            <li>secretValuesIncluded=false</li>
            <li>requestBodyIncluded=false</li>
            <li>sensitiveRequestBodyIncluded=false</li>
            <li>networkCallPerformed=false</li>
            <li>providerExecutionAllowed=false</li>
            <li>realLlmCallAllowed=false</li>
            <li>llmCallPerformed=false</li>
            <li>executionAllowed=false</li>
            <li>toolExecutionAllowed=false</li>
            <li>agentExecutionAllowed=false</li>
            <li>dryRunOnly=true</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
`;

const smoke = `const endpoints = [
  ["UI Provider Dispatch Dashboard", "http://localhost:3000/provider-dispatch-readiness-dashboard"],
  ["UI Provider Dispatch Readiness", "http://localhost:3000/provider-dispatch-readiness"],
  ["UI Provider Dispatch Policy", "http://localhost:3000/provider-dispatch-readiness-policy"],
  ["API Provider Dispatch Readiness", "http://localhost:3000/api/provider-dispatch-readiness"],
  ["API Provider Dispatch Policy", "http://localhost:3000/api/provider-dispatch-readiness-policy"],
  ["API Health", "http://localhost:7071/health"],
];

async function main() {
  console.log("======================================");
  console.log(" Phase 33.2 Provider Dispatch Readiness Dashboard Smoke");
  console.log("======================================");

  let ok = true;
  for (const [label, url] of endpoints) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const good = res.status >= 200 && res.status < 400;
      console.log((good ? "OK  " : "MISS") + " " + label + ": " + res.status + " " + url);
      if (!good) ok = false;
    } catch (error) {
      console.log("MISS " + label + ": " + url);
      console.log(error instanceof Error ? error.message : String(error));
      ok = false;
    }
  }
  if (!ok) {
    console.error("Smoke fehlgeschlagen.");
    process.exit(1);
  }
  console.log("Smoke OK. Provider Dispatch Readiness URLs sind erreichbar.");
}
main();
`;

const verify = `const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns) {
  if (!exists(file)) { console.log("MISS " + file); return false; }
  const content = read(file);
  let ok = true;
  for (const p of patterns) {
    const found = content.includes(p);
    console.log((found ? "OK  " : "MISS") + " " + file + ": " + p);
    if (!found) ok = false;
  }
  return ok;
}
console.log("======================================");
console.log(" Phase 33.2 Provider Dispatch Readiness Dashboard Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/provider-dispatch-readiness-dashboard/page.tsx", [
  "Provider Dispatch Readiness Dashboard",
  "Provider Dispatch Readiness Übersicht",
  "providerDispatchPrepared=true",
  "providerDispatchPerformed=false",
  "metadataOnly=true",
  "dispatchPayloadIncluded=false",
  "envelopePayloadIncluded=false",
  "promptPayloadIncluded=false",
  "secretValuesIncluded=false",
  "requestBodyIncluded=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", [
  "/provider-dispatch-readiness-dashboard",
  "Provider Dispatch Dashboard",
  "provider-dispatch-readiness-dashboard"
]) && ok;
ok = check("scripts/phase33-2-provider-dispatch-readiness-dashboard-smoke.cjs", [
  "Phase 33.2 Provider Dispatch Readiness Dashboard Smoke",
  "UI Provider Dispatch Dashboard",
  "API Provider Dispatch Policy"
]) && ok;
ok = check("phase33-2-provider-dispatch-readiness-dashboard-smoke.md", [
  "Phase 33.2",
  "Provider Dispatch Readiness Dashboard",
  "Phase 33.3",
  "providerDispatchPrepared=true",
  "providerDispatchPerformed=false",
  "metadataOnly=true",
  "dispatchPayloadIncluded=false",
  "envelopePayloadIncluded=false",
  "promptPayloadIncluded=false",
  "secretValuesIncluded=false",
  "requestBodyIncluded=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase33-provider-dispatch-readiness-dashboard-smoke-runbook.md", [
  "phase33:2:verify",
  "phase33:2:smoke"
]) && ok;
ok = check("package.json", [
  "phase33:2:verify",
  "phase33:2:smoke",
  "llm:provider-dispatch-readiness:release:check"
]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 33.2 Provider Dispatch Readiness Dashboard & Smoke ist vorbereitet.");
`;

const md = `# Phase 33.2 – Provider Dispatch Readiness Dashboard & Smoke

## Ziel
Provider Dispatch Readiness und Provider Dispatch Readiness Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI
- /provider-dispatch-readiness-dashboard

## Sicherheitsprinzip
- controlled_provider_dispatch_readiness_metadata_only_no_provider_call
- providerDispatchPrepared=true
- providerDispatchPerformed=false
- metadataOnly=true
- provider=none
- modelSelected=none
- dispatchPayloadIncluded=false
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
Phase 33.3 – Final Provider Dispatch Readiness Handoff / Release Summary
`;

const runbook = `# Runbook – Phase 33.2 Provider Dispatch Readiness Dashboard & Smoke

## Patch
\`\`\`powershell
npm run phase33:2:patch
\`\`\`

## Verify
\`\`\`powershell
npm run phase33:2:verify
npm run build
\`\`\`

## Smoke
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase33:2:smoke
\`\`\`
`;

function patchNavigation() {
  const file = "frontend/components/UnifiedNavigation.tsx";
  if (!exists(file)) return console.log("SKIP UnifiedNavigation fehlt.");
  let content = read(file);
  if (content.includes('provider-dispatch-readiness-dashboard')) {
    console.log("SKIP UnifiedNavigation: Dashboard Link bereits vorhanden.");
    return;
  }
  const line = '  { href: "/provider-dispatch-readiness-dashboard", label: "Provider Dispatch Dashboard", key: "provider-dispatch-readiness-dashboard" },';
  const markers = [
    '{ href: "/provider-dispatch-readiness-policy", label: "Provider Dispatch Policy", key: "provider-dispatch-readiness-policy" },',
    '{ href: "/provider-dispatch-readiness", label: "Provider Dispatch Readiness", key: "provider-dispatch-readiness" },'
  ];
  let patched = false;
  for (const marker of markers) {
    if (content.includes(marker)) {
      content = content.replace(marker, marker + "\n" + line);
      patched = true;
      break;
    }
  }
  if (!patched) {
    const idx = content.indexOf("];", content.indexOf("href:"));
    if (idx < 0) throw new Error("Konnte Navigation-Liste nicht finden.");
    content = content.slice(0, idx) + line + "\n" + content.slice(idx);
  }
  write(file, content);
  console.log("OK UnifiedNavigation: Provider Dispatch Dashboard Link ergänzt.");
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["phase33:2:patch"] = "node scripts/phase33-2-patch-provider-dispatch-readiness-dashboard-smoke.cjs";
  pkg.scripts["phase33:2:verify"] = "node scripts/phase33-2-verify-provider-dispatch-readiness-dashboard-smoke.cjs";
  pkg.scripts["phase33:2:smoke"] = "node scripts/phase33-2-provider-dispatch-readiness-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-dispatch-readiness:release:check"] = "npm run phase33:0:verify && npm run phase33:1:verify && npm run phase33:2:verify && npm run phase33:2:smoke";
  write(file, JSON.stringify(pkg, null, 2) + "\n");
  console.log("OK package.json: Phase 33.2 Scripts eingetragen.");
}

patchPackage();
ensureFile("frontend/app/provider-dispatch-readiness-dashboard/page.tsx", page);
ensureFile("scripts/phase33-2-provider-dispatch-readiness-dashboard-smoke.cjs", smoke);
ensureFile("scripts/phase33-2-verify-provider-dispatch-readiness-dashboard-smoke.cjs", verify);
ensureFile("phase33-2-provider-dispatch-readiness-dashboard-smoke.md", md);
ensureFile("docs/phase33-provider-dispatch-readiness-dashboard-smoke-runbook.md", runbook);
patchNavigation();
console.log("Phase 33.2 Patch abgeschlossen.");
