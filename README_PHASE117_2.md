# Phase 117.2 - Gremium Persist Guide

Baut einen Guide fuer den dry-run-only Persistenz-Adapter.

Kurz-Namen:

- Store: frontend/lib/cmt-persist-guide.ts
- API: /api/cmt/persist/guide
- UI: /cmt/persist/guide
- Patch: scripts/p117-2.cjs
- Verify: scripts/v117-2.cjs

Funktion:

- Persist Status wiederverwenden
- Schritte zum Persistenz-Ausbau anzeigen
- naechste Adapter-Ziele vorschlagen
- blockierte Felder fuer Safety anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
