# Phase 7.8 – Knowledge Quality Checks

## Ziel

Die Knowledge Base soll langfristig sauber bleiben. Phase 7.8 ergänzt Qualitätsprüfungen für lokale Knowledge-Dateien.

## Prüfungen

- leere Dateien
- fehlende Markdown-H1-Überschrift
- fehlende `Tags:` Zeile
- sehr kurze Dateien
- sehr lange Dateien
- doppelte Titel
- ähnliche Inhalte

## Neue Seite

```text
http://localhost:3000/knowledge-quality
```

## Neue API

```text
GET /api/knowledge-quality
```

## Anwendung

```powershell
node scripts/add-phase7-8-knowledge-quality-patch-script.cjs
npm run knowledge:quality:patch
npm run knowledge:quality:verify
```

## Stack-Test

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache
npm run stack:up:detached
npm run stack:health
```

## Nächster Schritt

Phase 7.9 kann die Suche verbessern:

- Titel stärker gewichten
- Tags stärker gewichten
- Stopwords entfernen
- bessere Snippets erstellen
- Mindestscore optimieren
