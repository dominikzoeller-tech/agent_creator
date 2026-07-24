# Phase 112.1 - Gremium Run

Baut den ersten Button-Flow fuer die Gremium-UI.

Kurz-Namen:

- Store: frontend/lib/cmt-run.ts
- API: /api/cmt/run
- UI: /cmt/run
- Patch: scripts/p112-1.cjs
- Verify: scripts/v112-1.cjs

Funktion:

- Frage im UI eingeben
- Frage per Button an lokale API senden
- Gremium-Ergebnis anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
