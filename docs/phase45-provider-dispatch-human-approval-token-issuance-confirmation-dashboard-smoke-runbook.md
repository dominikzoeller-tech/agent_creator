# Runbook – Phase 45.2 Provider Dispatch Human Approval Token Issuance Confirmation Dashboard & Smoke

## Patch

```powershell
npm run phase45:2:patch
```

## Verify

```powershell
npm run phase45:2:verify
npm run build
```

## Smoke

```powershell
npm run stack:up:detached
npm run stack:health
npm run phase45:2:smoke
```
