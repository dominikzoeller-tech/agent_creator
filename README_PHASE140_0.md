# Phase 140.0 - Secure Master Main Log List Manual JSON Apply Browser Load

Bereitet das Laden manuell angewendeter Import-Payloads aus dem Browser-Speicher fuer die Haupt-Logliste vor.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load.ts
- API: /api/cmt/master/secure/main/log/list/manual-apply-browser-load
- UI: /cmt/master/secure/main/log/list/manual-apply-browser-load
- Patch: scripts/p140-0.cjs
- Verify: scripts/v140-0.cjs

Wirkung:

- Haupt-Logliste kann Manual-Apply-Payloads aus localStorage lesen.
- Quelle manual_json_import_apply wird erkannt.
- Source Label ist vorbereitet.
- Browser-Read ist vorbereitet.
- Load Button ist sichtbar.
- Kein automatischer Import.
- Keine externe Weitergabe.
- Server-Persistenz bleibt false.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- mainLogListManualApplyBrowserLoadPrepared = true
- readsManualApplyPayloadFromBrowser = true
- manualApplySourceRecognized = true
- sourceLabelVisible = true
- loadButtonVisible = true
- browserReadPrepared = true
- applyImportAutomatically = false
- persistedInBrowser = browser_optional_local_after_manual_apply
- persistedOnServer = false
- serverStoragePrepared = false
- externalSharingAllowed = false
