# Phase 10.0 – Tool Registry Foundation

## Ziel

Nach Phase 9 ist Web Research als Tool-Familie vorhanden. Phase 10.0 startet jetzt eine zentrale Tool Registry.

## Neue Seite

```text
http://localhost:3000/tools
```

## Neue API

```text
GET /api/tools
```

## Funktionen

- zentrale Übersicht aller Agent-Tools
- Kategorien: core, knowledge, memory, web-research, analytics, system
- Anzeige von Risiko-Level
- Anzeige, ob Tool externe Netzwerke nutzt
- Anzeige, ob Tool Secrets benötigt
- Anzeige, ob Tool Daten schreibt
- Governance-Hinweise pro Tool

## Anwendung

```powershell
node scripts/phase10-0-patch-tool-registry.cjs
npm run tools:registry:verify
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
http://localhost:3000/tools
```

Erwartung:

- Tool Registry ist sichtbar.
- Web Research Tools sind als high risk sichtbar.
- Knowledge/Memory/System/Analytics Tools sind ebenfalls sichtbar.

## Nächster Schritt

Phase 10.1 – Tool Permissions Matrix:

- erlaubte Tools je Sensitivity
- erlaubte Tools je Processing Mode
- Blockierlogik dokumentieren
- später Integration in Agent Flow
