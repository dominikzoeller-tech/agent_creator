# Phase 117.0 - Gremium Persist Adapter

Bereitet einen dry-run-only Persistenz-Adapter fuer Gremiums-Sessions vor.

Kurz-Namen:

- Store: frontend/lib/cmt-persist.ts
- API: /api/cmt/persist
- UI: /cmt/persist
- Patch: scripts/p117-0.cjs
- Verify: scripts/v117-0.cjs

Funktion:

- Session-Speicherung wiederverwenden
- Adapter-Status ausgeben
- Persistenz-Key und Item-Count vorbereiten
- externe Speicherung noch deaktiviert halten

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
