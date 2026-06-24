# docker-run.md

## Ziel

Dieses Dokument zeigt, wie die Privacy-First API in Docker gebaut und lokal gestartet wird.

---

## Voraussetzungen

- Docker Desktop installiert
- laufende `.env` mit gültigem API-Key
- Projektwurzel ist das Verzeichnis mit `Dockerfile`

---

## 1. Docker Image bauen

```bash
docker build -t master-agent-api:local .
```

---

## 2. Container lokal starten

### Variante A – mit `.env` Datei

```bash
docker run --rm -p 7071:7071 --env-file .env master-agent-api:local
```

### Variante B – Variablen direkt übergeben

```bash
docker run --rm -p 7071:7071   -e OPENAI_API_KEY=sk-...   -e OPENAI_MODEL=gpt-4.1-mini   -e PORT=7071   master-agent-api:local
```

---

## 3. Health prüfen

### PowerShell

```powershell
Invoke-RestMethod http://localhost:7071/health
```

### curl

```bash
curl http://localhost:7071/health
```

---

## 4. API Smoke Test gegen laufenden Container

Wenn der Container läuft, kannst du lokal im Projektordner ausführen:

```bash
npm run api:smoke
```

---

## 5. Stoppen

Wenn du den Container im Vordergrund gestartet hast:

```text
Ctrl + C
```

Wenn der Container im Hintergrund läuft, zunächst ID prüfen:

```bash
docker ps
```

Dann stoppen:

```bash
docker stop <CONTAINER_ID>
```

---

## Typische Probleme

### Port belegt
Wenn `7071` schon verwendet wird:

```bash
docker run --rm -p 7072:7071 --env-file .env master-agent-api:local
```

Dann lautet die URL lokal:

```text
http://localhost:7072
```

### `.env` wird nicht gefunden
Prüfe, ob du den Befehl aus dem Projektordner startest und die Datei `.env` dort wirklich liegt.

### API startet, aber `/health` antwortet nicht
- prüfen, ob der Container noch läuft
- `docker logs <CONTAINER_ID>` ansehen
- lokalen Port prüfen

---

## Nächster Schritt

Wenn Docker lokal sauber läuft, ist der nächste sinnvolle Move:

1. internes / privates Deployment
2. Konfigurationshärtung
3. später Web-UI / Dashboard anschließen
