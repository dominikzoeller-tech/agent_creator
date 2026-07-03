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
  pkg.scripts["phase18:3:patch"]="node scripts/phase18-3-patch-final-llm-stub-handoff.cjs";
  pkg.scripts["phase18:3:verify"]="node scripts/phase18-3-verify-final-llm-stub-handoff.cjs";
  pkg.scripts["llm:stub:final:check"]="npm run phase18:0:verify && npm run phase18:1:verify && npm run phase18:2:verify && npm run phase18:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 18.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase18-3-final-llm-stub-handoff-release-summary.md", `# Phase 18.3 – Final LLM Stub Handoff / Release Summary

## Ziel
Phase 18.3 schließt den Controlled-LLM-Stub-Block ab und dokumentiert den Stand für Phase 19.

## Abgeschlossene Phase-18-Kette
- Phase 18.0 – Controlled LLM Call Stub / Dry-run Explainer Response
- Phase 18.0a – Hotfix LLM Stub Response Direct
- Phase 18.1 – Stub Response Policy Simulation & Audit
- Phase 18.2 – LLM Stub Dashboard & Smoke
- Phase 18.3 – Final LLM Stub Handoff / Release Summary

## Was erreicht wurde
- Controlled LLM Routing Envelopes können in Dry-run Explainer Responses überführt werden.
- Die Explainer Response ist ein Stub: kein produktiver LLM-Aufruf.
- Stub Responses bleiben explanation-only und nicht-ausführend.
- Stub Policy Simulation prüft Safety Invariants, Secret-Risiko und ausführende Inhalte.
- Governance Audit bekommt Stub Policy Events.
- LLM Stub Dashboard fasst Routing Envelopes, Stub Responses, Stub Policy Simulationen und Audit zusammen.
- Phase 18.0a repariert die fehlende Stub-Response-Route direkt und ersetzt das defekte 18.0 Template-Script im praktischen Workflow.

## Wichtige UI-Routen
- /master-cockpit
- /llm-routing-dashboard
- /llm-stub-response
- /llm-stub-policy
- /llm-stub-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/llm-routing-envelope
- /api/llm-stub-response
- /api/llm-stub-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/controlled-llm-routing-envelopes.jsonl
- data/controlled-llm-stub-responses.jsonl
- data/controlled-llm-stub-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- Kein produktiver LLM-Aufruf.
- llmCallPerformed=false.
- stubOnly=true.
- Keine echte Tool-Ausführung.
- Keine automatische Agent-Ausführung.
- Keine Secrets.
- Output bleibt Erklärung/Empfehlung.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Bekannter Hinweis
Das ursprüngliche Phase-18.0-Patch-Script enthielt ein HTML-encodiertes Arrow-Token. Der praktische Fix ist Phase 18.0a. Für weitere Checks gilt daher: \`npm run phase18:0:verify\` zeigt auf den 18.0a Verify.

## Nächster sinnvoller Schritt
Phase 19.0 – Controlled Real LLM Call Gate / Policy-Gated Invocation Prep

## Ziel Phase 19.0
Ein kontrolliertes Gate für einen späteren echten LLM-Aufruf vorbereiten:
- noch keine produktive Ausführung erzwingen
- LLM Call nur nach Policy Gate denkbar
- Secret Scan vor Call
- Output Contract vor Call
- Audit Event vor/nach Call-Entscheidung
- klare Trennung zwischen Stub, Policy und Real Invocation Prep
`);
 ensureFile("docs/phase18-final-llm-stub-handoff-runbook.md", `# Runbook – Phase 18.3 Final LLM Stub Handoff

## Patch
\`\`\`powershell
npm run phase18:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase18-3-patch-final-llm-stub-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase18:3:verify
npm run llm:stub:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase18:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final llm stub handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase19.md", `# Übergabe für nächsten Chat – Phase 19 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing und Phase 18 Controlled LLM Stub sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/llm-routing-dashboard
- http://localhost:3000/llm-stub-response
- http://localhost:3000/llm-stub-policy
- http://localhost:3000/llm-stub-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:stub:final:check
npm run build
npm run stack:health
npm run phase18:2:smoke
\`\`\`

## Nächster Schritt
Phase 19.0 – Controlled Real LLM Call Gate / Policy-Gated Invocation Prep

## Leitplanken
- kein produktiver LLM-Aufruf ohne Policy Gate
- kein Secret-Leak
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- Output Contract vor Invocation
- Audit vor/nach Call-Entscheidung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true bis explizit sicher geändert

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 18 sind abgeschlossen. Ziel jetzt: Phase 19.0 – Controlled Real LLM Call Gate / Policy-Gated Invocation Prep. Bitte ein kontrolliertes Gate für spätere echte LLM-Aufrufe vorbereiten. Kein produktiver LLM-Aufruf ohne Policy Gate, keine Tool- oder Agent-Ausführung, keine Secrets.
`);
}
patchPackage();
patchDocs();
console.log("Phase 18.3 Patch abgeschlossen.");
