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

function decodeHtml(content) {
  return content
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function fixLibRegexes() {
  const libDir = full("frontend/lib");
  if (!fs.existsSync(libDir)) return;

  for (const name of fs.readdirSync(libDir)) {
    if (!name.endsWith(".ts")) continue;

    const file = path.join("frontend/lib", name);
    let content = decodeHtml(read(file));
    const before = content;

    // Fix broken .split(/
    // /)
    content = content.replace(/\.split\(\/\s*[\r\n]+\s*\/\)/g, ".split(/\\r?\\n/)");

    // Fix broken JSON.stringify(x)+"
    // "
    content = content.replace(
      /JSON\.stringify\(([^)\r\n]+)\)\s*\+\s*"\s*[\r\n]+\s*"\s*,/g,
      'JSON.stringify($1)+"\\n",'
    );

    if (content !== before) {
      write(file, content);
    }
  }
}

function fixUnifiedNavigation() {
  const file = "frontend/components/UnifiedNavigation.tsx";
  let content = decodeHtml(read(file));

  // Repair corrupted NavGroup type block.
  content = content.replace(
    /type\s+NavGroup\s*=\s*\{\s*title:\s*string;\s*items:\s*NavItem\[[\s\S]*?\];\s*\};/m,
    "type NavGroup = {\n  title: string;\n  items: NavItem[];\n};"
  );

  content = content.replace(
    /items:\s*NavItem\[[^\n]*\n\s*\];/g,
    "items: NavItem[];"
  );

  const route = '  { href: "/provider-dispatch-release-candidate-envelope-dashboard", label: "RC Dashboard", key: "provider-dispatch-release-candidate-envelope-dashboard" },';

  if (!content.includes("/provider-dispatch-release-candidate-envelope-dashboard")) {
    const lines = content.split(/\r?\n/);
    let idx = lines.findIndex((line) => line.includes("provider-dispatch-release-candidate-envelope-policy"));
    if (idx < 0) idx = lines.findIndex((line) => line.includes("provider-dispatch-release-candidate-envelope"));

    if (idx >= 0) {
      lines.splice(idx + 1, 0, route);
      content = lines.join("\n");
    } else {
      const insertAt = content.indexOf("];", content.indexOf("href:"));
      if (insertAt >= 0) {
        content = content.slice(0, insertAt) + route + "\n" + content.slice(insertAt);
      }
    }
  }

  write(file, content);
}

function rewriteDashboardPage() {
  const file = "frontend/app/provider-dispatch-release-candidate-envelope-dashboard/page.tsx";

  const page = `"use client";

import { UnifiedNavigation } from "../../components/UnifiedNavigation";

export default function ProviderDispatchReleaseCandidateEnvelopeDashboardPage() {
  return (
    <main className="page-wrap">
      <UnifiedNavigation active="provider-dispatch-release-candidate-envelope-dashboard" />

      <div className="page-shell">
        <section
          className="hero-card"
          style={{
            background: "linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",
            borderColor: "#c7d2fe",
          }}
        >
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
            /provider-dispatch-release-candidate-envelope
              <span className="metric-label">Release Candidate Envelope</span>
              <strong className="metric-value">Öffnen</strong>
            </a>

            /provider-dispatch-release-candidate-envelope-policy
              <span className="metric-label">Release Candidate Policy</span>
              <strong className="metric-value">Öffnen</strong>
            </a>

            /provider-dispatch-transcript-envelope
              <span className="metric-label">Transcript Envelope</span>
              <strong className="metric-value">Öffnen</strong>
            </a>

            /governance-audit
              <span className="metric-label">Governance Audit</span>
              <strong className="metric-value">Öffnen</strong>
            </a>
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

fixLibRegexes();
fixUnifiedNavigation();
rewriteDashboardPage();

console.log("Phase 40.2c Rescue Build Hotfix abgeschlossen.");
