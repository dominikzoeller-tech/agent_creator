# Runbook – Phase 19.2 Real LLM Gate Dashboard & Smoke

## Patch
```powershell
npm run phase19:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase19-2-patch-real-llm-gate-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase19:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase19:2:smoke
```
