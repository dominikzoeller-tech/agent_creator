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
  pkg.scripts["phase16:3:patch"]="node scripts/phase16-3-patch-final-planner-handoff.cjs";
  pkg.scripts["phase16:3:verify"]="node scripts/phase16-3-verify-final-planner-handoff.cjs";
  pkg.scripts["planner:final:check"]="npm run phase16:0:verify && npm run phase16:1:verify && npm run phase16:2:verify && npm run phase16:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 16.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase16-3-final-planner-handoff-release-summary.md", `# Phase 16.3 – Final Planner Handoff / Release Summary

## Ziel
Phase 16.3 schließt den Master-Agent-Planner-Block ab und dokumentiert den Stand für Phase 17.

## Abgeschlossene Phase-16-Kette
- Phase 16.0 – Master Agent Orchestration Planner Integration / LLM-Routing Prep
- Phase 16.1 – Planner Policy Simulation & Audit
- Phase 16.2 – Planner Dashboard & Smoke
- Phase 16.3 – Final Planner Handoff / Release Summary

## Was erreicht wurde
- Orchestration Plans können in Planner Recommendations überführt werden.
- Planner Recommendations geben sichere Next-Step-Empfehlungen.
- Planner Policy Simulation prüft Safety Invariants.
- Governance Audit bekommt Planner Policy Events.
- Planner Dashboard fasst Orchestration, Recommendations, Policy und Audit zusammen.
- Die Struktur ist für späteres LLM-Routing vorbereitet, ohne aktuell ein LLM aufzurufen.

## Wichtige UI-Routen
- /master-cockpit
- /master-orchestrator-dashboard
- /master-planner
- /master-planner-policy
- /master-planner-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/master-orchestrator
- /api/master-planner
- /api/master-planner-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/master-agent-orchestration-plans.jsonl
- data/master-agent-planner-recommendations.jsonl
- data/master-agent-planner-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- Keine echte Tool-Ausführung.
- Keine automatische Agent-Ausführung.
- Planner Recommendations sind nur Empfehlungen / Planungsobjekte.
- Policy Simulationen sind Simulationen.
- Kein LLM-Aufruf in Phase 16.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.
- llmRoutingPrepOnly=true.

## Nächster sinnvoller Schritt
Phase 17.0 – Controlled LLM Routing Envelope / Planner Recommendation Explainer

## Ziel Phase 17.0
Planner Recommendations sollen in einen kontrollierten LLM-Routing-Envelope überführt werden:
- LLM bekommt nur sanitisierten Kontext.
- keine Secrets.
- keine echte Ausführung.
- Output bleibt Empfehlung/Erklärung.
- Policy/Audit/Consent bleiben vorgelagert.
`);
 ensureFile("docs/phase16-final-planner-handoff-runbook.md", `# Runbook – Phase 16.3 Final Planner Handoff

## Patch
\`\`\`powershell
npm run phase16:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase16-3-patch-final-planner-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase16:3:verify
npm run planner:final:check
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
git commit -m "docs: add final planner handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase17.md", `# Übergabe für nächsten Chat – Phase 17 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit, Phase 15 Orchestrator Planning und Phase 16 Planner / LLM-Routing Prep sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/master-planner
- http://localhost:3000/master-planner-policy
- http://localhost:3000/master-planner-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run planner:final:check
npm run build
npm run stack:health
\`\`\`

## Nächster Schritt
Phase 17.0 – Controlled LLM Routing Envelope / Planner Recommendation Explainer

## Leitplanken
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- LLM nur mit sanitisiertem Kontext
- keine Secrets
- Output nur Empfehlung/Erklärung
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 16 sind abgeschlossen. Ziel jetzt: Phase 17.0 – Controlled LLM Routing Envelope / Planner Recommendation Explainer. Bitte Planner Recommendations in einen sicheren LLM-Routing-Envelope überführen. Keine echte Ausführung, kein Secret-Leak, nur Empfehlung/Erklärung.
`);
}
patchPackage();
patchDocs();
console.log("Phase 16.3 Patch abgeschlossen.");
