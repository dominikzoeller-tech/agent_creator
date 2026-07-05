# Runbook – Phase 39.2 Provider Dispatch Transcript Envelope Dashboard & Smoke

## Patch

```powershell
npm run phase39:2:patch
```

Falls Script noch nicht registriert ist:

```powershell
node scripts/phase39-2-patch-provider-dispatch-transcript-envelope-dashboard-smoke.cjs
```

## Verify

```powershell
npm run phase39:2:verify
npm run build
```

## Smoke

```powershell
npm run stack:up:detached
npm run stack:health
npm run phase39:2:smoke
```
