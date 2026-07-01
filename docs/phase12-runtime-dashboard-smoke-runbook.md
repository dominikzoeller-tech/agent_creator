# Runbook – Phase 12.4 Runtime Dashboard & Smoke

## Patch
```powershell
npm run phase12:4:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase12-4-patch-runtime-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase12:4:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase12:4:smoke
```

## Manuelle Prüfung
1. /agent-runtime-dashboard öffnen.
2. Cards für Runtime, Consent, Resume, Policy, Audit prüfen.
3. Smoke Script muss alle Runtime Routen mit OK melden.
