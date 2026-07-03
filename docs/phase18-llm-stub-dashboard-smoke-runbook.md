# Runbook – Phase 18.2 LLM Stub Dashboard & Smoke

## Patch
```powershell
npm run phase18:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase18-2-patch-llm-stub-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase18:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase18:2:smoke
```
