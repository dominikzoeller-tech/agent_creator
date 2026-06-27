# Phase 5.1 – Deployment-Härtung

## Ziel

Phase 5.1 macht das interne Docker-Deployment robuster und wartbarer.

## Änderungen

### 1. `version` aus Compose entfernt

Docker Compose ignoriert das Feld `version` inzwischen. Die Datei startet jetzt direkt mit `services:`.

### 2. API-Container verbessert

Der API-Container installiert jetzt alle benötigten Dependencies mit:

```bash
npm install
```

Grund: Die API startet aktuell TypeScript direkt über `ts-node`. Vorher wurde `ts-node` beim Containerstart nachinstalliert. Das war funktional, aber nicht sauber.

### 3. Healthchecks ergänzt

Die Compose-Datei enthält jetzt Healthchecks für:

- API: `http://localhost:7071/health`
- Frontend: `http://localhost:3000`

### 4. Frontend wartet auf API

Der Frontend-Service wartet jetzt, bis die API als `healthy` gilt.

### 5. Betriebsbefehle dokumentiert

Siehe `phase5-1-commands.md`.

---

## Testziel

Nach dem Update soll folgender Befehl funktionieren:

```bash
docker compose -f docker-compose.internal.yml up --build
```

Danach sollten erreichbar sein:

- `http://localhost:3000`
- `http://localhost:3000/system`
- `http://localhost:7071/health`
