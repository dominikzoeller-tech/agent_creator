# Phase 6.2 – Council Routing Upgrade Implementation

## Ziel

Phase 6.2 ergänzt eine eigenständige Routing-Analyse für Council-Entscheidungen.

Diese Umsetzung verändert bestehende API- oder Council-Dateien noch nicht automatisch. Sie ist bewusst additiv und sicher.

## Neue Dateien

```text
agent-routing-details.ts
agent-routing-smoke-test.ts
scripts/add-agent-routing-script.cjs
phase6-2-implementation.md
```

## Einrichtung

Im Projekt-Root:

```powershell
node scripts/add-agent-routing-script.cjs
```

## Test

```powershell
npm run agent:routing:test
```

## Was getestet wird

Der Smoke-Test analysiert mehrere Beispielanfragen und gibt aus:

- Route: `direct` oder `council`
- Complexity
- Privacy Risk
- Suggested Agents
- Reason

## Nächster Schritt

Phase 6.3 sollte diese Routing-Details in `council-engine.ts` integrieren.

Empfohlene kleine Integration:

1. `analyzeCouncilRouting` importieren
2. Routing-Ergebnis vor Council-Entscheidung berechnen
3. `suggestedAgents` in Council-Antworten aufnehmen
4. Decision Logs später um `suggestedAgents` erweitern
