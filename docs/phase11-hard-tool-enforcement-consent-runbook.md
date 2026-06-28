# Phase 11.0 Hard Tool Enforcement & Consent Flow Runbook

## Ziel

Phase 11.0 aktiviert den ersten harten Enforcement-Gate im Agent Flow und ergänzt ein Consent-orientiertes UI-Panel.

## Sicherheitsstandard

Der sichere Default bleibt:

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=false
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=true
```

Harte Blockade greift nur, wenn explizit gesetzt wird:

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=true
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=false
```

## Consent Flag

```env
TOOL_PERMISSION_REQUIRE_EXPLICIT_CONSENT=true
```

In Phase 11.0 ist dieser Flag primär für UI/Debug/Policy-Messaging vorbereitet. Persistente User-Consent-Ausführung folgt später.

## Rollback

Sofortige Rückkehr zu Beobachtungsmodus:

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=false
```

Danach:

```powershell
npm run stack:down
npm run stack:up:detached
npm run stack:health
```

## Test

```powershell
npm run tools:enforcement:hard:verify
```

Dann API und Frontend neu bauen:

```powershell
docker compose -f docker-compose.internal.yml build --no-cache api frontend
docker compose -f docker-compose.internal.yml up -d
npm run stack:health
```
