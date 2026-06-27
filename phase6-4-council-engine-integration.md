# Phase 6.4 – Council Engine Integration vorbereiten

## Ziel

Phase 6.4 bereitet die echte Integration der neuen Agent-Routing-Metadaten in `council-engine.ts` vor.

Wichtig: Diese Phase verändert `council-engine.ts` noch nicht automatisch. Stattdessen prüft diese Phase, ob alle Bausteine vorhanden sind und definiert den sicheren Integrationspunkt.

---

## Ausgangslage

Phase 6.1 hat eingeführt:

```text
agent-capabilities.ts
agent-capabilities-smoke-test.ts
```

Phase 6.2 hat eingeführt:

```text
agent-routing-details.ts
agent-routing-smoke-test.ts
```

Phase 6.3 hat eingeführt:

```text
council-routing-metadata.ts
council-routing-metadata-smoke-test.ts
```

Phase 6.4 prüft jetzt, ob diese Dateien vorhanden sind und ob `council-engine.ts` bereit für die Integration ist.

---

## Zielbild der späteren Integration

`council-engine.ts` soll später:

1. `buildCouncilRoutingMetadata` importieren
2. für jede Anfrage Routing-Metadaten berechnen
3. `suggestedAgents` in die Council-Antwort aufnehmen
4. `routingDetails` in strukturierte JSON-Antworten aufnehmen
5. optional später Decision Logs erweitern

Beispiel-Import:

```ts
import { buildCouncilRoutingMetadata } from "./council-routing-metadata";
```

Beispiel-Nutzung:

```ts
const routingMetadata = buildCouncilRoutingMetadata({
  userInput,
  sensitivity,
  processingMode,
  includeCouncilResult,
});
```

Beispiel-Erweiterung einer Antwort:

```ts
return {
  ...existingResult,
  suggestedAgents: routingMetadata.suggestedAgents,
  routingDetails: routingMetadata.routingDetails,
};
```

---

## Warum noch nicht automatisch patchen?

`council-engine.ts` enthält produktive Routing- und Decision-Logik.

Eine automatische Text-Ersetzung ohne genaue aktuelle Struktur kann unnötig riskant sein. Deshalb macht Phase 6.4 zuerst einen Preflight-Check.

---

## Nächster Schritt nach erfolgreichem Preflight

Phase 6.5 kann dann gezielt `council-engine.ts` erweitern.
