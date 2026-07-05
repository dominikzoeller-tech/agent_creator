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
  pkg.scripts["phase28:3:patch"]="node scripts/phase28-3-patch-final-approval-token-issuance-handoff.cjs";
  pkg.scripts["phase28:3:verify"]="node scripts/phase28-3-verify-final-approval-token-issuance-handoff.cjs";
  pkg.scripts["llm:approval-token-issuance:final:check"]="npm run phase28:0:verify && npm run phase28:1:verify && npm run phase28:2:verify && npm run phase28:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 28.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase28-3-final-approval-token-issuance-handoff-release-summary.md", `# Phase 28.3 – Final Approval Token Issuance Handoff / Release Summary

## Ziel
Phase 28.3 schließt den Explicit-Human-Approval-Token-Issuance-Block ab und dokumentiert den Stand für Phase 29.

## Abgeschlossene Phase-28-Kette
- Phase 28.0 – Explicit Human Approval Token Issuance Gate / Still No Provider Call
- Phase 28.1 – Approval Token Issuance Policy & Audit
- Phase 28.2 – Approval Token Issuance Dashboard & Smoke
- Phase 28.3 – Final Approval Token Issuance Handoff / Release Summary

## Was erreicht wurde
- Approval Token Issuance Gates können aus Human Approval Token Requests vorbereitet werden.
- Token-Ausstellung wird separat kontrolliert und auditierbar vorbereitet.
- Explizite Issuance Intent wird als eigener Pflichtschritt geprüft.
- Approval Token Issuance wird vorbereitet, aber der Token wird weiterhin nicht automatisch ausgestellt.
- Human Approval bleibt weiterhin false.
- Provider Call Plan bleibt blockiert.
- Provider und Modell bleiben none.
- Netzwerk-/Provider-Aufrufe bleiben blockiert.
- Approval Token Issuance Policy prüft Issuance Intent, Token-not-issued, Human-not-approved, No Auto Call, Secret Boundary und Operational Controls.
- Approval Token Issuance Dashboard fasst Issuance Gates, Policy Simulationen, Human Approval Token Requests und Audit zusammen.
- Governance Audit protokolliert Issuance-Gate- und Policy-Ereignisse mit critical risk level.
- Tool- und Agent-Ausführung bleiben weiterhin blockiert.

## Wichtige UI-Routen
- /master-cockpit
- /approval-token-request-dashboard
- /approval-token-issuance-gate
- /approval-token-issuance-policy
- /approval-token-issuance-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/human-approval-token-request
- /api/approval-token-issuance-gate
- /api/approval-token-issuance-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/human-approval-token-requests.jsonl
- data/approval-token-issuance-gates.jsonl
- data/approval-token-issuance-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- explicit_human_approval_token_issuance_gate_no_provider_call.
- approvalTokenRequested=true.
- approvalTokenIssuancePrepared=true.
- approvalTokenIssued=false.
- humanApproved=false.
- humanApprovalRequired=true.
- issuanceIntentRecorded=true.
- Token wird nicht automatisch ausgestellt.
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
Wenn Phase 28.0, 28.1 oder 28.2 Verify nur an Doku-/Navigation-Strings scheitert, zuerst die fehlenden Verify-Strings oder Navigation-Links nachziehen. Build und Smoke bleiben die entscheidende Integrationsprüfung.

## Nächster sinnvoller Schritt
Phase 29.0 – Explicit Human Approval Token Activation Gate / Still No Provider Call

## Ziel Phase 29.0
Nach der Issuance-Vorbereitung wird ein separater Approval Token Activation Gate vorbereitet:
- Approval Token Issuance Gate als Input
- Token-Aktivierung separat kontrollieren
- Activation noch ohne Provider-/Netzwerk-Aufruf
- Secret Boundary erneut prüfen
- Operational Controls erneut prüfen
- Audit für Token Activation Gate
- weiterhin keine Tool- oder Agent-Ausführung
`);
 ensureFile("docs/phase28-final-approval-token-issuance-handoff-runbook.md", `# Runbook – Phase 28.3 Final Approval Token Issuance Handoff

## Patch
\`\`\`powershell
npm run phase28:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase28-3-patch-final-approval-token-issuance-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase28:3:verify
npm run llm:approval-token-issuance:final:check
npm run build
\`\`\`

## Smoke optional
Wenn der Stack läuft:
\`\`\`powershell
npm run stack:health
npm run phase28:2:smoke
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final approval token issuance handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase29.md", `# Übergabe für nächsten Chat – Phase 29 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep, Phase 17 Controlled LLM Routing, Phase 18 Controlled LLM Stub, Phase 19 Controlled Real LLM Gate, Phase 20 Real LLM Consent, Phase 21 Approved Invocation Envelope, Phase 22 Provider Adapter Stub, Phase 23 Provider Config Secret Boundary, Phase 24 Provider Readiness, Phase 25 Controlled Provider Simulation, Phase 26 Real Provider Gate, Phase 27 Approval Token Request und Phase 28 Approval Token Issuance sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/approval-token-request-dashboard
- http://localhost:3000/approval-token-issuance-gate
- http://localhost:3000/approval-token-issuance-policy
- http://localhost:3000/approval-token-issuance-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:approval-token-issuance:final:check
npm run build
npm run stack:health
npm run phase28:2:smoke
\`\`\`

## Nächster Schritt
Phase 29.0 – Explicit Human Approval Token Activation Gate / Still No Provider Call

## Leitplanken
- Approval Token Issuance Gate als Input
- Token-Aktivierung separat kontrollieren
- Activation noch ohne Provider-/Netzwerk-Aufruf
- Secret Boundary erneut prüfen
- Operational Controls erneut prüfen
- Audit für Token Activation Gate
- keine Tool- oder Agent-Ausführung
- approvalTokenRequested=true
- approvalTokenIssuancePrepared=true
- approvalTokenIssued kontrolliert, nicht implizit
- tokenActivationPrepared=true aber tokenActive=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- llmCallPerformed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 28 sind abgeschlossen. Ziel jetzt: Phase 29.0 – Explicit Human Approval Token Activation Gate / Still No Provider Call. Bitte ein separates Approval Token Activation Gate vorbereiten. Kein automatischer Provider-/Netzwerk-Aufruf, Token-Aktivierung kontrolliert und auditierbar, Secret Boundary und Operational Controls erneut prüfen, Audit für Token Activation Gate.
`);
}
patchPackage();
patchDocs();
console.log("Phase 28.3 Patch abgeschlossen.");
