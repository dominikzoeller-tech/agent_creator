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
  pkg.scripts["phase30:3:patch"]="node scripts/phase30-3-patch-final-token-backed-provider-preflight-handoff.cjs";
  pkg.scripts["phase30:3:verify"]="node scripts/phase30-3-verify-final-token-backed-provider-preflight-handoff.cjs";
  pkg.scripts["llm:token-backed-provider:final:check"]="npm run phase30:0:verify && npm run phase30:1:verify && npm run phase30:2:verify && npm run phase30:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 30.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase30-3-final-token-backed-provider-preflight-handoff-release-summary.md", `# Phase 30.3 – Final Token-Backed Provider Preflight Handoff / Release Summary

## Ziel
Phase 30.3 schließt den Controlled Token-Backed Provider Invocation Preflight Block ab und dokumentiert den Stand für Phase 31.

## Abgeschlossene Phase-30-Kette
- Phase 30.0 – Controlled Token-Backed Provider Invocation Preflight / Still No Provider Call
- Phase 30.1 – Token-Backed Provider Preflight Policy & Audit
- Phase 30.2 – Token-Backed Provider Preflight Dashboard & Smoke
- Phase 30.3 – Final Token-Backed Provider Preflight Handoff / Release Summary

## Was erreicht wurde
- Token-backed Provider Invocation Preflights können aus Approval Token Activation Gates vorbereitet werden.
- Preflight bleibt metadata-only und führt keinen Provider Call aus.
- Provider bleibt none.
- Modell bleibt none.
- Prompt wird nicht eingebettet.
- Secret-Werte werden nicht eingebettet.
- Netzwerk-/Provider-Aufrufe bleiben blockiert.
- Token-backed Provider Preflight Policy prüft no prompt, no secrets, tokenActive=false, provider none, model none, no network call und execution safety.
- Token-backed Provider Preflight Dashboard fasst Preflights, Policy Simulationen, Activation Gates und Audit zusammen.
- Governance Audit protokolliert Preflight- und Policy-Ereignisse mit critical risk level.
- Tool- und Agent-Ausführung bleiben weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /approval-token-activation-dashboard
- /token-backed-provider-invocation-preflight
- /token-backed-provider-preflight-policy
- /token-backed-provider-preflight-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/approval-token-activation-gate
- /api/token-backed-provider-invocation-preflight
- /api/token-backed-provider-preflight-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/approval-token-activation-gates.jsonl
- data/token-backed-provider-invocation-preflights.jsonl
- data/token-backed-provider-preflight-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- controlled_token_backed_provider_invocation_preflight_no_provider_call.
- tokenBackedPreflightPrepared=true.
- tokenActive=false.
- provider=none.
- modelSelected=none.
- promptIncluded=false.
- secretValuesIncluded=false.
- Kein Provider-/Netzwerk-Aufruf.
- networkCallPerformed=false.
- providerExecutionAllowed=false.
- realLlmCallAllowed=false.
- llmCallPerformed=false.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Bekannter Hinweis
Wenn Phase 30.0, 30.1 oder 30.2 Verify nur an Doku-/Navigation-Strings scheitert, zuerst die fehlenden Verify-Strings oder Navigation-Links nachziehen. Build und Smoke bleiben die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 31.0 – Controlled Provider Request Contract Preparation / Still No Provider Call

## Ziel Phase 31.0
Nach dem token-backed preflight wird ein expliziter Provider Request Contract vorbereitet:
- Token-backed Provider Preflight als Input
- Provider Request Contract metadata-only
- Prompt weiterhin nicht included oder nur redacted preview
- keine Secret-Werte
- Provider weiterhin none
- Modell weiterhin none
- Kein Netzwerk-/Provider-Aufruf
- Operational Controls erneut prüfen
- Audit für Provider Request Contract
- weiterhin keine Tool- oder Agent-Ausführung
`);
 ensureFile("docs/phase30-final-token-backed-provider-preflight-handoff-runbook.md", `# Runbook – Phase 30.3 Final Token-Backed Provider Preflight Handoff

## Patch
\`\`\`powershell
npm run phase30:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase30-3-patch-final-token-backed-provider-preflight-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase30:3:verify
npm run llm:token-backed-provider:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase30:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final token backed provider preflight handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase31.md", `# Übergabe für nächsten Chat – Phase 31 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate, Phase 20 Real LLM Consent, Phase 21 Approved Invocation Envelope, Phase 22 Provider Adapter Stub, Phase 23 Provider Config Secret Boundary, Phase 24 Provider Readiness, Phase 25 Controlled Provider Simulation, Phase 26 Real Provider Gate, Phase 27 Approval Token Request, Phase 28 Approval Token Issuance, Phase 29 Approval Token Activation und Phase 30 Token-Backed Provider Preflight sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/token-backed-provider-invocation-preflight
- http://localhost:3000/token-backed-provider-preflight-policy
- http://localhost:3000/token-backed-provider-preflight-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:token-backed-provider:final:check
npm run build
npm run stack:health
npm run phase30:2:smoke
\`\`\`

## Nächster Schritt
Phase 31.0 – Controlled Provider Request Contract Preparation / Still No Provider Call

## Leitplanken
- Token-backed Provider Preflight als Input
- Provider Request Contract nur metadata-only
- PromptIncluded=false oder nur redactedPreviewAllowed=false/controlled
- secretValuesIncluded=false
- Provider bleibt none
- modelSelected bleibt none
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 30 sind abgeschlossen. Ziel jetzt: Phase 31.0 – Controlled Provider Request Contract Preparation / Still No Provider Call. Bitte einen separaten Provider Request Contract vorbereiten. Input ist Token-backed Provider Preflight. Kein Provider-/Netzwerk-Aufruf, keine Secret-Werte, kein Prompt oder nur strikt metadata-only/redacted preview, Audit Event schreiben, keine Tool- oder Agent-Ausführung.
`);
}
patchPackage();
patchDocs();
console.log("Phase 30.3 Patch abgeschlossen.");
