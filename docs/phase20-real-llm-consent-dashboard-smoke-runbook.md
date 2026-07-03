# Runbook – Phase 20.2 Real LLM Consent Dashboard & Smoke

## Patch
```powershell
npm run phase20:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase20-2-patch-real-llm-consent-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase20:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase20:2:smoke
```
