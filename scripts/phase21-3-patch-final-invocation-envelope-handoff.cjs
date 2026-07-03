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
  pkg.scripts["phase21:3:patch"]="node scripts/phase21-3-patch-final-invocation-envelope-handoff.cjs";
  pkg.scripts["phase21:3:verify"]="node scripts/phase21-3-verify-final-invocation-envelope-handoff.cjs";
  pkg.scripts["llm:approved-envelope:final:check"]="npm run phase21:0:verify && npm run phase21:1:verify && npm run phase21:2:verify && npm run phase21:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 21.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase21-3-final-invocation-envelope-handoff-release-summary.md", `# Phase 21.3 – Final Invocation Envelope Handoff / Release Summary

## Ziel
Phase 21.3 schließt den Approved-Real-LLM-Invocation-Envelope-Block ab und dokumentiert den Stand für Phase 22.

## Abgeschlossene Phase-21-Kette
- Phase 21.0 – Approved Real LLM Invocation Envelope / Still-No-Tool-Execution Prep
- Phase 21.1 – Invocation Envelope Policy Simulation & Audit
- Phase 21.2 – Invocation Envelope Dashboard & Smoke
- Phase 21.3 – Final Invocation Envelope Handoff / Release Summary

## Was erreicht wurde
- Real LLM Consent Requests können in Approved Invocation Envelopes überführt werden.
- Invocation Envelopes bleiben reine Prep-/Envelope-Objekte.
- Consent-Status, Ablaufzeit, Secret Scan und Output Contract werden vor Envelope Prep geprüft.
- Invocation Envelope Policy Simulation prüft Safety Invariants und schreibt Audit Events.
- Invocation Envelope Dashboard fasst Consent Requests, Envelopes, Policy Simulationen und Audit zusammen.
- Der produktive LLM-Aufruf bleibt weiterhin blockiert.
- Tool- und Agent-Ausführung bleiben weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /real-llm-consent-dashboard
- /approved-real-llm-invocation-envelope
- /approved-real-llm-invocation-envelope-policy
- /approved-real-llm-invocation-envelope-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/real-llm-consent
- /api/approved-real-llm-invocation-envelope
- /api/approved-real-llm-invocation-envelope-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/real-llm-invocation-consent-requests.jsonl
- data/approved-real-llm-invocation-envelopes.jsonl
- data/approved-real-llm-invocation-envelope-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- Kein produktiver LLM-Aufruf.
- Real LLM Invocation nur als Envelope/Prep.
- realLlmCallAllowed=false.
- llmCallPerformed=false.
- consentRequired=true.
- humanApprovalRequired=true.
- Output Contract locked.
- Finaler Secret Scan erforderlich.
- Audit vor Invocation erforderlich.
- Keine Tool-Ausführung.
- Keine Agent-Ausführung.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Bekannter Hinweis
Wenn Phase 21.0 oder Phase 21.2 Verify nur Doku-/Navigation-Misses zeigt, die UI/API/Store-Dateien aber vorhanden sind, zuerst Navigation/Doku nachziehen. Build und Smoke bleiben die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 22.0 – Provider-Agnostic LLM Invocation Adapter Stub / No Network Call

## Ziel Phase 22.0
Ein provider-agnostischer Adapter Stub für spätere LLM Invocation wird vorbereitet:
- weiterhin kein externer Netzwerk-/Provider-Aufruf
- Invocation Envelope als Input
- Provider Adapter nur Dry-run/Stub
- Secret Scan erneut prüfen
- Output Contract erneut prüfen
- Audit vor/nach Adapter-Entscheidung
- keine Tool- oder Agent-Ausführung
`);
 ensureFile("docs/phase21-final-invocation-envelope-handoff-runbook.md", `# Runbook – Phase 21.3 Final Invocation Envelope Handoff

## Patch
\`\`\`powershell
npm run phase21:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase21-3-patch-final-invocation-envelope-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase21:3:verify
npm run llm:approved-envelope:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase21:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final invocation envelope handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase22.md", `# Übergabe für nächsten Chat – Phase 22 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate, Phase 20 Real LLM Consent und Phase 21 Approved Invocation Envelope sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/real-llm-consent-dashboard
- http://localhost:3000/approved-real-llm-invocation-envelope
- http://localhost:3000/approved-real-llm-invocation-envelope-policy
- http://localhost:3000/approved-real-llm-invocation-envelope-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:approved-envelope:final:check
npm run build
npm run stack:health
npm run phase21:2:smoke
\`\`\`

## Nächster Schritt
Phase 22.0 – Provider-Agnostic LLM Invocation Adapter Stub / No Network Call

## Leitplanken
- kein externer Netzwerk-/Provider-Aufruf
- Adapter nur Stub/Dry-run
- Invocation Envelope als Input
- Secret Scan erneut prüfen
- Output Contract erneut prüfen
- Audit vor/nach Adapter-Entscheidung
- keine Tool- oder Agent-Ausführung
- realLlmCallAllowed=false bis explizit sicher geändert
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 21 sind abgeschlossen. Ziel jetzt: Phase 22.0 – Provider-Agnostic LLM Invocation Adapter Stub / No Network Call. Bitte einen provider-agnostischen LLM Invocation Adapter Stub vorbereiten. Kein externer Provider-/Netzwerk-Aufruf, keine Tool- oder Agent-Ausführung, Secret Scan und Output Contract erneut prüfen.
`);
}
patchPackage();
patchDocs();
console.log("Phase 21.3 Patch abgeschlossen.");
