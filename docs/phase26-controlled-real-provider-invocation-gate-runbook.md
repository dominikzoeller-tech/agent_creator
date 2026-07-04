# Runbook – Phase 26.0 Controlled Real Provider Invocation Gate

## Patch
```powershell
npm run phase26:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase26-0-patch-controlled-real-provider-invocation-gate.cjs
```

## Verify
```powershell
npm run phase26:0:verify
npm run build
```

Docker nur für Browser-Test.
