# Phase 10.2 – Tool Permission Preflight API

## Ziel

Phase 10.1 erstellt eine Matrix. Phase 10.2 ergänzt einen Preflight für einzelne Tool-Nutzung.

## Neue Seite

```text
http://localhost:3000/tool-preflight
```

## Neue API

```text
GET  /api/tool-preflight?toolId=web-research&sensitivity=internal&processingMode=auto
POST /api/tool-preflight
```

## Funktionen

- einzelnes Tool prüfen
- Sensitivity und Processing Mode anwenden
- Sensitive Daten im User Input erkennen
- externe Netzwerktools bei sensiblen Daten blockieren
- Confirmation Requirement liefern
- JSON für spätere Agent-Flow-Integration liefern

## Beispiel Response

```json
{
  "toolId": "web-research",
  "allowed": false,
  "reasons": [
    "Sensitivity internal ist für dieses Tool nicht erlaubt.",
    "Externe Netzwerktools sind nur für public Sensitivity erlaubt."
  ],
  "warnings": [
    "High-Risk-Tool sollte bei auto Mode transparent im Debug/Frontend angezeigt werden."
  ]
}
```

## Anwendung

```powershell
node scripts/phase10-2-patch-tool-preflight.cjs
npm run tools:preflight:verify
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
http://localhost:3000/tool-preflight
```

Erwartung:

- `web-research` mit `internal` wird blockiert.
- `web-research` mit `public` kann erlaubt sein, wenn Tool aktiviert ist.
- User Input mit API-Key/Secret blockiert externe Netzwerktools.

## Nächster Schritt

Phase 10.3 – Tool Preflight in Agent Debug:

- erlaubte/blockierte Tools in Chat Debug sichtbar machen
- Preflight für automatisch erkannte Tools anzeigen
- noch ohne harte Agent-Flow-Blockade
