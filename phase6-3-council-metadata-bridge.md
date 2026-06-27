# Phase 6.3 – Council Routing Metadata Bridge

## Ziel

Phase 6.3 baut eine sichere Brücke zwischen der Routing-Analyse aus Phase 6.2 und der späteren Integration in `council-engine.ts`.

Diese Phase ist bewusst additiv:

- keine bestehende API-Datei wird automatisch verändert
- `council-engine.ts` bleibt unangetastet
- die Routing-Metadaten können isoliert getestet werden

---

## Neue Dateien

```text
council-routing-metadata.ts
council-routing-metadata-smoke-test.ts
scripts/add-council-routing-metadata-script.cjs
phase6-3-council-metadata-bridge.md
```

---

## Einrichtung

Im Projekt-Root:

```powershell
node scripts/add-council-routing-metadata-script.cjs
```

---

## Test

```powershell
npm run council:routing:metadata:test
```

Der Test gibt pro Beispiel aus:

- Route Suggestion
- Should Use Council
- Suggested Agents
- Summary
- Reason

---

## Warum diese Zwischenphase?

Eine direkte Änderung an `council-engine.ts` wäre riskanter, weil dort bereits produktive Routing-/Decision-Logik liegt.

Diese Bridge erlaubt zuerst zu prüfen, ob die neuen Routing-Metadaten stabil und sinnvoll sind.

---

## Nächster Schritt: Phase 6.4

Wenn dieser Smoke-Test funktioniert, kann Phase 6.4 die Integration in `council-engine.ts` vorbereiten:

1. `buildCouncilRoutingMetadata` importieren
2. Metadaten vor der Council-Entscheidung berechnen
3. Antwortobjekte um `routingDetails` und `suggestedAgents` erweitern
4. Logs / Analytics später um Agent-Auswertung erweitern
