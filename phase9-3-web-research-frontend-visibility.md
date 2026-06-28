# Phase 9.3 – Web Research Frontend Visibility

## Ziel

Phase 9.1 und 9.2 liefern Web Research Metadaten im Debug JSON. Phase 9.3 macht diese Informationen im Chat-Frontend sichtbar.

## Neues Panel

```text
frontend/components/WebResearchPanel.tsx
```

Das Panel zeigt:

- Web Research aktiviert ja/nein
- Web Research genutzt ja/nein
- AI Summary genutzt ja/nein
- Query
- Statusmeldungen
- Web Research Treffer
- AI Research Summary
- anklickbare Quellenliste

## Anwendung

```powershell
node scripts/phase9-3-patch-web-research-visibility.cjs
npm run web:research:visibility:verify
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
http://localhost:3000
```

Frage mit Debug JSON:

```text
Was ist aktuell zu Privacy-first AI Agents relevant?
```

Erwartung:

- Panel `Web Research` ist sichtbar.
- Bei deaktivierter Websuche zeigt das Panel Statusinformationen und keine Treffer.
- Bei aktivierter Websuche erscheinen Treffer, AI Summary und Quellen.

## Nächster Schritt

Phase 9.4 – Web Research Analytics:

- Nutzung zählen
- Top Research Queries
- Top Sources
- Summary-Erfolgsquote
