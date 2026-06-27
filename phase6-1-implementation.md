# Phase 6.1 – Agent Capability Registry Implementation

## Enthaltene Dateien

```text
agent-capabilities.ts
agent-capabilities-smoke-test.ts
scripts/add-agent-capability-script.cjs
phase6-1-implementation.md
```

## Einrichtung

Im Projekt-Root ausführen:

```powershell
node scripts/add-agent-capability-script.cjs
```

Danach testen:

```powershell
npm run agent:capabilities:test
```

## Ziel

Die Registry stellt erstmal regelbasiert fest, welche Spezialagenten für eine Nutzeranfrage relevant sind.

## Nächster Integrationsschritt

Phase 6.2:

- `council-engine.ts` importiert `suggestAgentCapabilities`
- Council-Entscheidungen erhalten `suggestedAgents`
- Decision Logs speichern vorgeschlagene Agenten
- Frontend zeigt später Agent-Badges an
