# Runbook – Phase 44.2 Provider Dispatch Human Approval Token Issuance Candidate Dashboard & Smoke

## Patch

```powershell
npm run phase44:2:patch
```

## Verify

```powershell
npm run phase44:2:verify
npm run build
```

## Smoke

```powershell
npm run stack:up:detached
npm run stack:health
npm run phase44:2:smoke
```
