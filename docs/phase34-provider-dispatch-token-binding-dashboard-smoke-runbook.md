# Runbook – Phase 34.2 Provider Dispatch Token Binding Dashboard & Smoke

## Patch
```powershell
npm run phase34:2:patch
```

## Verify
```powershell
npm run phase34:2:verify
npm run build
```

## Smoke
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase34:2:smoke
```
