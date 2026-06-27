# Phase 6.9 – Cleanup, README/Changelog und Release-Tag

## Ziel

Phase 6.9 schließt den Agenten-Routing-/Analytics-Meilenstein sauber ab.

## Schritt 1 – Arbeitsbaum prüfen

```powershell
git status --short
```

Wenn noch alte Hilfsscripts offen sind, entweder committen oder löschen.

## Schritt 2 – Preflight Script eintragen

```powershell
node scripts/add-phase6-9-release-preflight-script.cjs
npm run phase6:release:preflight
```

## Schritt 3 – README aktualisieren

```powershell
node scripts/update-readme-phase6-agent-routing.cjs
```

Danach prüfen:

```powershell
git diff README.md
```

## Schritt 4 – Changelog übernehmen

Die Datei `CHANGELOG-phase6-9-entry.md` enthält die empfohlene Changelog-Ergänzung.

Optional in `CHANGELOG.md` übernehmen oder separat committen.

## Schritt 5 – Finaler Stack-Test

```powershell
npm run stack:down
npm run stack:up:detached
npm run stack:health
```

Browser prüfen:

```text
http://localhost:3000
http://localhost:3000/analytics
```

## Schritt 6 – Commit

Beispiel:

```powershell
git add README.md README-phase6-agent-routing-section.md CHANGELOG-phase6-9-entry.md phase6-9-release-guide.md
git add scripts/add-phase6-9-release-preflight-script.cjs scripts/phase6-9-release-preflight.cjs scripts/update-readme-phase6-agent-routing.cjs
git add package.json
git commit -m "docs: finalize phase 6 agent routing analytics release"
git push origin main
```

## Schritt 7 – Release-Tag setzen

Erst wenn `git status --short` leer ist:

```powershell
git tag v0.4.0-agent-routing-analytics
git push origin v0.4.0-agent-routing-analytics
```

## Schritt 8 – Abschluss prüfen

```powershell
git status --short
git tag --list
```

Erwartung:

```text
v0.4.0-agent-routing-analytics
```
