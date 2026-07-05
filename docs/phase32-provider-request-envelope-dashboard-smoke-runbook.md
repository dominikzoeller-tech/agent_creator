# Runbook – Phase 32.2 Provider Request Envelope Dashboard & Smoke

## Patch
```powershell
npm run phase32:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase32-2-patch-provider-request-envelope-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase32:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase32:2:smoke
```
