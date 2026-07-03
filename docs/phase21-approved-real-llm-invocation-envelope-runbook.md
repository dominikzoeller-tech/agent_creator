# Runbook – Phase 21.0 Approved Real LLM Invocation Envelope

## Patch
```powershell
npm run phase21:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase21-0-patch-approved-real-llm-invocation-envelope.cjs
```

## Verify
```powershell
npm run phase21:0:verify
npm run build
```

Docker nur für Browser-Test.

Browser-Test: http://localhost:3000/approved-real-llm-invocation-envelope

