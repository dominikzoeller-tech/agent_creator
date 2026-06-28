# Phase 10.1 – Tool Permissions Matrix

## Ziel

Phase 10.0 zeigt Tools zentral. Phase 10.1 ergänzt eine Permissions Matrix nach Sensitivity und Processing Mode.

## Neue Seite

```text
http://localhost:3000/tool-permissions
```

## Neue API

```text
GET /api/tool-permissions?sensitivity=internal&processingMode=auto
```

## Regeln in dieser Phase

- deaktivierte Tools werden blockiert
- Tool-Sensitivity muss passen
- externe Netzwerktools sind nur für `public` erlaubt
- `local` blockiert externe Netzwerktools
- Web-Research-Schreibtools dürfen keine `confidential` Inhalte speichern
- Schreibtools erhalten Warnungen
- High-Risk-Tools erhalten Warnungen bei `auto`

## Anwendung

```powershell
node scripts/phase10-1-patch-tool-permissions.cjs
npm run tools:permissions:verify
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
http://localhost:3000/tool-permissions
```

Erwartung:

- Matrix ist sichtbar.
- Sensitivity und Processing Mode sind umschaltbar.
- Web Research ist bei internal/confidential blockiert.
- Web Research ist bei local blockiert.

## Nächster Schritt

Phase 10.2 – Tool Permission Preflight API:

- einzelnes Tool gegen aktuelle Anfrage prüfen
- später Agent Flow Integration
- Debug-Felder für erlaubte/blockierte Tools
