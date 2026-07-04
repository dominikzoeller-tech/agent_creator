# Runbook – Phase 23.0 Provider Configuration & Secret Boundary

## Patch
```powershell
npm run phase23:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase23-0-patch-provider-config-secret-boundary.cjs
```

## Verify
```powershell
npm run phase23:0:verify
npm run build
```

Docker nur für Browser-Test.

Browser-Test: http://localhost:3000/provider-config-secret-boundary

