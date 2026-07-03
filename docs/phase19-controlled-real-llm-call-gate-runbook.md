# Runbook – Phase 19.0 Controlled Real LLM Call Gate

## Patch
```powershell
npm run phase19:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase19-0-patch-controlled-real-llm-call-gate.cjs
```

## Verify
```powershell
npm run phase19:0:verify
npm run build
```

Docker nur für Browser-Test.

Browser-Test: http://localhost:3000/real-llm-call-gate

