# Runbook – Phase 23.1 Provider Config Policy Simulation & Audit

## Patch
```powershell
npm run phase23:1:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase23-1-patch-provider-config-policy-audit.cjs
```

## Verify
```powershell
npm run phase23:1:verify
npm run build
```

Docker nur für Browser-Test.
