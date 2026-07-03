# Runbook – Phase 17.0 Controlled LLM Routing Envelope

## Patch
```powershell
npm run phase17:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase17-0-patch-controlled-llm-routing-envelope.cjs
```

## Verify
```powershell
npm run phase17:0:verify
npm run build
```

Docker nur für Browser-Test:
```powershell
npm run stack:up:detached
npm run stack:health
```

Browser-Test: http://localhost:3000/llm-routing-envelope

