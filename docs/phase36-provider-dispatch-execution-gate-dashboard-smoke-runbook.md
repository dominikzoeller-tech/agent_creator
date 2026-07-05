# Runbook – Phase 36.2 Provider Dispatch Execution Gate Dashboard & Smoke

## Patch
```powershell
npm run phase36:2:patch
```

## Verify
```powershell
npm run phase36:2:verify
npm run build
```

## Smoke
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase36:2:smoke
```
