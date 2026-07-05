# Runbook – Phase 43.2 Provider Dispatch Human Approval Token Dashboard & Smoke

## Patch

```powershell
npm run phase43:2:patch
```

## Verify

```powershell
npm run phase43:2:verify
npm run build
```

## Smoke

```powershell
npm run stack:up:detached
npm run stack:health
npm run phase43:2:smoke
```
