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
  pkg.scripts["phase36:3:patch"]="node scripts/phase36-3-patch-final-provider-dispatch-execution-gate-handoff.cjs";
  pkg.scripts["phase36:3:verify"]="node scripts/phase36-3-verify-final-provider-dispatch-execution-gate-handoff.cjs";
  pkg.scripts["llm:provider-dispatch-execution-gate:final:check"]="npm run phase36:0:verify && npm run phase36:1:verify && npm run phase36:2:verify && npm run build";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 36.3 Scripts eingetragen.");
}
const summary=`# Phase 36.3 – Final Provider Dispatch Execution Gate Handoff / Release Summary

## Ziel
Phase 36 schließt den Provider-Dispatch-Execution-Gate-Block ab.

## Abgeschlossen
- Phase 36.0 – Controlled Provider Dispatch Execution Gate / Still No Provider Call
- Phase 36.1 – Provider Dispatch Execution Gate Policy & Audit
- Phase 36.2 – Provider Dispatch Execution Gate Dashboard & Smoke
- Phase 36.3 – Final Provider Dispatch Execution Gate Handoff / Release Summary

## Wichtigste Routen
- /provider-dispatch-execution-gate
- /provider-dispatch-execution-gate-policy
- /provider-dispatch-execution-gate-dashboard
- /api/provider-dispatch-execution-gate
- /api/provider-dispatch-execution-gate-policy

## Sicherheitsinvarianten
- providerDispatchExecutionGatePrepared=true
- executionGateOpen=false
- finalDispatchAllowed=false
- providerDispatchPerformed=false
- providerDispatchFinalPreflightPrepared=true
- tokenBoundToDispatch=false
- tokenBindingActive=false
- tokenActive=false
- metadataOnly=true
- provider=none
- modelSelected=none
- dispatchPayloadIncluded=false
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
Provider Dispatch Execution Gate ist vorbereitet, per Policy prüfbar, auditierbar und im Dashboard sichtbar. Das Execution Gate bleibt weiterhin geschlossen. Kein Provider Dispatch und kein externer Provider-/Netzwerk-Aufruf.

## Nächster Schritt
Phase 37.0 – Controlled Provider Dispatch Dry-Run Command Envelope / Still No Provider Call
`;
const runbook=`# Runbook – Phase 36 Final Provider Dispatch Execution Gate Handoff

## Verify
\`\`\`powershell
npm run phase36:3:verify
npm run llm:provider-dispatch-execution-gate:final:check
npm run build
\`\`\`

## Optional Smoke
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase36:2:smoke
\`\`\`

## Sicherheit
Phase 36 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte und keinen sensiblen Request Body. Das Execution Gate bleibt explizit geschlossen.
`;
const handoff=`# Next Chat Handoff – Phase 37

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Zusammenarbeit
Direkt, phasenweise und pragmatisch. Erst Patch, Verify, Build. Docker/Smoke nur für Browser-/API-Erreichbarkeit. Bei Fehlern reicht der relevante Fehlerblock. Dominik bevorzugt klare, ehrliche Kommunikation über technische Zwischenschritte, zusätzlichen Aufwand, Zweck der Maßnahmen und späteres Aufräumen.

## Aktueller Stand
Phase 36 ist abgeschlossen, sobald Phase 36.3 committed ist.

## Letzte abgeschlossene Kette
- Provider Dispatch Final Preflight
- Provider Dispatch Final Preflight Policy & Audit
- Provider Dispatch Final Preflight Dashboard & Smoke
- Provider Dispatch Execution Gate
- Provider Dispatch Execution Gate Policy & Audit
- Provider Dispatch Execution Gate Dashboard & Smoke

## Unveränderte Sicherheitsinvarianten
- kein realer Provider Call
- kein Netzwerkaufruf
- keine aktive Token-Bindung
- kein Provider Dispatch
- Final Dispatch bleibt blockiert
- Execution Gate bleibt geschlossen
- keine Secret-Werte im UI/Storage
- kein Prompt Payload im Dispatch
- provider=none
- modelSelected=none
- dryRunOnly=true

## Nächster Block
Phase 37.0 – Controlled Provider Dispatch Dry-Run Command Envelope / Still No Provider Call

Vorgeschlagener Start:
\`\`\`powershell
cd C:\\Users\\User\\ai-assistant\\agent_creator
git status --short
npm run build
\`\`\`
Dann mit Phase 37.0 fortfahren.
`;
patchPackage();
ensure("phase36-3-final-provider-dispatch-execution-gate-handoff-release-summary.md", summary);
ensure("docs/phase36-final-provider-dispatch-execution-gate-handoff-runbook.md", runbook);
ensure("next-chat-handoff-phase37.md", handoff);
console.log("Phase 36.3 Patch abgeschlossen.");
