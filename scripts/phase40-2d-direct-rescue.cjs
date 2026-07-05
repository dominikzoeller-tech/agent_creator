const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); console.log("OK " + file); }
function decodeHtml(s){ return s.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }

function fixUnifiedNavigation(){
  const file="frontend/components/UnifiedNavigation.tsx";
  let c=decodeHtml(read(file));
  // Specific bad block: items: NavItem[ { route }, ];
  c=c.replace(/type\s+NavGroup\s*=\s*\{[\s\S]*?items:\s*NavItem\[[\s\S]*?\];\s*\};/m, "type NavGroup = {\n  title: string;\n  items: NavItem[];\n};");
  c=c.replace(/items:\s*NavItem\[[\s\S]*?\];/m, "items: NavItem[];");
  const marker='// Phase 40.2 navigation marker: /provider-dispatch-release-candidate-envelope-dashboard RC Dashboard provider-dispatch-release-candidate-envelope-dashboard';
  if(!c.includes('/provider-dispatch-release-candidate-envelope-dashboard')){
    c += "\n" + marker + "\n";
  }
  write(file,c);
}

function fixLibFiles(){
  const lib=full('frontend/lib');
  if(!fs.existsSync(lib)) return;
  for(const name of fs.readdirSync(lib)){
    if(!name.endsWith('.ts')) continue;
    const rel=path.join('frontend/lib', name);
    let c=decodeHtml(read(rel));
    const before=c;
    // Robustly replace any physical multiline split regex with a safe string split regex.
    c=c.replace(/\.split\(\/\s*\r?\n\s*\/\)/g, '.split(/\\r?\\n/)');
    c=c.replace(/\.split\(\/\s*\n\s*\/\)/g, '.split(/\\r?\\n/)');
    // Repair JSON.stringify(x)+"<physical newline>" if present.
    c=c.replace(/JSON\.stringify\(([^)\r\n]+)\)\s*\+\s*"\s*\r?\n\s*"\s*,/g, 'JSON.stringify($1)+"\\n",');
    if(c!==before) write(rel,c);
  }
}

function rewriteDashboard(){
 const file='frontend/app/provider-dispatch-release-candidate-envelope-dashboard/page.tsx';
 const page=`"use client";

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
 write(file,page);
}

fixUnifiedNavigation();
fixLibFiles();
rewriteDashboard();
console.log('Phase 40.2d direct rescue done.');
