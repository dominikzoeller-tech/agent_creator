# Phase 121.0 - Privacy Gate MVP

Baut ein lokales Datenschutz-Gate mit Freigabe- und Anonymisierungsentscheidung.

Kurz-Namen:

- Store: frontend/lib/cmt-privacy-gate.ts
- API: /api/cmt/privacy
- UI: /cmt/privacy
- Patch: scripts/p121-0.cjs
- Verify: scripts/v121-0.cjs

Funktion:

- interne, personenbezogene, geschaeftliche und geheime Signale erkennen
- Entscheidung treffen: local only, anonymisieren, Freigabe erforderlich oder extern blockieren
- anonymisierte Vorschau anzeigen
- externe Weitergabe immer blockiert halten

Status:

- lokal testbar
- kein Provider
- kein Internet
- kein Live-Modell
- externalSharingAllowed = false
