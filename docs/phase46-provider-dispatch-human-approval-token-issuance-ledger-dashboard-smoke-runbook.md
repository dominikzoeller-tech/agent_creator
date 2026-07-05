# Runbook – Phase 46.2 Provider Dispatch Human Approval Token Issuance Ledger Dashboard & Smoke

## Patch

```powershell
npm run phase46:2:patch
```

## Verify

```powershell
npm run phase46:2:verify
npm run build
```

## Smoke

```powershell
npm run stack:up:detached
npm run stack:health
npm run phase46:2:smoke
```

Falls neue Routen im laufenden Container noch 404 liefern:

```powershell
docker compose -f docker-compose.internal.yml down
docker compose -f docker-compose.internal.yml up --build -d
npm run stack:health
npm run phase46:2:smoke
```
