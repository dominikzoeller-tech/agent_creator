# Phase 9.6 – Web Research Quality & Governance

## Ziel

Web Research soll nicht ungeprüft dauerhaft gespeichert werden. Phase 9.6 ergänzt Governance-Prüfungen vor Speicherung.

## Neue Seite

```text
http://localhost:3000/web-research-governance
```

## Neue API

```text
POST /api/web-research-governance
```

## Governance Checks

- fehlende Query
- fehlende oder sehr kurze Summary
- keine Treffer
- weniger als zwei eindeutige Quellen
- doppelte Quellen
- offensichtliche sensible Daten
- lokale Quellen wie localhost
- kein Speicherziel ausgewählt

## Integration

`POST /api/web-research-save` nutzt jetzt den Governance Check als Gate.

Wenn Errors vorhanden sind, wird Speicherung blockiert.

## Anwendung

```powershell
node scripts/phase9-6-patch-web-research-governance.cjs
npm run web:research:governance:verify
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
http://localhost:3000/web-research-governance
```

Erwartung:

- Governance Check zeigt Score, Allowed, Errors, Warnings und Infos.
- Doppelte Quellen werden dedupliziert.
- Speicherung über `/web-research-save` wird bei Governance Errors blockiert.

## Nächster Schritt

Phase 9.7 – Web Research Admin/Settings:

- Web Research Status anzeigen
- ENV-Konfiguration sichtbar machen ohne Secrets
- Toggle-Hinweise für Aktivierung
- Governance-Regeln dokumentieren
