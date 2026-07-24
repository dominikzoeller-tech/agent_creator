# Phase 118.0 - Gremium Local JSON Plan

Bereitet Local JSON Persistenz fuer Gremiums-Sessions vor, weiterhin dry-run-only.

Kurz-Namen:

- Store: frontend/lib/cmt-json.ts
- API: /api/cmt/json
- UI: /cmt/json
- Patch: scripts/p118-0.cjs
- Verify: scripts/v118-0.cjs

Funktion:

- Persist Guide und Persist Adapter wiederverwenden
- Local JSON Ziel planen
- Dateiname, Zielordner und Payload anzeigen
- echte Datei-Schreibvorgaenge deaktiviert halten

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-/Storage-Calls.
