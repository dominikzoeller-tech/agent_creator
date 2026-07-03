# Runbook – Phase 13.4 Tool Adapter Dashboard & Smoke

## Patch
```powershell
npm run phase13:4:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase13-4-patch-tool-adapter-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase13:4:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase13:4:smoke
```

## Manuelle Prüfung
1. /tool-adapter-dashboard öffnen.
2. Cards für Adapter, Plans, Consent, Resume, Policy, Audit prüfen.
3. Smoke Script muss alle Tool Adapter Routen mit OK melden.
