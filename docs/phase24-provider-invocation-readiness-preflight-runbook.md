# Runbook – Phase 24.0 Provider Invocation Readiness Preflight

## Patch
```powershell
npm run phase24:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase24-0-patch-provider-invocation-readiness-preflight.cjs
```

## Verify
```powershell
npm run phase24:0:verify
npm run build
```

Docker nur für Browser-Test.
