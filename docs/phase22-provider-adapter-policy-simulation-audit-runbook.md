# Runbook – Phase 22.1 Provider Adapter Policy Simulation & Audit

## Patch
```powershell
npm run phase22:1:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase22-1-patch-provider-adapter-policy-audit.cjs
```

## Verify
```powershell
npm run phase22:1:verify
npm run build
```

Docker nur für Browser-Test.
