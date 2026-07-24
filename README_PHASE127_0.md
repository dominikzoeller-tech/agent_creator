# Phase 127.0 - Secure Master Main Unified View

Baut den Unified Flow als echte Hauptansicht in /cmt/master/secure ein.

Kurz-Namen:

- UI: /cmt/master/secure
- nutzt API: /api/cmt/master/secure/unified
- nutzt Store: frontend/lib/cmt-master-unified.ts
- Patch: scripts/p127-0.cjs
- Verify: scripts/v127-0.cjs

Wirkung:

- /cmt/master/secure zeigt jetzt direkt den Unified Flow.
- Nutzer muss /cmt/master/secure/unified nicht mehr separat öffnen.
- Kontrollseiten bleiben erhalten.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- lokal testbar
- Hauptseite nutzt Unified Flow
- Quality-Antwort sichtbar
- Gremium bei Bedarf sichtbar
- Privacy Gate bei Bedarf sichtbar
- externalSharingAllowed = false
