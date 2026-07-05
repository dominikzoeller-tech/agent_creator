# Runbook – Phase 41.2 Provider Dispatch Approval Candidate Envelope Dashboard & Smoke

## Patch

```powershell
node scripts/phase41-2-patch-provider-dispatch-approval-candidate-envelope-dashboard-smoke.cjs
```

## Verify

```powershell
npm run phase41:2:verify
npm run build
```

## Smoke

```powershell
npm run stack:up:detached
npm run stack:health
npm run phase41:2:smoke
```
