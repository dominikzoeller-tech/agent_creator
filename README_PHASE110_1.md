# Phase 110.1 - Question Intake und Routing

Baut den ersten Frage-Intake fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-intake.ts
- API: /api/cmt/intake
- UI: /cmt/intake
- Patch: scripts/p110-1.cjs
- Verify: scripts/v110-1.cjs

Funktion:

- Frage entgegennehmen
- Thema klassifizieren
- Risiko einschaetzen
- passende Gremiumsrollen auswaehlen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
