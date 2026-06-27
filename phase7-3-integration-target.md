# Phase 7.3b Zielbild – Knowledge Flow Patch

## Minimaler Zielzustand

Der spätere Patch soll sinngemäß so aussehen:

```ts
const knowledge = await buildKnowledgeRoutingContext(userInput, { limit: 3 });
const effectiveContext = mergeKnowledgeContext(context, knowledge);
```

Danach wird `effectiveContext` statt `context` in den bisherigen Agent-/Council-Pfad gegeben.

## Optionales Response-Metadata-Ziel

Später kann die API-Antwort zusätzliche Felder enthalten:

```ts
knowledgeSummary: knowledge.summary,
knowledgeHits: knowledge.hits,
usedKnowledge: knowledge.hasHits,
```

## Wichtige Regel

Nur additiv erweitern:

- keine alte Response-Struktur entfernen
- keine bestehenden Routing-Felder entfernen
- keine Cloud-/Privacy-Policy umgehen
- keine Knowledge-Dateien automatisch an externe Dienste senden
