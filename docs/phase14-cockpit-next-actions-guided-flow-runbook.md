# Runbook – Phase 14.2 Cockpit Next Actions / Guided Flow

## Patch
```powershell
npm run phase14:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase14-2-patch-cockpit-next-actions-guided-flow.cjs
```

## Verify
```powershell
npm run phase14:2:verify
npm run build
npm run stack:up:detached
npm run stack:health
```

## Schneller Check ohne Docker-Neustart
```powershell
npm run phase14:2:verify
npm run build
```

## Manuelle Prüfung
1. /master-cockpit öffnen.
2. Guided Next Actions prüfen.
3. Weiter-Button prüfen.
4. Safety Invariants prüfen.
