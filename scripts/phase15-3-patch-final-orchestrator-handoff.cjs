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
  pkg.scripts["phase15:3:patch"]="node scripts/phase15-3-patch-final-orchestrator-handoff.cjs";
  pkg.scripts["phase15:3:verify"]="node scripts/phase15-3-verify-final-orchestrator-handoff.cjs";
  pkg.scripts["orchestrator:final:check"]="npm run phase15:0:verify && npm run phase15:1:verify && npm run phase15:2:verify && npm run phase15:3:verify";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 15.3 Scripts eingetragen.");
}
function patchDocs(){
 ensureFile("phase15-3-final-orchestrator-handoff-release-summary.md", `# Phase 15.3 – Final Orchestrator Handoff / Release Summary

## Ziel
Phase 15.3 schließt den Master-Agent-Orchestrator-Planning-Block ab und dokumentiert den Stand für den nächsten Ausbauschritt.

## Abgeschlossene Phase-15-Kette
- Phase 15.0 – Master Agent Orchestrator Planning Layer
- Phase 15.1 – Orchestration Policy Simulation & Audit
- Phase 15.2 – Orchestrator Dashboard & Smoke
- Phase 15.3 – Final Orchestrator Handoff / Release Summary

## Was erreicht wurde
- Cockpit Action Plans können in Master Agent Orchestration Plans überführt werden.
- Orchestration Plans beschreiben sichere nächste Routing-/Planungsschritte.
- Policy Simulation prüft Orchestrator Safety Invariants.
- Governance Audit bekommt Orchestration Policy Events.
- Dashboard fasst Actions, Plans, Policy Simulationen und Audit zusammen.

## Wichtige UI-Routen
- /master-cockpit
- /cockpit-actions
- /master-orchestrator
- /master-orchestrator-policy
- /master-orchestrator-dashboard
- /governance-audit

## Wichtige API-Routen
- /api/cockpit-actions
- /api/master-orchestrator
- /api/master-orchestrator-policy
- /api/governance-audit
- /health

## Runtime Stores
Runtime-Daten liegen unter \`data/\` und bleiben bewusst aus dem Commit.

Typische Dateien:
- data/cockpit-action-plans.jsonl
- data/master-agent-orchestration-plans.jsonl
- data/master-agent-orchestration-policy-simulations.jsonl
- data/governance-audit.jsonl

## Sicherheitsstand
- Keine echte Tool-Ausführung.
- Keine automatische Agent-Ausführung.
- Orchestration Plans sind Planungsobjekte.
- Policy Simulationen sind Simulationen.
- executionAllowed=false.
- toolExecutionAllowed=false.
- agentExecutionAllowed=false.
- dryRunOnly=true.

## Nächster sinnvoller Schritt
Phase 16.0 – Master Agent Orchestration Planner Integration / LLM-Routing Prep

## Ziel Phase 16.0
Der Master Agent soll Orchestration Plans semantisch bewerten und daraus kontrollierte Empfehlungen erzeugen:
- welche Aktion ist als nächstes sinnvoll?
- welche Sicherheitsgates fehlen?
- welche Consent-/Policy-Schritte sind nötig?
- weiterhin keine echte Ausführung.
`);
 ensureFile("docs/phase15-final-orchestrator-handoff-runbook.md", `# Runbook – Phase 15.3 Final Orchestrator Handoff

## Patch
\`\`\`powershell
npm run phase15:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase15-3-patch-final-orchestrator-handoff.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase15:3:verify
npm run orchestrator:final:check
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
git commit -m "docs: add final orchestrator handoff"
git push origin main
git status --short
\`\`\`
`);
 ensureFile("next-chat-handoff-phase16.md", `# Übergabe für nächsten Chat – Phase 16 Start

## Projekt
C:\\Users\\User\\ai-assistant\\agent_creator

## Stand
Phase 11 Governance, Phase 12 Runtime Foundation, Phase 13 Tool Adapter Sandbox, Phase 14 Cockpit und Phase 15 Master Agent Orchestrator Planning sind abgeschlossen.

## Wichtigste UI-Routen
- http://localhost:3000/master-cockpit
- http://localhost:3000/cockpit-actions
- http://localhost:3000/master-orchestrator
- http://localhost:3000/master-orchestrator-policy
- http://localhost:3000/master-orchestrator-dashboard
- http://localhost:3000/governance-audit

## Wichtige Checks
\`\`\`powershell
npm run orchestrator:final:check
npm run cockpit:final:check
npm run build
npm run stack:health
\`\`\`

## Nächster Schritt
Phase 16.0 – Master Agent Orchestration Planner Integration / LLM-Routing Prep

## Leitplanken
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung
- nur Empfehlungen / Planungsobjekte / Policy-Vorschläge
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Startprompt
Wir arbeiten am Projekt C:\\Users\\User\\ai-assistant\\agent_creator. Phase 11 bis 15 sind abgeschlossen. Ziel jetzt: Phase 16.0 – Master Agent Orchestration Planner Integration / LLM-Routing Prep. Bitte Orchestration Plans semantisch bewerten und sichere Next-Step-Empfehlungen erzeugen. Keine echte Ausführung.
`);
}
patchPackage();
patchDocs();
console.log("Phase 15.3 Patch abgeschlossen.");
