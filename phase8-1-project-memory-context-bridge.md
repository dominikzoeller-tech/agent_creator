# Phase 8.1 – Project Memory Context Bridge

## Ziel

Phase 8.0 hat das Project Memory angelegt. Phase 8.1 macht diese Memory-Einträge als Kontext für den Agenten nutzbar.

Diese Phase ist bewusst additiv:

- `server.ts` wird noch nicht verändert.
- Der echte Agent Flow bleibt unangetastet.
- Die Memory-Bridge kann separat getestet werden.

## Neue Dateien

```text
project-memory-context.ts
project-memory-context-smoke-test.ts
scripts/add-phase8-1-project-memory-context-script.cjs
scripts/phase8-1-verify-project-memory-context.cjs
scripts/add-phase8-1-project-memory-context-verify-script.cjs
phase8-1-project-memory-context-bridge.md
```

## Was die Bridge macht

```ts
const memory = await buildProjectMemoryContext(userInput, { limit: 5 });
const effectiveContext = mergeProjectMemoryContext(context, memory);
```

Daraus entstehen Kontextzeilen wie:

```text
Lokaler Project-Memory-Kontext:
Project Memory 1: [milestone] Phase 7 Knowledge Layer abgeschlossen | ...
```

## Anwendung

```powershell
node scripts/add-phase8-1-project-memory-context-script.cjs
node scripts/add-phase8-1-project-memory-context-verify-script.cjs
npm run memory:context:verify
npm run memory:context:smoke
```

## Nächster Schritt

Phase 8.2 integriert diese Bridge in den echten Agent Flow:

1. `buildProjectMemoryContext(effectiveUserInput)` in `server.ts` ausführen
2. `mergeProjectMemoryContext(effectiveContext, memory)` nutzen
3. Memory-Hits später in Debug/Frontend sichtbar machen
4. Memory später in Logs/Analytics aufnehmen
