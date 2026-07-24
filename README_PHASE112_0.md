# Phase 112.0 - Gremium Ask UI

Baut die erste echte Eingabe-UI fuer Nutzerfragen an das Gremium.

Kurz-Namen:

- Store: frontend/lib/cmt-ask.ts
- API: /api/cmt/ask
- UI: /cmt/ask
- Patch: scripts/p112-0.cjs
- Verify: scripts/v112-0.cjs

Funktion:

- Frage im UI eingeben
- Gremium-Brief live dry-run-only berechnen
- Kurzantwort, Risiken und Aktionen anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
