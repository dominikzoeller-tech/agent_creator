# Phase 6.7 – Routing-Metadaten in API/Debug sichtbar machen

## Ziel

Die in Phase 6.6 ergänzten Felder sollen im Frontend sichtbar werden:

- `suggestedAgents`
- `routingDetails`
- `routingSummary`

## Neue Datei

```text
frontend/components/RoutingMetadataPanel.tsx
```

## Geänderte Dateien

```text
frontend/lib/types.ts
frontend/app/page.tsx
```

## Verhalten

- `includeCouncilResult` ist auf der Chat-Seite standardmäßig aktiv.
- Ein neues Panel `Routing-Metadaten` zeigt Agenten, Route, Komplexität, Privacy-Risiko und Reason.
- Das bestehende Admin-/Debug-JSON bleibt erhalten und zeigt weiterhin die rohe API-Antwort.

## Test

```powershell
npm run stack:down
npm run stack:up:detached
npm run stack:health
```

Dann Browser öffnen:

```text
http://localhost:3000
```

Beispielanfrage:

```text
Soll ich die Council-Logik oder das Frontend als nächstes ausbauen? Bitte mit Risiken und erstem Schritt.
```

Erwartung:

- Antwort wird angezeigt
- Routing-Metadaten-Panel zeigt suggested agents / route / reason
- Debug JSON enthält die entsprechenden Felder, sofern die API sie liefert
