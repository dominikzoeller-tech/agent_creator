# Web Research Hardening Runbook

## Ziel

Dieses Runbook beschreibt die Absicherung der Web-Research-Funktionen.

## Grundsatz

Web Research darf nur öffentliche, nicht-sensitive Inhalte verarbeiten. Secrets dürfen weder in Requests noch in Responses, Logs oder Screenshots auftauchen.

## API-Key-Regeln

- `.env` niemals committen
- API-Key nach versehentlicher Veröffentlichung sofort rotieren
- Settings-Seite zeigt nur boolesche Statusfelder, keine Werte
- Screenshots von `docker compose config` vermeiden, wenn Secrets geladen sind

## Smoke Test

Nach Änderungen an Web Research ausführen:

```powershell
npm run web:research:hardening:verify
npm run web:research:smoke
```

## Governance

Die Governance blockiert Speicherung bei Fehlern:

- fehlende Query
- sensitive Daten
- kein Speicherziel

Warnings blockieren nicht zwingend, sollten aber vor Speicherung geprüft werden:

- fehlende oder kurze Summary
- weniger als zwei Quellen
- keine Treffer
- lokale oder ungültige Quellen

## Release Check

Vor Commit/Push:

```powershell
git status --short
git diff -- .env
git ls-files .env
npm run web:research:hardening:verify
npm run web:research:smoke
```

Erwartung:

- `.env` ist nicht getrackt
- Smoke Test ist grün
- keine Secret-Werte in geänderten Dateien
