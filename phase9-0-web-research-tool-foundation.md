# Phase 9.0 – Web Research Tool Foundation

## Ziel

Der Agent soll später kontrolliert im Internet recherchieren können. Phase 9.0 legt dafür eine sichere Basis an.

## Wichtig

Web Research ist standardmäßig deaktiviert.

```env
WEB_RESEARCH_ENABLED=false
```

Echte Websuche wird erst aktiv mit:

```env
WEB_RESEARCH_ENABLED=true
BING_SEARCH_API_KEY=...
```

## Neue Seite

```text
http://localhost:3000/web-research
```

## Neue API

```text
GET  /api/web-research?q=...
POST /api/web-research
```

## Anwendung

```powershell
node scripts/phase9-0-patch-web-research-foundation.cjs
npm run web:research:verify
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
http://localhost:3000/web-research
```

Erwartung ohne API-Key:

- Seite ist sichtbar.
- Suche liefert keine echten Ergebnisse.
- Hinweis erscheint, dass Web Research deaktiviert oder noch nicht konfiguriert ist.

## Nächster Schritt

Phase 9.1 kann Web Research in den Agent Flow integrieren:

- nur bei Bedarf aktivieren
- Privacy Guard vor Websuche
- keine lokalen privaten Daten ungeprüft an Websuche senden
- Research-Ergebnisse im Debug anzeigen
