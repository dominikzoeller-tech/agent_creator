const fs = require("fs");
const path = require("path");

function full(file) {
  return path.join(process.cwd(), file);
}
function exists(file) {
  return fs.existsSync(full(file));
}
function read(file) {
  return exists(file) ? fs.readFileSync(full(file), "utf8") : "";
}
function write(file, content) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), content, "utf8");
  console.log("OK " + file);
}

function patchBrokenNewlineLiterals() {
  const libDir = full("frontend/lib");
  if (!fs.existsSync(libDir)) return;

  const files = fs.readdirSync(libDir)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => path.join("frontend/lib", name));

  for (const file of files) {
    let content = read(file);
    const before = content;

    // Fix broken .split(/
    // /) style regexes.
    content = content.replace(/\.split\(\/\s*[\r\n]+\s*\/\)/g, ".split(/\\r?\\n/)");

    // Fix broken JSON.stringify(x)+"
    // " append literals.
    content = content.replace(
      /JSON\.stringify\(([^)\r\n]+)\)\s*\+\s*"\s*[\r\n]+\s*"\s*,/g,
      'JSON.stringify($1)+"\\n",'
    );

    if (content !== before) {
      write(file, content);
    }
  }
}

function patchUnifiedNavigation() {
  const file = "frontend/components/UnifiedNavigation.tsx";
  if (!exists(file)) {
    console.log("SKIP UnifiedNavigation fehlt.");
    return;
  }

  let content = read(file);

  // Repair corrupted NavGroup type block.
  content = content.replace(
    /type\s+NavGroup\s*=\s*\{\s*title:\s*string;\s*items:\s*NavItem\[[\s\S]*?\n\};/,
    "type NavGroup = {\n  title: string;\n  items: NavItem[];\n};"
  );

  const route = '  { href: "/provider-dispatch-release-candidate-envelope-dashboard", label: "RC Dashboard", key: "provider-dispatch-release-candidate-envelope-dashboard" },';

  if (!content.includes("/provider-dispatch-release-candidate-envelope-dashboard")) {
    const markers = [
      /.*provider-dispatch-release-candidate-envelope-policy.*\n/,
      /.*provider-dispatch-release-candidate-envelope.*\n/,
    ];

    let inserted = false;
    for (const marker of markers) {
      const match = content.match(marker);
      if (match) {
        content = content.replace(match[0], match[0] + route + "\n");
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      const idx = content.indexOf("];", content.indexOf("href:"));
      if (idx >= 0) {
        content = content.slice(0, idx) + route + "\n" + content.slice(idx);
      }
    }
  }

  write(file, content);
}

function ensureDashboardPage() {
  const file = "frontend/app/provider-dispatch-release-candidate-envelope-dashboard/page.tsx";
  const page = `"use client";

import { UnifiedNavigation } from "../../components/UnifiedNavigation";

export default function ProviderDispatchReleaseCandidateEnvelopeDashboardPage() {
  return (
    <main className="page-wrap">
      <UnifiedNavigation active="provider-dispatch-release-candidate-envelope-dashboard" />
      <div className="page-shell">
        <section className="hero-card" style={{ background: "linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)", borderColor: "#c7d2fe" }}>
          <h1 className="section-title">Provider Dispatch Release Candidate Envelope Dashboard</h1>
          <p style={{ lineHeight: 1.6 }}>
            Phase 40.2 fasst Provider Dispatch Release Candidate Envelopes, Policy Simulationen,
            Transcript Envelopes und Governance Audit zusammen. Alles bleibt metadata-only und dry-run-only.
            Kein Provider Dispatch, kein Provider-/Netzwerk-Aufruf, kein Prompt Payload, keine Secret-Werte
            und keine Provider Response.
          </p>
        </section>

        <section className="panel-card">
          <h2>Provider Dispatch Release Candidate Envelope Übersicht</h2>
          <div className="metrics-grid">
            /provider-dispatch-release-candidate-envelope<span className="metric-label">Release Candidate Envelope</span><strong className="metric-value">Öffnen</strong></a>
            /provider-dispatch-release-candidate-envelope-policy<span className="metric-label">Release Candidate Policy</span><strong className="metric-value">Öffnen</strong></a>
            /provider-dispatch-transcript-envelope<span className="metric-label">Transcript Envelope</span><strong className="metric-value">Öffnen</strong></a>
            /governance-audit<span className="metric-label">Governance Audit</span><strong className="metric-value">Öffnen</strong></a>
          </div>
        </section>

        <section className="panel-card">
          <h2>Safety Invariants</h2>
          <ul>
            <li>providerDispatchReleaseCandidateEnvelopePrepared=true</li>
            <li>releaseCandidateEnvelopePrepared=true</li>
            <li>releaseCandidateEnvelopePersisted=true</li>
            <li>releaseCandidateReadyForHumanReview=true</li>
            <li>releaseCandidateApproved=false</li>
            <li>releaseCandidateExecuted=false</li>
            <li>releaseCandidateContainsProviderResponse=false</li>
            <li>releaseCandidateContainsPromptPayload=false</li>
            <li>releaseCandidateContainsSecrets=false</li>
            <li>networkCallAllowed=false</li>
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
  write(file, page);
}

function patchPackageScripts() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["phase40:2:patch"] = "node scripts/phase40-2-patch-provider-dispatch-release-candidate-envelope-dashboard-smoke.cjs";
  pkg.scripts["phase40:2:verify"] = "node scripts/phase40-2-verify-provider-dispatch-release-candidate-envelope-dashboard-smoke.cjs";
  pkg.scripts["phase40:2:smoke"] = "node scripts/phase40-2-provider-dispatch-release-candidate-envelope-dashboard-smoke.cjs";
  pkg.scripts["llm:provider-dispatch-release-candidate-envelope:release:check"] = "npm run phase40:0:verify && npm run phase40:1:verify && npm run phase40:2:verify && npm run phase40:2:smoke";
  write(file, JSON.stringify(pkg, null, 2) + "\n");
}

patchBrokenNewlineLiterals();
patchUnifiedNavigation();
ensureDashboardPage();
patchPackageScripts();

console.log("Phase 40.2 Hotfix abgeschlossen.");
