# Phase 6.5 – Council Engine Integration Inspector

## Ziel

Phase 6.5 bereitet die echte Integration in `council-engine.ts` vor, ohne die produktive Council-Datei automatisch zu verändern.

Warum dieser Zwischenschritt?

`council-engine.ts` ist zentrale Produktivlogik. Bevor ein automatischer Patch sinnvoll ist, müssen die tatsächlichen Funktions- und Return-Strukturen geprüft werden.

---

## Neue Dateien

```text
council-routing-response-types.ts
scripts/phase6-5-inspect-council-engine.cjs
scripts/add-phase6-5-inspector-script.cjs
phase6-5-council-engine-integration-guide.md
phase6-5-patch-template.md
```

---

## Einrichtung

```powershell
node scripts/add-phase6-5-inspector-script.cjs
```

---

## Inspector ausführen

```powershell
npm run phase6:council:inspect
```

Der Inspector zeigt:

- mögliche Export-/Funktionszeilen
- mögliche Return-Objekte
- vorhandene Felder wie `route`, `recommendation`, `firstStep`, `confidence`
- ob Routing-Metadaten bereits integriert sind

---

## Danach

Die Ausgabe des Inspectors ist die Grundlage für Phase 6.6.

Phase 6.6 kann dann gezielt und additiv patchen:

- Import `buildCouncilRoutingMetadata`
- Import `attachCouncilRoutingMetadata`
- Berechnung von Routing-Metadaten am passenden Einstiegspunkt
- Ergänzung der Rückgabe um:
  - `suggestedAgents`
  - `routingDetails`
  - `routingSummary`

---

## Test nach Phase 6.5

```powershell
npm run phase6:council:inspect
```

Danach committen, wenn die Ausgabe plausibel ist.
