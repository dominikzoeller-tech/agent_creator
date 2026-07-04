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
  pkg.scripts["phase22:3:patch"]="node scripts/phase22-3-patch-final-provider-adapter-handoff.cjs";
  pkg.scripts["phase22:3:verify"]="node scripts/phase22-3-verify-final-provider-adapter-handoff.cjs";
  pkg.scripts["llm:provider-stub:final:check"]="npm run phase22:0:verify && npm run phase22:1:verify && npm run phase22:2:verify && npm run phase22:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 22.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase22-3-final-provider-adapter-handoff-release-summary.md", `# Phase 22.3 – Final Provider Adapter Handoff / Release Summary

## Ziel
Phase 22.3 schließt den Provider-Agnostic-LLM-Invocation-Adapter-Stub-Block ab und dokumentiert den Stand für Phase 23.

## Abgeschlossene Phase-22-Kette
- Phase 22.0 – Provider-Agnostic LLM Invocation Adapter Stub / No Network Call
- Phase 22.1 – Provider Adapter Policy Simulation & Audit
- Phase 22.2 – Provider Adapter Dashboard & Smoke
- Phase 22.3 – Final Provider Adapter Handoff / Release Summary

## Was erreicht wurde
- Approved Invocation Envelopes können in Provider-Agnostic Adapter Stubs überführt werden.
- Der Adapter bleibt provider-agnostic und no-network.
- Provider ist bewusst \`none\`.
- Es wird kein Modell ausgewählt.
- Provider Adapter Policy Simulation prüft No-Network, Stub-only, Secret Scan, Output Contract und Safety Invariants.
- Provider Adapter Dashboard fasst Invocation Envelopes, Adapter Stubs, Policy Simulationen und Audit zusammen.
- Governance Audit protokolliert Stub- und Policy-Ereignisse.
- Der produktive LLM-Aufruf bleibt weiterhin blockiert.
- Tool- und Agent-Ausführung bleiben weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /approved-real-llm-invocation-envelope-dashboard
- /provider-llm-adapter-stub
- /provider-llm-adapter-policy
- /provider-llm-adapter-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/approved-real-llm-invocation-envelope
- /api/provider-llm-adapter-stub
- /api/provider-llm-adapter-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/approved-real-llm-invocation-envelopes.jsonl
- data/provider-agnostic-llm-invocation-adapter-stubs.jsonl
- data/provider-agnostic-llm-adapter-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- Kein externer Netzwerk-/Provider-Aufruf.
- provider_agnostic_no_network_stub.
- provider=none.
- networkCallAllowed=false.
- networkCallPerformed=false.
- providerExecutionAllowed=false.
- realLlmCallAllowed=false.
- llmCallPerformed=false.
- Secret Scan bleibt Pflicht.
- Output Contract bleibt recommendation_explanation_only.
- Keine Tool-Ausführung.
- Keine Agent-Ausführung.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Bekannter Hinweis
Wenn Phase 22.1 oder Phase 22.2 Verify nur an Navigation/Doku scheitert, zuerst die fehlenden Links oder Verify-Strings nachziehen. Build und Smoke bleiben die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 23.0 – Provider Configuration & Secret Boundary / No Secret Exposure

## Ziel Phase 23.0
Die echte Provider-Konfiguration wird vorbereitet, ohne Secrets offenzulegen oder Provider Calls auszuführen:
- Provider Config Registry
- Secret Boundary definieren
- keine Secrets in Logs, UI oder JSONL Stores
- Environment Variable Checks nur als Presence/Metadata
- kein echter Netzwerk-/Provider-Aufruf
- Adapter bleibt Stub/Dry-run
- Audit für Config Checks
`);
 ensureFile("docs/phase22-final-provider-adapter-handoff-runbook.md", `# Runbook – Phase 22.3 Final Provider Adapter Handoff

## Patch
\`\`\`powershell
npm run phase22:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase22-3-patch-final-provider-adapter-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase22:3:verify
npm run llm:provider-stub:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase22:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final provider adapter handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase23.md", `# Übergabe für nächsten Chat – Phase 23 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate, Phase 20 Real LLM Consent, Phase 21 Approved Invocation Envelope und Phase 22 Provider Adapter Stub sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/approved-real-llm-invocation-envelope-dashboard
- http://localhost:3000/provider-llm-adapter-stub
- http://localhost:3000/provider-llm-adapter-policy
- http://localhost:3000/provider-llm-adapter-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:provider-stub:final:check
npm run build
npm run stack:health
npm run phase22:2:smoke
\`\`\`

## Nächster Schritt
Phase 23.0 – Provider Configuration & Secret Boundary / No Secret Exposure

## Leitplanken
- keine Secrets in UI, Logs oder JSONL Stores
- nur Presence-/Metadata-Checks für ENV Variablen
- kein externer Netzwerk-/Provider-Aufruf
- Adapter bleibt Stub/Dry-run
- realLlmCallAllowed=false
- llmCallPerformed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 22 sind abgeschlossen. Ziel jetzt: Phase 23.0 – Provider Configuration & Secret Boundary / No Secret Exposure. Bitte Provider-Konfiguration und Secret Boundary vorbereiten. Keine Secrets ausgeben oder speichern, keine Provider-/Netzwerk-Aufrufe, nur Presence-/Metadata-Checks und Audit.
`);
}
patchPackage();
patchDocs();
console.log("Phase 22.3 Patch abgeschlossen.");
