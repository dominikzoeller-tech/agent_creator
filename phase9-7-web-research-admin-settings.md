# Phase 9.7 – Web Research Admin/Settings

## Ziel

Web Research soll administrativ sichtbar und besser erklärbar werden, ohne Secrets offenzulegen.

## Neue Seite

```text
http://localhost:3000/web-research-settings
```

## Neue API

```text
GET /api/web-research-settings
```

## Funktionen

- Web Research Status anzeigen
- Bing Search Konfiguration anzeigen, ohne API-Key offenzulegen
- OpenAI Summary Status anzeigen, ohne API-Key offenzulegen
- Summary-Modell anzeigen
- Governance/Safe-Mode Status anzeigen
- Aktivierung über `.env` dokumentieren
- Governance-Regeln sichtbar dokumentieren

## Neue `.env.example` Werte

```env
WEB_RESEARCH_GOVERNANCE_ENABLED=true
WEB_RESEARCH_SAFE_MODE=true
WEB_RESEARCH_SUMMARY_MODEL=
```

## Anwendung

```powershell
node scripts/phase9-7-patch-web-research-settings.cjs
npm run web:research:settings:verify
```

## Danach neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache frontend
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

```text
http://localhost:3000/web-research-settings
```

Erwartung:

- Status-Kacheln sind sichtbar.
- API-Keys werden nicht angezeigt.
- Hinweise erklären, was für echte Websuche noch fehlt.
- Governance-Regeln sind dokumentiert.

## Nächster Schritt

Phase 9.8 – Web Research Regression & Hardening:

- Testmatrix erweitern
- Smoke-Test für Settings/Governance/Save
- Fehlerfälle prüfen
- Release-Doku aktualisieren
