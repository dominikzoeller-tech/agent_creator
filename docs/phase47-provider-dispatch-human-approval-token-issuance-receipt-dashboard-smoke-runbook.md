# Runbook – Phase 47.2 Provider Dispatch Human Approval Token Issuance Receipt Dashboard & Smoke

## Patch

```powershell
npm run phase47:2:patch
```

## Verify

```powershell
npm run phase47:2:verify
npm run build
```

## Smoke

```powershell
npm run stack:up:detached
npm run stack:health
npm run phase47:2:smoke
```

Falls neue Routen im laufenden Container noch 404 liefern:

```powershell
docker compose -f docker-compose.internal.yml down
docker compose -f docker-compose.internal.yml up --build -d
npm run stack:health
npm run phase47:2:smoke
```
