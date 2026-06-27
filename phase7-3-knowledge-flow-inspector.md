# Phase 7.3 – Knowledge Base in echten Agent Flow integrieren vorbereiten

## Ziel

Phase 7.2 hat eine Context-Bridge gebaut:

```ts
buildKnowledgeRoutingContext(userInput)
mergeKnowledgeContext(context, knowledge)
```

Phase 7.3 findet jetzt den exakten sicheren Integrationspunkt im produktiven Agent Flow.

## Warum erst Inspector?

Der echte Flow kann je nach Anfrage über mehrere Dateien laufen:

- `server.ts`
- `master-agent.ts`
- `council-engine.ts`
- `agent-response.ts`

Ein Blind-Patch kann leicht Kontext doppelt einfügen oder eine Rückgabestruktur beschädigen. Deshalb inspiziert Phase 7.3 zuerst die tatsächliche Struktur.

## Neue Dateien

```text
scripts/phase7-3-inspect-knowledge-flow.cjs
scripts/add-phase7-3-knowledge-flow-inspect-script.cjs
phase7-3-knowledge-flow-inspector.md
phase7-3-integration-target.md
```

## Anwendung

```powershell
node scripts/add-phase7-3-knowledge-flow-inspect-script.cjs
npm run knowledge:flow:inspect
```

## Danach

Die Ausgabe zu `master-agent.ts` und `server.ts` in den Chat kopieren.

Danach kann Phase 7.3b gezielt patchen:

1. `buildKnowledgeRoutingContext` importieren
2. `mergeKnowledgeContext` importieren
3. Knowledge-Kontext vor Council-/Direct-Entscheidung berechnen
4. bestehenden Kontext additiv erweitern
5. Response optional um Knowledge-Metadaten ergänzen
