# Phase 114.0 - Gremium MVP Demo

Baut den ersten kompletten MVP-Demo-Flow fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-demo.ts
- API: /api/cmt/demo
- UI: /cmt/demo
- Patch: scripts/p114-0.cjs
- Verify: scripts/v114-0.cjs

Funktion:

- User-Frage annehmen
- bestehende Summary nutzen
- Demo-Flow darstellen
- finale Empfehlung, Risiken und Aktionen anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
