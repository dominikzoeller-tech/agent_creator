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
  pkg.scripts["phase29:3:patch"]="node scripts/phase29-3-patch-final-approval-token-activation-handoff.cjs";
  pkg.scripts["phase29:3:verify"]="node scripts/phase29-3-verify-final-approval-token-activation-handoff.cjs";
  pkg.scripts["llm:approval-token-activation:final:check"]="npm run phase29:0:verify && npm run phase29:1:verify && npm run phase29:2:verify && npm run phase29:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 29.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase29-3-final-approval-token-activation-handoff-release-summary.md", `# Phase 29.3 – Final Approval Token Activation Handoff / Release Summary

## Ziel
Phase 29.3 schließt den Explicit-Human-Approval-Token-Activation-Block ab und dokumentiert den Stand für Phase 30.

## Abgeschlossene Phase-29-Kette
- Phase 29.0 – Explicit Human Approval Token Activation Gate / Still No Provider Call
- Phase 29.1 – Approval Token Activation Policy & Audit
- Phase 29.2 – Approval Token Activation Dashboard & Smoke
- Phase 29.3 – Final Approval Token Activation Handoff / Release Summary

## Was erreicht wurde
- Approval Token Activation Gates können aus Approval Token Issuance Gates vorbereitet werden.
- Token-Aktivierung ist ein eigener, kontrollierter Schritt.
- Activation Intent wird explizit erfasst und geprüft.
- Token wird weiterhin nicht automatisch aktiviert.
- Provider Call Plan bleibt blockiert.
- Provider und Modell bleiben none.
- Netzwerk-/Provider-Aufrufe bleiben blockiert.
- Approval Token Activation Policy prüft Activation Intent, tokenActive=false, No Auto Activation, No Provider Call, Secret Boundary und Execution Safety.
- Approval Token Activation Dashboard fasst Activation Gates, Activation Policy Simulationen, Issuance Gates und Audit zusammen.
- Governance Audit protokolliert Activation-Gate- und Policy-Ereignisse mit critical risk level.
- Tool- und Agent-Ausführung bleiben weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /approval-token-issuance-dashboard
- /approval-token-activation-gate
- /approval-token-activation-policy
- /approval-token-activation-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/approval-token-issuance-gate
- /api/approval-token-activation-gate
- /api/approval-token-activation-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/approval-token-issuance-gates.jsonl
- data/approval-token-activation-gates.jsonl
- data/approval-token-activation-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- explicit_human_approval_token_activation_gate_no_provider_call.
- approvalTokenRequested=true.
- approvalTokenIssuancePrepared=true.
- tokenActivationPrepared=true.
- tokenActive=false.
- activationIntentRecorded=true/false als expliziter Input.
- Token wird nicht automatisch aktiviert.
- Kein automatischer Provider-/Netzwerk-Aufruf.
- provider=none.
- modelSelected=none.
- networkCallPerformed=false.
- providerExecutionAllowed=false.
- realLlmCallAllowed=false.
- llmCallPerformed=false.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Bekannter Hinweis
Wenn Phase 29.0, 29.1 oder 29.2 Verify nur an Doku-/Navigation-Strings scheitert, zuerst die fehlenden Verify-Strings oder Navigation-Links nachziehen. Build und Smoke bleiben die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 30.0 – Controlled Token-Backed Provider Invocation Preflight / Still No Provider Call

## Ziel Phase 30.0
Nach der Approval Token Activation Vorbereitung wird ein separater Token-Backed Provider Invocation Preflight vorbereitet:
- Approval Token Activation Gate als Input
- tokenActive bleibt zunächst false oder controlled metadata-only
- Provider Invocation weiterhin blockiert
- No Network Call
- Secret Boundary erneut prüfen
- Operational Controls erneut prüfen
- Audit für token-backed preflight
- weiterhin keine Tool- oder Agent-Ausführung
`);
 ensureFile("docs/phase29-final-approval-token-activation-handoff-runbook.md", `# Runbook – Phase 29.3 Final Approval Token Activation Handoff

## Patch
\`\`\`powershell
npm run phase29:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase29-3-patch-final-approval-token-activation-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase29:3:verify
npm run llm:approval-token-activation:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase29:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final approval token activation handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase30.md", `# Übergabe für nächsten Chat – Phase 30 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate, Phase 20 Real LLM Consent, Phase 21 Approved Invocation Envelope, Phase 22 Provider Adapter Stub, Phase 23 Provider Config Secret Boundary, Phase 24 Provider Readiness, Phase 25 Controlled Provider Simulation, Phase 26 Real Provider Gate, Phase 27 Approval Token Request, Phase 28 Approval Token Issuance und Phase 29 Approval Token Activation sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/approval-token-issuance-dashboard
- http://localhost:3000/approval-token-activation-gate
- http://localhost:3000/approval-token-activation-policy
- http://localhost:3000/approval-token-activation-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:approval-token-activation:final:check
npm run build
npm run stack:health
npm run phase29:2:smoke
\`\`\`

## Nächster Schritt
Phase 30.0 – Controlled Token-Backed Provider Invocation Preflight / Still No Provider Call

## Leitplanken
- Approval Token Activation Gate als Input
- Token-backed Invocation nur als Preflight
- Kein Provider-/Netzwerk-Aufruf
- Secret Boundary erneut prüfen
- Operational Controls erneut prüfen
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
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 29 sind abgeschlossen. Ziel jetzt: Phase 30.0 – Controlled Token-Backed Provider Invocation Preflight / Still No Provider Call. Bitte einen separaten Token-Backed Provider Invocation Preflight vorbereiten. Kein Provider-/Netzwerk-Aufruf, Secret Boundary und Operational Controls erneut prüfen, Audit Event schreiben, keine Tool- oder Agent-Ausführung.
`);
}
patchPackage();
patchDocs();
console.log("Phase 29.3 Patch abgeschlossen.");
