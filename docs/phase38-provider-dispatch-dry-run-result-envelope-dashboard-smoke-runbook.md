# Runbook – Phase 38.2 Provider Dispatch Dry-Run Result Envelope Dashboard & Smoke

## Patch
```powershell
npm run phase38:2:patch
```

## Verify
```powershell
npm run phase38:2:verify
npm run build
```

## Smoke
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase38:2:smoke
```
