# Runbook – Phase 16.0 Master Agent Orchestration Planner

## Patch
```powershell
npm run phase16:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase16-0-patch-orchestration-planner-llm-routing-prep.cjs
```

## Verify
```powershell
npm run phase16:0:verify
npm run build
```

Docker nur für Browser-Test:
```powershell
npm run stack:up:detached
npm run stack:health
```
