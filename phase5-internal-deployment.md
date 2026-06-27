# Phase 5 – Internes / privates Deployment

## Ziel

Frontend und Privacy-First API sollen **gemeinsam in einer kontrollierten, internen Umgebung** laufen.

## Empfohlene Minimal-Architektur

```text
[Browser im internen Netz]
          |
          v
http://<interner-host>:3000   -> Frontend (Next.js)
http://<interner-host>:7071   -> Privacy-First API (Node/TypeScript)
          |
          +--> public/internal    -> cloud_raw
          +--> confidential       -> cloud_redacted
          +--> restricted         -> local_policy
```

## Warum diese Architektur sinnvoll ist

- **einfach zu betreiben**
- **leichter zu debuggen**
- **Datenschutzlogik bleibt vollständig in der API**
- Frontend bleibt nur Darstellungsschicht
- später kann ein Reverse Proxy / interne Domain davor gesetzt werden

---

## Benötigte Bausteine

### 1. API-Container
- nutzt die vorhandene `Dockerfile` im Root
- liest `.env`
- startet `server.ts`

### 2. Frontend-Container
- nutzt `frontend/Dockerfile`
- baut und startet die Next.js UI
- ruft die API über `http://localhost:7071` auf

### 3. Docker Compose
- startet beide Container gemeinsam
- mappt Port `3000` für die UI
- mappt Port `7071` für die API

---

## Ports

### Standard
- Frontend: `3000`
- API: `7071`

### Interner Zugriff
- UI: `http://localhost:3000`
- API direkt: `http://localhost:7071`

Im internen Netz später z. B.:
- `http://192.168.x.x:3000`
- `http://192.168.x.x:7071`

---

## Wichtige Dateien

- `Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.internal.yml`
- `.env`
- `.env.example`
- `frontend/.env.local.example`

---

## Secrets / Umgebungsvariablen

### Root `.env`

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
PORT=7071
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_AGENT_API_BASE_URL=http://localhost:7071
```

---

## Startreihenfolge für internes Deployment

### Variante A – lokal mit Docker Compose

```bash
docker compose -f docker-compose.internal.yml up --build
```

Danach:

- UI: `http://localhost:3000`
- API: `http://localhost:7071`

---

## Sicherheitsregeln für deinen Fall

### Empfohlen
- API **nicht öffentlich** ins Internet hängen
- Zugriff nur intern / VPN / privates Netz
- `restricted` weiter lokal blockieren
- `confidential` nur redigiert durchlassen
- `.env` nie committen
- Exportdateien im `logs`-Ordner nur intern verfügbar machen

---

## Nächste sinnvolle Ausbaustufen nach Phase 5

1. Reverse Proxy / interne Domain
2. Basic Auth oder vorgeschalteter Login
3. optional Single Sign-On intern
4. später erst öffentliches Deployment prüfen
