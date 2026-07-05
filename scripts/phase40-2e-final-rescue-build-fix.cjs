const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content) { fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); console.log("OK " + file); }
function decodeHtml(s) {
  return s
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function repairUnifiedNavigation() {
  const file = "frontend/components/UnifiedNavigation.tsx";
  let c = decodeHtml(read(file));

  const start = c.indexOf("type NavGroup");
  if (start >= 0) {
    const end = c.indexOf("};", start);
    if (end >= 0) {
      c = c.slice(0, start) + "type NavGroup = {\n  title: string;\n  items: NavItem[];\n};" + c.slice(end + 2);
    }
  }

  const marker = "// Phase 40.2 navigation marker: /provider-dispatch-release-candidate-envelope-dashboard RC Dashboard provider-dispatch-release-candidate-envelope-dashboard";
  if (!c.includes("provider-dispatch-release-candidate-envelope-dashboard")) {
    c += "\n" + marker + "\n";
  }

  write(file, c);
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
        <section className="hero-card">
          <h1 className="section-title">Provider Dispatch Release Candidate Envelope Dashboard</h1>
          <p style={{ lineHeight: 1.6 }}>
            Phase 40.2 fasst Provider Dispatch Release Candidate Envelopes, Policy Simulationen,
            Transcript Envelopes und Governance Audit zusammen. Alles bleibt metadata-only und dry-run-only.
          </p>
        </section>
        <section className="panel-card">
          <h2>Provider Dispatch Release Candidate Envelope Übersicht</h2>
          <ul>
            <li>Release Candidate Envelope: /provider-dispatch-release-candidate-envelope</li>
            <li>Release Candidate Policy: /provider-dispatch-release-candidate-envelope-policy</li>
            <li>Transcript Envelope: /provider-dispatch-transcript-envelope</li>
            <li>Governance Audit: /governance-audit</li>
          </ul>
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

function repairLibNewlineRegexes() {
  const dir = full("frontend/lib");
  if (!fs.existsSync(dir)) return;

  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".ts")) continue;
    const file = path.join("frontend/lib", name);
    let c = decodeHtml(read(file));
    const before = c;

    // Fix physical multiline regex corruption: .split(/\n/), where the slash pair is split across lines.
    c = c.replace(/\.split\(\/\s*\r?\n\s*\/\)/g, ".split(/\\r?\\n/)");

    // Same repair, even if whitespace is unusual.
    c = c.replace(/\.split\(\/\s*\n\s*\/\)/g, ".split(/\\r?\\n/)");

    // Fix physical multiline string corruption after JSON.stringify(...)+"\n".
    c = c.replace(/JSON\.stringify\(([^)\r\n]+)\)\s*\+\s*"\s*\r?\n\s*"\s*,/g, 'JSON.stringify($1)+"\\n",');

    if (c !== before) write(file, c);
  }
}

repairUnifiedNavigation();
rewriteDashboardPage();
repairLibNewlineRegexes();
console.log("Phase 40.2e final rescue completed.");
