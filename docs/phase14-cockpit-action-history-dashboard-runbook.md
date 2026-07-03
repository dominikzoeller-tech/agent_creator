# Runbook – Phase 14.4 Cockpit Action History

## Patch
```powershell
npm run phase14:4:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase14-4-patch-cockpit-action-history-dashboard.cjs
```

## Verify
```powershell
npm run phase14:4:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase14:4:smoke
```

## Manuelle Prüfung
1. /master-cockpit öffnen.
2. Cockpit Action planen.
3. /cockpit-actions öffnen.
4. Action History prüfen.
