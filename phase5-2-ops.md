# Phase 5.2 – Betriebs-Komfort und Stack-Kommandos

## Ziel

Phase 5.2 macht den internen Docker-Betrieb einfacher. Statt lange Docker-Compose-Befehle immer wieder manuell zu schreiben, kannst du Stack-Kommandos direkt über `npm run ...` starten.

---

## Neue Dateien

```text
scripts/add-stack-scripts.cjs
scripts/stack-health-check.ps1
phase5-2-ops.md
README-phase5-snippet.md
```

---

## Einmalige Einrichtung

Im Projekt-Root ausführen:

```powershell
node scripts/add-stack-scripts.cjs
```

Dadurch werden diese Scripts in deine Root-`package.json` eingefügt:

```json
"stack:up": "docker compose -f docker-compose.internal.yml up --build",
"stack:up:detached": "docker compose -f docker-compose.internal.yml up --build -d",
"stack:down": "docker compose -f docker-compose.internal.yml down",
"stack:logs": "docker compose -f docker-compose.internal.yml logs -f",
"stack:ps": "docker compose -f docker-compose.internal.yml ps",
"stack:health": "powershell -ExecutionPolicy Bypass -File scripts/stack-health-check.ps1"
```

---

## Danach verfügbare Kommandos

### Stack starten

```powershell
npm run stack:up
```

### Stack im Hintergrund starten

```powershell
npm run stack:up:detached
```

### Stack stoppen

```powershell
npm run stack:down
```

### Logs anzeigen

```powershell
npm run stack:logs
```

### Containerstatus anzeigen

```powershell
npm run stack:ps
```

### Health Check ausführen

```powershell
npm run stack:health
```

---

## Empfohlener Alltag

### Start

```powershell
npm run stack:up:detached
npm run stack:health
```

### Arbeiten

Browser öffnen:

```text
http://localhost:3000
```

### Logs bei Bedarf

```powershell
npm run stack:logs
```

### Stoppen

```powershell
npm run stack:down
```
