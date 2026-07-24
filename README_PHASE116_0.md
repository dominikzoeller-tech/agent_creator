# Phase 116.0 - Gremium Main Navigation

Integriert die MVP-Navigation fuer den Gremium-Agenten als eigene Navigationsseite.

Kurz-Namen:

- Store: frontend/lib/cmt-nav.ts
- API: /api/cmt/nav
- UI: /cmt/nav
- Patch: scripts/p116-0.cjs
- Verify: scripts/v116-0.cjs

Funktion:

- zentrale Navigation fuer Landing, Demo, Report, Share, Guide und Status
- Landing-Daten wiederverwenden
- MVP-Einstieg fuer die Haupt-App vorbereiten

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
