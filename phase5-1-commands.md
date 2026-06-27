# Phase 5.1 – Kommandos

## Stack starten

```powershell
docker compose -f docker-compose.internal.yml up --build
```

## Stack im Hintergrund starten

```powershell
docker compose -f docker-compose.internal.yml up --build -d
```

## Status anzeigen

```powershell
docker compose -f docker-compose.internal.yml ps
```

## Logs ansehen

```powershell
docker compose -f docker-compose.internal.yml logs -f
```

## Stack stoppen

```powershell
docker compose -f docker-compose.internal.yml down
```

## Images neu bauen ohne Cache

```powershell
docker compose -f docker-compose.internal.yml build --no-cache
```

## Health prüfen

```powershell
Invoke-RestMethod http://localhost:7071/health
```

## Browser URLs

```text
http://localhost:3000
http://localhost:3000/logs
http://localhost:3000/analytics
http://localhost:3000/system
```
