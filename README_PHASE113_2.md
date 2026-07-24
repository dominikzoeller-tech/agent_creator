# Phase 113.2 - Gremium Summary

Baut die erste Zusammenfassung fuer gespeicherte Gremiums-Sessions.

Kurz-Namen:

- Store: frontend/lib/cmt-sum.ts
- API: /api/cmt/sum
- UI: /cmt/sum
- Patch: scripts/p113-2.cjs
- Verify: scripts/v113-2.cjs

Funktion:

- gespeicherte Session nutzen
- Entscheidungen sammeln
- Risiken deduplizieren
- Aktionen deduplizieren
- Kurzsummary anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
