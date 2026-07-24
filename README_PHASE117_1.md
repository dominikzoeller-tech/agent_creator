# Phase 117.1 - Gremium Persist Status

Baut eine Statusseite fuer den dry-run-only Persistenz-Adapter.

Kurz-Namen:

- Store: frontend/lib/cmt-persist-status.ts
- API: /api/cmt/persist/status
- UI: /cmt/persist/status
- Patch: scripts/p117-1.cjs
- Verify: scripts/v117-1.cjs

Funktion:

- Persist Adapter wiederverwenden
- Status und Checks anzeigen
- preparedKey und itemCount anzeigen
- externe Speicherung weiterhin deaktiviert halten

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
