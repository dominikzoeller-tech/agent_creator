# Phase 113.1 - Gremium Save

Baut eine erste dry-run-only Session-Speicherung fuer Gremiumsfragen.

Kurz-Namen:

- Store: frontend/lib/cmt-save.ts
- API: /api/cmt/save
- UI: /cmt/save
- Patch: scripts/p113-1.cjs
- Verify: scripts/v113-1.cjs

Funktion:

- mehrere Fragen sammeln
- Session-Key setzen
- Verlauf wiederverwenden
- gespeicherte Session anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
