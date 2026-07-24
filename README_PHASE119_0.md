# Phase 119.0 - Gremium Ask MVP

Baut den ersten wirklich lokal testbaren Ask-Flow fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-ask.ts
- API: /api/cmt/ask
- UI: /cmt/ask
- Patch: scripts/p119-0.cjs
- Verify: scripts/v119-0.cjs

Funktion:

- echte Nutzerfrage annehmen
- lokale Gremiumsrollen antworten lassen
- finale Empfehlung, Begruendung, Risiken und naechste Aktionen anzeigen
- klar kennzeichnen: lokal testbar, noch nicht live mit KI-Modell

## Testzeitpunkt

Nach gruenem Build ist der Agent erstmals lokal testbar.

Oeffne:

- /cmt/ask

Noch nicht live schalten. Provider bleibt deaktiviert.
