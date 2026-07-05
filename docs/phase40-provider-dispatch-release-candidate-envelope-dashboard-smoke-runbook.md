# Runbook – Phase 40.2 Provider Dispatch Release Candidate Envelope Dashboard & Smoke

## Patch

```powershell
node scripts/phase40-2-patch-provider-dispatch-release-candidate-envelope-dashboard-smoke.cjs
```

## Verify

```powershell
npm run phase40:2:verify
npm run build
```

## Smoke

```powershell
npm run stack:up:detached
npm run stack:health
npm run phase40:2:smoke
```
