# Phase 111.0 - User Frage Session

Baut die erste User-Frage-Session fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-session.ts
- API: /api/cmt/session
- UI: /cmt/session
- Patch: scripts/p111-0.cjs
- Verify: scripts/v111-0.cjs

Funktion:

- User-Frage als Session erfassen
- Session-ID setzen
- bestehende Gremium-Deliberation nutzen
- Empfehlung und naechste Schritte anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
