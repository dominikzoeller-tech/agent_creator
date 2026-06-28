# Phase 11.0b – Fix ServerResponse JSON HardBlock

## Problem

Der API-Container crasht mit:

```text
server.ts(277,16): error TS2339: Property 'json' does not exist on type 'ServerResponse<IncomingMessage>'.
```

Ursache: Der Phase-11.0-HardBlock wurde versehentlich im Express-Stil geschrieben:

```ts
return res.json(...)
```

Der Server verwendet aber Node `ServerResponse`, daher muss JSON manuell geschrieben werden.

## Fix

Der Hotfix ersetzt den HardBlock durch:

```ts
res.writeHead(200, { "Content-Type": "application/json" });
res.end(JSON.stringify(payload));
return;
```

## Anwendung

```powershell
node scripts/phase11-0b-fix-serverresponse-json-hardblock.cjs
node scripts/phase11-0b-verify-serverresponse-json-hardblock.cjs
```

Danach API + Frontend neu bauen:

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api frontend
docker compose -f docker-compose.internal.yml up -d
docker compose -f docker-compose.internal.yml ps
npm run stack:health
```
