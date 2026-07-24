# Phase 118.2 - Gremium Local JSON Guide

Baut einen Guide fuer den Local JSON Persistenz-Plan.

Kurz-Namen:

- Store: frontend/lib/cmt-json-guide.ts
- API: /api/cmt/json/guide
- UI: /cmt/json/guide
- Patch: scripts/p118-2.cjs
- Verify: scripts/v118-2.cjs

Funktion:

- Local JSON Status wiederverwenden
- Ausbau-Schritte anzeigen
- geplante Dateien anzeigen
- blockierte Felder fuer Safety anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
