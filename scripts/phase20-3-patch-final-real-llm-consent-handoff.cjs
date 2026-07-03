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
  pkg.scripts["phase20:3:patch"]="node scripts/phase20-3-patch-final-real-llm-consent-handoff.cjs";
  pkg.scripts["phase20:3:verify"]="node scripts/phase20-3-verify-final-real-llm-consent-handoff.cjs";
  pkg.scripts["llm:real-consent:final:check"]="npm run phase20:0:verify && npm run phase20:1:verify && npm run phase20:2:verify && npm run phase20:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 20.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase20-3-final-real-llm-consent-handoff-release-summary.md", `# Phase 20.3 – Final Real LLM Consent Handoff / Release Summary

## Ziel
Phase 20.3 schließt den Real-LLM-Invocation-Consent-Block ab und dokumentiert den Stand für Phase 21.

## Abgeschlossene Phase-20-Kette
- Phase 20.0 – Real LLM Invocation Consent Gate / Explicit Human Approval Prep
- Phase 20.1 – Consent Decision Simulation & Audit
- Phase 20.2 – Real LLM Consent Dashboard & Smoke
- Phase 20.3 – Final Real LLM Consent Handoff / Release Summary

## Was erreicht wurde
- Real LLM Call Gates können in Consent Requests überführt werden.
- Consent Requests verlangen explizite Human Approval.
- Consent Requests bleiben pending und führen keinen produktiven LLM-Aufruf aus.
- Consent Decision Simulation hält Entscheidungen im \`pending_review_only\` Modus.
- Governance Audit bekommt Consent Request und Consent Decision Events.
- Real LLM Consent Dashboard fasst Gates, Consent Requests, Decision Simulationen und Audit zusammen.
- Der produktive LLM-Aufruf bleibt weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /real-llm-gate-dashboard
- /real-llm-consent
- /real-llm-consent-decision
- /real-llm-consent-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/real-llm-call-gate
- /api/real-llm-consent
- /api/real-llm-consent-decision
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/controlled-real-llm-call-gates.jsonl
- data/real-llm-invocation-consent-requests.jsonl
- data/real-llm-consent-decision-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- Kein produktiver LLM-Aufruf ohne explizite Nutzerfreigabe.
- consentRequired=true.
- humanApprovalRequired=true.
- approvalStatus=pending.
- simulatedDecision=pending_review_only.
- realLlmCallAllowed=false.
- llmCallPerformed=false.
- Secret Scan, Output Contract und Audit bleiben Pflicht.
- Keine echte Tool-Ausführung.
- Keine automatische Agent-Ausführung.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Bekannter Hinweis
Falls \`phase20:1:verify\` wegen Script-Namens-Mismatch bei \`llm:real-consent:decision:verify\` scheitert, package.json prüfen. Der erwartete Alias ist \`llm:real-consent:decision:verify\`.

## Nächster sinnvoller Schritt
Phase 21.0 – Approved Real LLM Invocation Envelope / Still-No-Tool-Execution Prep

## Ziel Phase 21.0
Nach einem expliziten Consent soll ein genehmigungsfähiger Invocation Envelope vorbereitet werden:
- weiterhin keine Tool- oder Agent-Ausführung
- Real LLM Invocation nur als Envelope/Prep
- Consent-Status und Ablaufzeit prüfen
- Secret Scan erneut prüfen
- Output Contract erneut prüfen
- Audit vor Invocation Envelope
`);
 ensureFile("docs/phase20-final-real-llm-consent-handoff-runbook.md", `# Runbook – Phase 20.3 Final Real LLM Consent Handoff

## Patch
\`\`\`powershell
npm run phase20:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase20-3-patch-final-real-llm-consent-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase20:3:verify
npm run llm:real-consent:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase20:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final real llm consent handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase21.md", `# Übergabe für nächsten Chat – Phase 21 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate und Phase 20 Real LLM Consent sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/real-llm-gate-dashboard
- http://localhost:3000/real-llm-consent
- http://localhost:3000/real-llm-consent-decision
- http://localhost:3000/real-llm-consent-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:real-consent:final:check
npm run build
npm run stack:health
npm run phase20:2:smoke
\`\`\`

## Nächster Schritt
Phase 21.0 – Approved Real LLM Invocation Envelope / Still-No-Tool-Execution Prep

## Leitplanken
- keine Tool- oder Agent-Ausführung
- Real LLM Invocation nur als vorbereiteter Envelope
- Consent-Status prüfen
- Consent-Ablaufzeit prüfen
- Secret Scan erneut prüfen
- Output Contract erneut prüfen
- Audit vor Invocation Envelope
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true bis explizit sicher geändert

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 20 sind abgeschlossen. Ziel jetzt: Phase 21.0 – Approved Real LLM Invocation Envelope / Still-No-Tool-Execution Prep. Bitte einen genehmigungsfähigen Invocation Envelope vorbereiten. Keine Tool- oder Agent-Ausführung, Consent-Status prüfen, Secret Scan und Output Contract erneut prüfen.
`);
}
patchPackage();
patchDocs();
console.log("Phase 20.3 Patch abgeschlossen.");
