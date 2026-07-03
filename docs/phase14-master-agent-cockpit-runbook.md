# Runbook – Phase 14.0 Master Agent Cockpit

## Patch
```powershell
npm run phase14:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase14-0-patch-master-agent-cockpit.cjs
```

## Verify
```powershell
npm run phase14:0:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase14:0:smoke
```

## Manuelle Prüfung
1. /master-cockpit öffnen.
2. Kacheln Governance, Runtime, Tool Adapter und Audit prüfen.
3. Safety Invariants prüfen.
4. Weiterhin keine echte Tool-Ausführung erlauben.
