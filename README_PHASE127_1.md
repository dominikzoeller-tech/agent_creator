# Phase 127.1 - Secure Master Main View Status

Baut eine Statusseite fuer die neue Hauptansicht /cmt/master/secure.

Kurz-Namen:

- Store: frontend/lib/cmt-master-main-status.ts
- API: /api/cmt/master/secure/main/status
- UI: /cmt/master/secure/main/status
- Patch: scripts/p127-1.cjs
- Verify: scripts/v127-1.cjs

Hauptseite:

- /cmt/master/secure

Statusseite:

- /cmt/master/secure/main/status

Status:

- lokal testbar
- Hauptseite nutzt Unified Flow
- lokale Antwort sichtbar
- Routing sichtbar
- Privacy Gate bei Bedarf sichtbar
- 5er-Gremium bei Bedarf sichtbar
- Safety State sichtbar
- Kontrollseiten bleiben erhalten
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
