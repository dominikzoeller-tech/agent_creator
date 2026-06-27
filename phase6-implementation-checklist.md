# Phase 6 – Implementation Checklist

## Phase 6.1 – Agent Capability Registry

- [ ] `agent-capabilities.ts` anlegen
- [ ] Typen definieren
- [ ] Registry mit mindestens 7 Agenten anlegen
- [ ] Helper-Funktionen exportieren
- [ ] regelbasierte Vorschlagslogik einbauen
- [ ] Smoke-Test anlegen
- [ ] npm Script ergänzen
- [ ] Smoke-Test ausführen
- [ ] committen

## Testbefehl

```powershell
npm run agent:capabilities:test
```

## Erwartung

Der Test soll pro Beispielinput eine Liste vorgeschlagener Agenten ausgeben.

Beispiel:

```text
Input: Soll ich Docker oder lokalen Start priorisieren?
Suggested: decision_agent, technical_agent
```

## Nächster Schritt nach Phase 6.1

Phase 6.2:

- `council-engine.ts` nutzt `suggestAgentCapabilities`
- Decision Logs bekommen `suggestedAgents`
- UI zeigt später Agent-Badges
