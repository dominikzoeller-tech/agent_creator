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
  pkg.scripts["phase35:3:patch"]="node scripts/phase35-3-patch-final-provider-dispatch-final-preflight-handoff.cjs";
  pkg.scripts["phase35:3:verify"]="node scripts/phase35-3-verify-final-provider-dispatch-final-preflight-handoff.cjs";
  pkg.scripts["llm:provider-dispatch-final-preflight:final:check"]="npm run phase35:0:verify && npm run phase35:1:verify && npm run phase35:2:verify && npm run build";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 35.3 Scripts eingetragen.");
}
const summary=`# Phase 35.3 – Final Provider Dispatch Final Preflight Handoff / Release Summary

## Ziel
Phase 35 schließt den Provider-Dispatch-Final-Preflight-Block ab.

## Abgeschlossen
- Phase 35.0 – Controlled Provider Dispatch Final Preflight / Still No Provider Call
- Phase 35.1 – Provider Dispatch Final Preflight Policy & Audit
- Phase 35.2 – Provider Dispatch Final Preflight Dashboard & Smoke
- Phase 35.3 – Final Provider Dispatch Final Preflight Handoff / Release Summary

## Wichtigste Routen
- /provider-dispatch-final-preflight
- /provider-dispatch-final-preflight-policy
- /provider-dispatch-final-preflight-dashboard
- /api/provider-dispatch-final-preflight
- /api/provider-dispatch-final-preflight-policy

## Sicherheitsinvarianten
- providerDispatchFinalPreflightPrepared=true
- finalDispatchAllowed=false
- providerDispatchPerformed=false
- providerDispatchTokenBindingPrepared=true
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
Provider Dispatch Final Preflight ist vorbereitet, per Policy prüfbar, auditierbar und im Dashboard sichtbar. Final Dispatch bleibt weiterhin nicht erlaubt. Kein Provider Dispatch und kein externer Provider-/Netzwerk-Aufruf.

## Nächster Schritt
Phase 36.0 – Controlled Provider Dispatch Execution Gate / Still No Provider Call
`;
const runbook=`# Runbook – Phase 35 Final Provider Dispatch Final Preflight Handoff

## Verify
\`\`\`powershell
npm run phase35:3:verify
npm run llm:provider-dispatch-final-preflight:final:check
npm run build
\`\`\`

## Optional Smoke
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase35:2:smoke
\`\`\`

## Sicherheit
Phase 35 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte und keinen sensiblen Request Body. Final Dispatch bleibt explizit blockiert.
`;
const handoff=`# Next Chat Handoff – Phase 36

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Zusammenarbeit
Direkt, phasenweise und pragmatisch. Erst Patch, Verify, Build. Docker/Smoke nur für Browser-/API-Erreichbarkeit. Bei Fehlern reicht der relevante Fehlerblock. Dominik bevorzugt klare, ehrliche Kommunikation über technische Zwischenschritte, zusätzlichen Aufwand, Zweck der Maßnahmen und späteres Aufräumen.

## Aktueller Stand
Phase 35 ist abgeschlossen, sobald Phase 35.3 committed ist.

## Letzte abgeschlossene Kette
- Provider Dispatch Token Binding
- Provider Dispatch Token Binding Policy & Audit
- Provider Dispatch Token Binding Dashboard & Smoke
- Provider Dispatch Final Preflight
- Provider Dispatch Final Preflight Policy & Audit
- Provider Dispatch Final Preflight Dashboard & Smoke

## Unveränderte Sicherheitsinvarianten
- kein realer Provider Call
- kein Netzwerkaufruf
- keine aktive Token-Bindung
- kein Provider Dispatch
- Final Dispatch bleibt blockiert
- keine Secret-Werte im UI/Storage
- kein Prompt Payload im Dispatch
- provider=none
- modelSelected=none
- dryRunOnly=true

## Nächster Block
Phase 36.0 – Controlled Provider Dispatch Execution Gate / Still No Provider Call

Vorgeschlagener Start:
\`\`\`powershell
cd C:\\Users\\User\\ai-assistant\\agent_creator
git status --short
npm run build
\`\`\`
Dann mit Phase 36.0 fortfahren.
`;
patchPackage();
ensure("phase35-3-final-provider-dispatch-final-preflight-handoff-release-summary.md", summary);
ensure("docs/phase35-final-provider-dispatch-final-preflight-handoff-runbook.md", runbook);
ensure("next-chat-handoff-phase36.md", handoff);
console.log("Phase 35.3 Patch abgeschlossen.");
