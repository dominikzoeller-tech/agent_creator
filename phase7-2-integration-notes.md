# Phase 7.3 Vorschau – Integration in Agent Flow

## Minimaler Zielzustand

Später soll der Agent vor einer Antwort lokale Knowledge-Treffer suchen:

```ts
const knowledge = await buildKnowledgeRoutingContext(userInput, { limit: 3 });
const effectiveContext = mergeKnowledgeContext(context, knowledge);
```

Dann wird `effectiveContext` an den bestehenden Agenten-/Council-Fluss übergeben.

## Warum noch kein direkter Patch?

Der produktive Flow liegt je nach Pfad in:

```text
server.ts
master-agent.ts
council-engine.ts
```

Damit keine bestehende API-Struktur kaputtgeht, wird Phase 7.2 erst isoliert getestet.

## Empfohlene nächste Integration

1. Inspector für `master-agent.ts` erstellen
2. exakten Kontext-Übergabepunkt finden
3. knowledge context additiv einfügen
4. Smoke-Test und Stack-Health laufen lassen
