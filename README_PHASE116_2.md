# Phase 116.2 - Gremium App Entry

Baut den App-Einstieg fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-app-entry.ts
- API: /api/cmt/app-entry
- UI: /cmt/app-entry
- Patch: scripts/p116-2.cjs
- Verify: scripts/v116-2.cjs

Funktion:

- App-Einstieg fuer den Gremium-Agenten bereitstellen
- Home Entry wiederverwenden
- zentrale MVP-Routen anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
