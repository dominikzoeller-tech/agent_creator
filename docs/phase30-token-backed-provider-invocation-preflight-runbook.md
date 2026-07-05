# Runbook – Phase 30.0 Token-Backed Provider Invocation Preflight

## Patch
```powershell
npm run phase30:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase30-0-patch-token-backed-provider-invocation-preflight.cjs
```

## Verify
```powershell
npm run phase30:0:verify
npm run build
```

## Browser-Test
http://localhost:3000/token-backed-provider-invocation-preflight
