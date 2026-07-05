# Runbook – Phase 35.2 Provider Dispatch Final Preflight Dashboard & Smoke

## Patch
```powershell
npm run phase35:2:patch
```

## Verify
```powershell
npm run phase35:2:verify
npm run build
```

## Smoke
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase35:2:smoke
```
