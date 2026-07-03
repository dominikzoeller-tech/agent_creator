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
  pkg.scripts["phase17:3:patch"]="node scripts/phase17-3-patch-final-llm-routing-handoff.cjs";
  pkg.scripts["phase17:3:verify"]="node scripts/phase17-3-verify-final-llm-routing-handoff.cjs";
  pkg.scripts["llm:routing:final:check"]="npm run phase17:0:verify && npm run phase17:1:verify && npm run phase17:2:verify && npm run phase17:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 17.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase17-3-final-llm-routing-handoff-release-summary.md", `# Phase 17.3 – Final LLM Routing Handoff / Release Summary

## Ziel
Phase 17.3 schließt den Controlled-LLM-Routing-Block ab und dokumentiert den Stand für Phase 18.

## Abgeschlossene Phase-17-Kette
- Phase 17.0 – Controlled LLM Routing Envelope / Planner Recommendation Explainer
- Phase 17.1 – LLM Routing Policy Simulation & Audit
- Phase 17.2 – LLM Routing Dashboard & Smoke
- Phase 17.3 – Final LLM Routing Handoff / Release Summary

## Was erreicht wurde
- Planner Recommendations können in Controlled LLM Routing Envelopes überführt werden.
- Der Envelope enthält nur sanitisierten Kontext.
- Der Envelope enthält einen expliziten Explanation-only Output Contract.
- LLM Routing Policy Simulation prüft Safety Invariants, Secret-Risiko und Output Contract.
- Governance Audit bekommt LLM Routing Policy Events.
- LLM Routing Dashboard fasst Recommendations, Envelopes, Policy Simulations und Audit zusammen.
- In Phase 17 wird weiterhin kein LLM aufgerufen.

## Wichtige UI-Routen
- /master-cockpit
- /master-planner-dashboard
- /llm-routing-envelope
- /llm-routing-policy
- /llm-routing-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/master-planner
- /api/llm-routing-envelope
- /api/llm-routing-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/master-agent-planner-recommendations.jsonl
- data/controlled-llm-routing-envelopes.jsonl
- data/controlled-llm-routing-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- Kein echter LLM-Aufruf.
- Keine echte Tool-Ausführung.
- Keine automatische Agent-Ausführung.
- Sanitized Context only.
- Output Contract bleibt recommendation_explanation_only.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.
- llmRoutingPrepOnly=true.

## Nächster sinnvoller Schritt
Phase 18.0 – Controlled LLM Call Stub / Dry-run Explainer Response

## Ziel Phase 18.0
Aus dem Controlled LLM Routing Envelope soll eine trockene Explainer Response erzeugt werden:
- weiterhin kein produktiver LLM-Aufruf nötig
- optionaler Stub/Mock Explainer
- klare Trennung zwischen Prompt, Policy, Audit und Antwort
- keine Ausführung
- keine Secrets
`);
 ensureFile("docs/phase17-final-llm-routing-handoff-runbook.md", `# Runbook – Phase 17.3 Final LLM Routing Handoff

## Patch
\`\`\`powershell
npm run phase17:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase17-3-patch-final-llm-routing-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase17:3:verify
npm run llm:routing:final:check
npm run build
\`\`\`

## Optional Stack Check
\`\`\`powershell
npm run stack:health
\`\`\`

## Git Abschluss
\`\`\`powershell
git status --short
git add .
git commit -m "docs: add final llm routing handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase18.md", `# Übergabe für nächsten Chat – Phase 18 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning, Phase 16 Planner / LLM-Routing Prep und Phase 17 Controlled LLM Routing sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/master-planner-dashboard
- http://localhost:3000/llm-routing-envelope
- http://localhost:3000/llm-routing-policy
- http://localhost:3000/llm-routing-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run llm:routing:final:check
npm run planner:final:check
npm run build
npm run stack:health
\`\`\`

## Nächster Schritt
Phase 18.0 – Controlled LLM Call Stub / Dry-run Explainer Response

## Leitplanken
- kein produktiver LLM-Aufruf ohne Policy Gate
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- keine Secrets
- Output nur Erklärung/Empfehlung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 17 sind abgeschlossen. Ziel jetzt: Phase 18.0 – Controlled LLM Call Stub / Dry-run Explainer Response. Bitte aus Controlled LLM Routing Envelopes sichere trockene Explainer Responses erzeugen. Kein produktiver LLM-Aufruf, keine Ausführung, keine Secrets.
`);
}
patchPackage();
patchDocs();
console.log("Phase 17.3 Patch abgeschlossen.");
