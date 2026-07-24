# Phase 121.2 - Privacy Gate Decision Flow

Baut eine lokale Freigabe-Auswahl fuer das Privacy Gate.

Kurz-Namen:

- Store: frontend/lib/cmt-privacy-decision.ts
- API: /api/cmt/privacy/decision
- UI: /cmt/privacy/decision
- Patch: scripts/p121-2.cjs
- Verify: scripts/v121-2.cjs

Optionen:

- local_only
- anonymize_then_send
- approve_external_send
- cancel

Wichtig:

approve_external_send bleibt blockiert.
externalSharingAllowed bleibt false.
providerDispatchAllowed bleibt false.
networkCallAllowed bleibt false.

Status:

- lokal testbar
- Freigabe-Flow vorbereitet
- keine echte externe Weitergabe
- kein Provider
- kein Internet
- kein Live-Modell
