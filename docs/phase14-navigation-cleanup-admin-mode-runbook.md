# Runbook – Phase 14.1 Navigation Cleanup / Admin Mode Grouping

## Patch
```powershell
npm run phase14:1:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase14-1-patch-navigation-cleanup-admin-mode.cjs
```

## Verify
```powershell
npm run phase14:1:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase14:1:smoke
```

## Manuelle Prüfung
1. /master-cockpit öffnen.
2. Prüfen, dass primär nur Master Cockpit, Chat, Approvals und Audit sichtbar sind.
3. Admin / Developer öffnen.
4. Gruppen Governance, Runtime, Tool Adapter, System & Knowledge und Web Research prüfen.
5. Prüfen, dass technische Seiten weiterhin erreichbar sind.
