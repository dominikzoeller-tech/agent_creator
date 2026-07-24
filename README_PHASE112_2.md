# Phase 112.2 - Gremium View

Baut die Ergebnis-Panels fuer die Gremium-UI.

Kurz-Namen:

- Store: frontend/lib/cmt-view.ts
- API: /api/cmt/view
- UI: /cmt/view
- Patch: scripts/p112-2.cjs
- Verify: scripts/v112-2.cjs

Funktion:

- Frage eingeben
- Ergebnis per lokaler API erzeugen
- Antwort, Entscheidung, Rollen, Risiken und Aktionen als Panels anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
