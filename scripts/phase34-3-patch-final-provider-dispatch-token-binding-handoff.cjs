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
  pkg.scripts["phase34:3:patch"]="node scripts/phase34-3-patch-final-provider-dispatch-token-binding-handoff.cjs";
  pkg.scripts["phase34:3:verify"]="node scripts/phase34-3-verify-final-provider-dispatch-token-binding-handoff.cjs";
  pkg.scripts["llm:provider-dispatch-token-binding:final:check"]="npm run phase34:0:verify && npm run phase34:1:verify && npm run phase34:2:verify && npm run build";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 34.3 Scripts eingetragen.");
}
const summary=`# Phase 34.3 – Final Provider Dispatch Token Binding Handoff / Release Summary

## Ziel
Phase 34 schließt den Provider-Dispatch-Token-Binding-Block ab.

## Abgeschlossen
- Phase 34.0 – Controlled Provider Dispatch Token Binding / Still No Provider Call
- Phase 34.1 – Provider Dispatch Token Binding Policy & Audit
- Phase 34.2 – Provider Dispatch Token Binding Dashboard & Smoke
- Phase 34.3 – Final Provider Dispatch Token Binding Handoff / Release Summary

## Wichtigste Routen
- /provider-dispatch-token-binding
- /provider-dispatch-token-binding-policy
- /provider-dispatch-token-binding-dashboard
- /api/provider-dispatch-token-binding
- /api/provider-dispatch-token-binding-policy

## Sicherheitsinvarianten
- providerDispatchTokenBindingPrepared=true
- tokenBoundToDispatch=false
- tokenBindingActive=false
- tokenActive=false
- providerDispatchPrepared=true
- providerDispatchPerformed=false
- metadataOnly=true
- provider=none
- modelSelected=none
- dispatchPayloadIncluded=false
- promptPayloadIncluded=false
- secretValuesIncluded=false
- requestBodyIncluded=false
- sensitiveRequestBodyIncluded=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Ergebnis
Provider Dispatch Token Binding ist vorbereitet, per Policy prüfbar, auditierbar und im Dashboard sichtbar. Ein Token wird weiterhin nicht aktiv an Dispatch gebunden. Kein Provider Dispatch und kein externer Provider-/Netzwerk-Aufruf.

## Nächster Schritt
Phase 35.0 – Controlled Provider Dispatch Final Preflight / Still No Provider Call
`;
const runbook=`# Runbook – Phase 34 Final Provider Dispatch Token Binding Handoff

## Verify
\`\`\`powershell
npm run phase34:3:verify
npm run llm:provider-dispatch-token-binding:final:check
npm run build
\`\`\`

## Optional Smoke
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
npm run phase34:2:smoke
\`\`\`

## Sicherheit
Phase 34 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte und keinen sensiblen Request Body.
`;
const handoff=`# Next Chat Handoff – Phase 35

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Zusammenarbeit
Direkt, phasenweise und pragmatisch. Erst Patch, Verify, Build. Docker/Smoke nur für erreichbare Browser-/API-Routen. Bei Fehlern wird nur der relevante Fehlerblock benötigt. Dominik bevorzugt klare, ehrliche Kommunikation über technische Zwischenschritte und späteres Aufräumen.

## Aktueller Stand
Phase 34 ist abgeschlossen, sobald Phase 34.3 committed ist.

## Letzte abgeschlossene Kette
- Provider Dispatch Readiness
- Provider Dispatch Readiness Policy & Audit
- Provider Dispatch Readiness Dashboard & Smoke
- Provider Dispatch Token Binding
- Provider Dispatch Token Binding Policy & Audit
- Provider Dispatch Token Binding Dashboard & Smoke

## Unveränderte Sicherheitsinvarianten
- kein realer Provider Call
- kein Netzwerkaufruf
- keine aktive Token-Bindung
- kein Provider Dispatch
- keine Secret-Werte im UI/Storage
- kein Prompt Payload im Dispatch
- provider=none
- modelSelected=none
- dryRunOnly=true

## Nächster Block
Phase 35.0 – Controlled Provider Dispatch Final Preflight / Still No Provider Call

Vorgeschlagener Start:
\`\`\`powershell
cd C:\\Users\\User\\ai-assistant\\agent_creator
git status --short
npm run build
\`\`\`
Dann mit Phase 35.0 fortfahren.
`;
patchPackage();
ensure("phase34-3-final-provider-dispatch-token-binding-handoff-release-summary.md", summary);
ensure("docs/phase34-final-provider-dispatch-token-binding-handoff-runbook.md", runbook);
ensure("next-chat-handoff-phase35.md", handoff);
console.log("Phase 34.3 Patch abgeschlossen.");
