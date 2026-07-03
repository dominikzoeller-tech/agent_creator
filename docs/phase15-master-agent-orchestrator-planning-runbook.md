# Runbook – Phase 15.0 Master Agent Orchestrator Planning Layer

## Patch
```powershell
npm run phase15:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase15-0-patch-master-agent-orchestrator-planning.cjs
```

## Verify
```powershell
npm run phase15:0:verify
npm run build
```

Docker nur für Browser-Test:
```powershell
npm run stack:up:detached
npm run stack:health
```

## Manuelle Prüfung
1. /cockpit-actions: Action Plan vorhanden.
2. /master-orchestrator öffnen.
3. Action Plan auswählen.
4. Orchestration Plan erzeugen.
5. Prüfen: executionAllowed=false, toolExecutionAllowed=false, agentExecutionAllowed=false, dryRunOnly=true.
