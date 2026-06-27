# Phase 5 – Runbook für internes Deployment

## 1. Voraussetzungen

- Docker Desktop installiert
- `.env` im Root vorhanden
- optional `frontend/.env.local` für lokalen Dev-Betrieb

---

## 2. Root `.env` prüfen

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
PORT=7071
```

---

## 3. Compose-Start

Im Root-Ordner:

```bash
docker compose -f docker-compose.internal.yml up --build
```

---

## 4. Aufruf im Browser

- `http://localhost:3000`
- `http://localhost:3000/logs`
- `http://localhost:3000/analytics`
- `http://localhost:3000/system`

API direkt:

- `http://localhost:7071/health`

---

## 5. Stoppen

```bash
docker compose -f docker-compose.internal.yml down
```

---

## 6. Typische Probleme

### Port 3000 belegt
In `docker-compose.internal.yml` ändern, z. B.:

```yaml
ports:
  - "3001:3000"
```

### Port 7071 belegt
In `docker-compose.internal.yml` ändern, z. B.:

```yaml
ports:
  - "7072:7071"
```

Dann `NEXT_PUBLIC_AGENT_API_BASE_URL` entsprechend anpassen.

### Frontend läuft, API nicht
Direkt testen:

```bash
curl http://localhost:7071/health
```

### Logs / Exporte leer
Zuerst echte Council- / Stats-Läufe erzeugen, damit `logs/decision-log.jsonl` und Exportdateien vorhanden sind.
