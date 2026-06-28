# Web Research Activation Guide

## 1. `.env` konfigurieren

```env
WEB_RESEARCH_ENABLED=true
BING_SEARCH_API_KEY=DEIN_BING_SEARCH_API_KEY
BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/search
WEB_RESEARCH_GOVERNANCE_ENABLED=true
WEB_RESEARCH_SAFE_MODE=true
WEB_RESEARCH_SUMMARY_MODEL=
```

Optional kann `WEB_RESEARCH_SUMMARY_MODEL` leer bleiben. Dann wird `OPENAI_MODEL` oder `gpt-4.1-mini` verwendet.

## 2. Container neu starten

```powershell
npm run stack:down
npm run stack:up:detached
npm run stack:health
```

Wenn API/Frontend-Images neu gebaut werden sollen:

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api frontend
npm run stack:up:detached
npm run stack:health
```

## 3. Settings prüfen

```text
http://localhost:3000/web-research-settings
```

Erwartung:

- Web Research: aktiv
- Bing Search API Key: aktiv/vorhanden
- Governance: aktiv
- Safe Mode: aktiv

## 4. Chat testen

```text
Was ist aktuell zu Privacy-first AI Agents relevant? Bitte mit Web Research und Quellen.
```

## 5. Analytics prüfen

```text
http://localhost:3000/analytics
```

## 6. Smoke Test

```powershell
npm run web:research:smoke
```

## 7. Sicherheitscheck

```powershell
git ls-files .env
git status --short .env
```

Erwartung: keine Ausgabe.
