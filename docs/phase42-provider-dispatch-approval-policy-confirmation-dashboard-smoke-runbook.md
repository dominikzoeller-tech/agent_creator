# Runbook – Phase 42.2 Provider Dispatch Approval Policy Confirmation Dashboard & Smoke

## Patch

```powershell
npm run phase42:2:patch
```

## Verify

```powershell
npm run phase42:2:verify
npm run build
```

## Smoke

```powershell
npm run stack:up:detached
npm run stack:health
npm run phase42:2:smoke
```
