# Runbook – Phase 33.0 Provider Dispatch Readiness

## Patch
```powershell
npm run phase33:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase33-0-patch-provider-dispatch-readiness.cjs
```

## Verify
```powershell
npm run phase33:0:verify
npm run build
```

## Browser-Test
http://localhost:3000/provider-dispatch-readiness
