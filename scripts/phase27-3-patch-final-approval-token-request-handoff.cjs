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
  pkg.scripts["phase27:3:patch"]="node scripts/phase27-3-patch-final-approval-token-request-handoff.cjs";
  pkg.scripts["phase27:3:verify"]="node scripts/phase27-3-verify-final-approval-token-request-handoff.cjs";
  pkg.scripts["llm:approval-token-request:final:check"]="npm run phase27:0:verify && npm run phase27:1:verify && npm run phase27:2:verify && npm run phase27:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 27.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase27-3-final-approval-token-request-handoff-release-summary.md", `# Phase 27.3 – Final Approval Token Request Handoff / Release Summary

## Ziel
Phase 27.3 schließt den Explicit-Human-Approval-Token-Request-Block ab und dokumentiert den Stand für Phase 28.

## Abgeschlossene Phase-27-Kette
- Phase 27.0 – Explicit Human Approval Token Request / Still No Provider Call
- Phase 27.1 – Approval Token Request Policy & Audit
- Phase 27.2 – Approval Token Request Dashboard & Smoke
- Phase 27.3 – Final Approval Token Request Handoff / Release Summary

## Was erreicht wurde
- Human Approval Token Requests können aus einem Controlled Real Provider Invocation Gate vorbereitet werden.
- Approval Token Requests erfassen einen expliziten Approval Reason.
- Approval Token wird weiterhin nicht automatisch erteilt.
- Human Approval bleibt weiterhin false.
- Human Approval Required bleibt verpflichtend true.
- Provider Call Plan bleibt blockiert.
- Provider und Modell bleiben none.
- Netzwerk-/Provider-Aufrufe bleiben blockiert.
- Approval Token Request Policy prüft Request-Status, Token-not-issued, Human-not-approved, No Auto Call, Secret Boundary und Operational Controls.
- Approval Token Request Dashboard fasst Requests, Policy Simulationen, Real Provider Gates und Audit zusammen.
- Governance Audit protokolliert Approval-Request- und Policy-Ereignisse mit critical risk level.
- Tool- und Agent-Ausführung bleiben weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /real-provider-gate-dashboard
- /human-approval-token-request
- /approval-token-request-policy
- /approval-token-request-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/controlled-real-provider-invocation-gate
- /api/human-approval-token-request
- /api/approval-token-request-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/controlled-real-provider-invocation-gates.jsonl
- data/human-approval-token-requests.jsonl
- data/approval-token-request-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- explicit_human_approval_token_request_no_provider_call.
- approvalTokenRequested=true.
- approvalTokenIssued=false.
- humanApproved=false.
- humanApprovalRequired=true.
- Token wird nicht automatisch erteilt.
- Kein automatischer Provider-/Netzwerk-Aufruf.
- provider=none.
- modelSelected=none.
- networkCallPerformed=false.
- providerExecutionAllowed=false.
- realLlmCallAllowed=false.
- llmCallPerformed=false.
- Keine Tool-Ausführung.
- Keine Agent-Ausführung.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Bekannter Hinweis
Wenn Phase 27.0, 27.1 oder 27.2 Verify nur an Doku-/Navigation-Strings scheitert, zuerst die fehlenden Verify-Strings oder Navigation-Links nachziehen. Build und Smoke bleiben die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 28.0 – Explicit Human Approval Token Issuance Gate / Still No Provider Call

## Ziel Phase 28.0
Nach dem Request wird ein separater Approval Token Issuance Gate vorbereitet:
- Approval Token Request als Input
- explizite Human Approval Token Issuance vorbereiten
- Token-Ausstellung weiterhin kontrolliert und auditierbar
- kein automatischer Provider-/Netzwerk-Aufruf
- Secret Boundary erneut prüfen
- Operational Controls erneut prüfen
- Audit für Token Issuance Gate
- weiterhin keine Tool- oder Agent-Ausführung
`);
 ensureFile("docs/phase27-final-approval-token-request-handoff-runbook.md", `# Runbook – Phase 27.3 Final Approval Token Request Handoff

## Patch
\`\`\`powershell
npm run phase27:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase27-3-patch-final-approval-token-request-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase27:3:verify
npm run llm:approval-token-request:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase27:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final approval token request handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase28.md", `# Übergabe für nächsten Chat – Phase 28 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate, Phase 20 Real LLM Consent, Phase 21 Approved Invocation Envelope, Phase 22 Provider Adapter Stub, Phase 23 Provider Config Secret Boundary, Phase 24 Provider Readiness, Phase 25 Controlled Provider Simulation, Phase 26 Real Provider Gate und Phase 27 Approval Token Request sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/real-provider-gate-dashboard
- http://localhost:3000/human-approval-token-request
- http://localhost:3000/approval-token-request-policy
- http://localhost:3000/approval-token-request-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:approval-token-request:final:check
npm run build
npm run stack:health
npm run phase27:2:smoke
\`\`\`

## Nächster Schritt
Phase 28.0 – Explicit Human Approval Token Issuance Gate / Still No Provider Call

## Leitplanken
- Approval Token Request als Input
- Token-Ausstellung separat kontrollieren
- Token-Ausstellung auditierbar vorbereiten
- kein automatischer Provider-/Netzwerk-Aufruf
- Secret Boundary erneut prüfen
- Operational Controls erneut prüfen
- Audit für Token Issuance Gate
- keine Tool- oder Agent-Ausführung
- approvalTokenRequested=true
- approvalTokenIssued kontrolliert, nicht implizit
- humanApproved kontrolliert, nicht implizit
- networkCallPerformed=false
- providerExecutionAllowed=false
- llmCallPerformed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 27 sind abgeschlossen. Ziel jetzt: Phase 28.0 – Explicit Human Approval Token Issuance Gate / Still No Provider Call. Bitte ein separates Approval Token Issuance Gate vorbereiten. Kein automatischer Provider-/Netzwerk-Aufruf, Token-Ausstellung kontrolliert und auditierbar, Secret Boundary und Operational Controls erneut prüfen, Audit für Token Issuance Gate.
`);
}
patchPackage();
patchDocs();
console.log("Phase 27.3 Patch abgeschlossen.");
