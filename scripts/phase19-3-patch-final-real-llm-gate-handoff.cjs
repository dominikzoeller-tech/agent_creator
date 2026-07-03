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
  pkg.scripts["phase19:3:patch"]="node scripts/phase19-3-patch-final-real-llm-gate-handoff.cjs";
  pkg.scripts["phase19:3:verify"]="node scripts/phase19-3-verify-final-real-llm-gate-handoff.cjs";
  pkg.scripts["llm:real-gate:final:check"]="npm run phase19:0:verify && npm run phase19:1:verify && npm run phase19:2:verify && npm run phase19:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 19.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase19-3-final-real-llm-gate-handoff-release-summary.md", `# Phase 19.3 – Final Real LLM Gate Handoff / Release Summary

## Ziel
Phase 19.3 schließt den Controlled-Real-LLM-Gate-Block ab und dokumentiert den Stand für Phase 20.

## Abgeschlossene Phase-19-Kette
- Phase 19.0 – Controlled Real LLM Call Gate / Policy-Gated Invocation Prep
- Phase 19.1 – Real LLM Gate Policy Simulation & Audit
- Phase 19.2 – Real LLM Gate Dashboard & Smoke
- Phase 19.3 – Final Real LLM Gate Handoff / Release Summary

## Was erreicht wurde
- Stub Responses können in Real LLM Call Gates überführt werden.
- Real LLM Call Gates bereiten eine spätere echte Invocation vor, führen aber nichts aus.
- Policy Gate, Secret Scan, Output Contract und Audit werden explizit als Pflicht-Gates modelliert.
- Real LLM Gate Policy Simulation prüft Safety Invariants und schreibt Audit Events.
- Real LLM Gate Dashboard fasst Stub Responses, Gates, Policy Simulationen und Audit zusammen.
- Der produktive LLM-Aufruf bleibt weiter blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /llm-stub-dashboard
- /real-llm-call-gate
- /real-llm-gate-policy
- /real-llm-gate-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/llm-stub-response
- /api/real-llm-call-gate
- /api/real-llm-gate-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/controlled-llm-stub-responses.jsonl
- data/controlled-real-llm-call-gates.jsonl
- data/controlled-real-llm-gate-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- Kein produktiver LLM-Aufruf.
- realLlmCallAllowed=false.
- llmCallPerformed=false.
- policyGateRequired=true.
- Secret Scan, Output Contract und Audit bleiben Pflicht vor echter Invocation.
- Keine echte Tool-Ausführung.
- Keine automatische Agent-Ausführung.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Bekannter Hinweis
Falls \`phase19:0:verify\` noch Doku-/Navigation-Misses zeigt, die Funktionen aber vorhanden sind, bitte zuerst die Mini-Fixes für Navigation und Doku anwenden. Der Build/Smoke ist die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 20.0 – Real LLM Invocation Consent Gate / Explicit Human Approval Prep

## Ziel Phase 20.0
Vor einem echten LLM-Aufruf wird ein ausdrückliches Human-Approval-/Consent-Gate eingeführt:
- Consent Request für Real LLM Invocation
- explizite Nutzerfreigabe erforderlich
- Secret Scan vor Consent
- Output Contract vor Consent
- Audit Event für request/decision
- weiterhin keine Tool- oder Agent-Ausführung
`);
 ensureFile("docs/phase19-final-real-llm-gate-handoff-runbook.md", `# Runbook – Phase 19.3 Final Real LLM Gate Handoff

## Patch
\`\`\`powershell
npm run phase19:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase19-3-patch-final-real-llm-gate-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase19:3:verify
npm run llm:real-gate:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase19:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final real llm gate handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase20.md", `# Übergabe für nächsten Chat – Phase 20 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub und Phase 19 Controlled Real LLM Gate sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/llm-stub-dashboard
- http://localhost:3000/real-llm-call-gate
- http://localhost:3000/real-llm-gate-policy
- http://localhost:3000/real-llm-gate-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:real-gate:final:check
npm run build
npm run stack:health
npm run phase19:2:smoke
\`\`\`

## Nächster Schritt
Phase 20.0 – Real LLM Invocation Consent Gate / Explicit Human Approval Prep

## Leitplanken
- kein produktiver LLM-Aufruf ohne explizite Nutzerfreigabe
- Consent Request vor Real Invocation
- Secret Scan vor Consent
- Output Contract vor Consent
- Audit vor/nach Consent-Entscheidung
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true bis explizit sicher geändert

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 19 sind abgeschlossen. Ziel jetzt: Phase 20.0 – Real LLM Invocation Consent Gate / Explicit Human Approval Prep. Bitte ein ausdrückliches Human-Approval-/Consent-Gate für spätere echte LLM-Aufrufe vorbereiten. Kein produktiver LLM-Aufruf ohne explizite Nutzerfreigabe, keine Tool- oder Agent-Ausführung, keine Secrets.
`);
}
patchPackage();
patchDocs();
console.log("Phase 19.3 Patch abgeschlossen.");
