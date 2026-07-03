# Runbook – Phase 21.1 Invocation Envelope Policy Simulation & Audit

## Patch
```powershell
npm run phase21:1:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase21-1-patch-invocation-envelope-policy-audit.cjs
```

## Verify
```powershell
npm run phase21:1:verify
npm run build
```

Docker nur für Browser-Test.
