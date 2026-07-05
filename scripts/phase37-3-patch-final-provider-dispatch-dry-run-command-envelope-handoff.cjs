const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensure(file, content){ if(!exists(file)){ write(file, content); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase37:3:patch"]="node scripts/phase37-3-patch-final-provider-dispatch-dry-run-command-envelope-handoff.cjs";
  pkg.scripts["phase37:3:verify"]="node scripts/phase37-3-verify-final-provider-dispatch-dry-run-command-envelope-handoff.cjs";
  pkg.scripts["llm:provider-dispatch-dry-run-command-envelope:final:check"]="npm run phase37:0:verify && npm run phase37:1:verify && npm run phase37:2:verify && npm run build";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 37.3 Scripts eingetragen.");
}
const summary=`# Phase 37.3 – Final Provider Dispatch Dry-Run Command Envelope Handoff / Release Summary

## Ziel
Phase 37 schließt den Provider-Dispatch-Dry-Run-Command-Envelope-Block ab.

## Abgeschlossen
- Phase 37.0 – Controlled Provider Dispatch Dry-Run Command Envelope / Still No Provider Call
- Phase 37.1 – Provider Dispatch Dry-Run Command Envelope Policy & Audit
- Phase 37.2 – Provider Dispatch Dry-Run Command Envelope Dashboard & Smoke
- Phase 37.3 – Final Provider Dispatch Dry-Run Command Envelope Handoff / Release Summary

## Wichtigste Routen
- /provider-dispatch-dry-run-command-envelope
- /provider-dispatch-dry-run-command-envelope-policy
- /provider-dispatch-dry-run-command-envelope-dashboard
- /api/provider-dispatch-dry-run-command-envelope
- /api/provider-dispatch-dry-run-command-envelope-policy

## Sicherheitsinvarianten
- providerDispatchDryRunCommandEnvelopePrepared=true
- commandEnvelopePrepared=true
- commandEnvelopeExecuted=false
- executionGateOpen=false
- finalDispatchAllowed=false
- providerDispatchPerformed=false
- metadataOnly=true
- provider=none
- modelSelected=none
- dispatchPayloadIncluded=false
- commandPayloadIncluded=false
- promptPayloadIncluded=false
- promptIncluded=false
- secretValuesIncluded=false
- requestBodyIncluded=false
- sensitiveRequestBodyIncluded=false
- networkCallAllowed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Ergebnis
Provider Dispatch Dry-Run Command Envelope ist vorbereitet, per Policy prüfbar, auditierbar und im Dashboard sichtbar. Das Command Envelope bleibt weiterhin nicht ausgeführt. Kein Provider Dispatch und kein externer Provider-/Netzwerk-Aufruf.

## Nächster Schritt
Phase 38.0 – Controlled Provider Dispatch Dry-Run Result Envelope / Still No Provider Call
`;
const runbook=`# Runbook – Phase 37 Final Provider Dispatch Dry-Run Command Envelope Handoff

## Verify
\`\`\`powershell
npm run phase37:3:verify
npm run llm:provider-dispatch-dry-run-command-envelope:final:check
npm run build
\`\`\`

## Optional Smoke
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase37:2:smoke
\`\`\`

## Sicherheit
Phase 37 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte und keinen sensiblen Request Body. Das Dry-Run Command Envelope bleibt explizit nicht ausgeführt.
`;
const handoff=`# Next Chat Handoff – Phase 38

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Zusammenarbeit
Direkt, phasenweise und pragmatisch. Erst Patch, Verify, Build. Docker/Smoke nur für Browser-/API-Erreichbarkeit. Bei Fehlern reicht der relevante Fehlerblock. Dominik bevorzugt klare, ehrliche Kommunikation über technische Zwischenschritte, zusätzlichen Aufwand, Zweck der Maßnahmen und späteres Aufräumen.

## Aktueller Stand
Phase 37 ist abgeschlossen, sobald Phase 37.3 committed ist.

## Letzte abgeschlossene Kette
- Provider Dispatch Execution Gate
- Provider Dispatch Execution Gate Policy & Audit
- Provider Dispatch Execution Gate Dashboard & Smoke
- Provider Dispatch Dry-Run Command Envelope
- Provider Dispatch Dry-Run Command Envelope Policy & Audit
- Provider Dispatch Dry-Run Command Envelope Dashboard & Smoke

## Unveränderte Sicherheitsinvarianten
- kein realer Provider Call
- kein Netzwerkaufruf
- keine aktive Token-Bindung
- kein Provider Dispatch
- Final Dispatch bleibt blockiert
- Execution Gate bleibt geschlossen
- Dry-Run Command Envelope bleibt nicht ausgeführt
- keine Secret-Werte im UI/Storage
- kein Prompt Payload im Dispatch
- provider=none
- modelSelected=none
- dryRunOnly=true

## Nächster Block
Phase 38.0 – Controlled Provider Dispatch Dry-Run Result Envelope / Still No Provider Call

Vorgeschlagener Start:
\`\`\`powershell
cd C:\\Users\\User\\ai-assistant\\agent_creator
git status --short
npm run build
\`\`\`
Dann mit Phase 38.0 fortfahren.
`;
patchPackage();
ensure("phase37-3-final-provider-dispatch-dry-run-command-envelope-handoff-release-summary.md", summary);
ensure("docs/phase37-final-provider-dispatch-dry-run-command-envelope-handoff-runbook.md", runbook);
ensure("next-chat-handoff-phase38.md", handoff);
console.log("Phase 37.3 Patch abgeschlossen.");
