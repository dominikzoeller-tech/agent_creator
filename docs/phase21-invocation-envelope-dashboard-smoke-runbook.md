# Runbook – Phase 21.2 Invocation Envelope Dashboard & Smoke

## Patch
```powershell
npm run phase21:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase21-2-patch-invocation-envelope-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase21:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase21:2:smoke
```
