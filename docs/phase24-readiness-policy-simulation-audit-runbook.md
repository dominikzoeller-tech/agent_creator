# Runbook – Phase 24.1 Provider Readiness Policy Simulation & Audit

## Patch
```powershell
npm run phase24:1:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase24-1-patch-readiness-policy-audit.cjs
```

## Verify
```powershell
npm run phase24:1:verify
npm run build
```

Docker nur für Browser-Test.
