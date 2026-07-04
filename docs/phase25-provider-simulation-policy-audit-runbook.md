# Runbook – Phase 25.1 Provider Simulation Policy & Audit

## Patch
```powershell
npm run phase25:1:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase25-1-patch-provider-simulation-policy-audit.cjs
```

## Verify
```powershell
npm run phase25:1:verify
npm run build
```

Docker nur für Browser-Test.
