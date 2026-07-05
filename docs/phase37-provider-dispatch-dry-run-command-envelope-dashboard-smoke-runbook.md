# Runbook – Phase 37.2 Provider Dispatch Dry-Run Command Envelope Dashboard & Smoke

## Patch
```powershell
npm run phase37:2:patch
```

## Verify
```powershell
npm run phase37:2:verify
npm run build
```

## Smoke
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase37:2:smoke
```
