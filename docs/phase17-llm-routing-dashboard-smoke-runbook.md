# Runbook – Phase 17.2 LLM Routing Dashboard & Smoke

## Patch
```powershell
npm run phase17:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase17-2-patch-llm-routing-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase17:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase17:2:smoke
```
