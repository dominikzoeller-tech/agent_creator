# Runbook – Phase 20.0 Real LLM Invocation Consent Gate

## Patch
```powershell
npm run phase20:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase20-0-patch-real-llm-invocation-consent-gate.cjs
```

## Verify
```powershell
npm run phase20:0:verify
npm run build
```

Docker nur für Browser-Test.
