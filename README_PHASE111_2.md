# Phase 111.2 - Gremium Brief

Baut die verdichtete Nutzerantwort fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-brief.ts
- API: /api/cmt/brief
- UI: /cmt/brief
- Patch: scripts/p111-2.cjs
- Verify: scripts/v111-2.cjs

Funktion:

- Gremium-Ergebnis nutzen
- kurze Nutzerantwort erzeugen
- Entscheidung, Begruendung, Risiken und Aktionen anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
