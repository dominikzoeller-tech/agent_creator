# Runbook – Phase 33.2 Provider Dispatch Readiness Dashboard & Smoke

## Patch
```powershell
npm run phase33:2:patch
```

## Verify
```powershell
npm run phase33:2:verify
npm run build
```

## Smoke
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase33:2:smoke
```
