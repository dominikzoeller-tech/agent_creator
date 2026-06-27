# Changelog Ergänzung – Phase 6.9

## v0.4.0-agent-routing-analytics

### Added

- Agent Capability Registry mit zentralen Agentenfähigkeiten.
- Routing-Analyse für Council-/Direct-Entscheidungen.
- Council Routing Metadata Bridge.
- Routing-Metadaten in Council-Ergebnissen:
  - `suggestedAgents`
  - `routingDetails`
  - `routingSummary`
- Routing-Metadaten-Panel im Chat-Frontend.
- Decision Logs um Routing-Metadaten erweitert.
- Analytics-API um Agenten-/Routing-Auswertungen erweitert.
- Analytics-UI für:
  - Top Suggested Agents
  - Top Routing-Komplexitäten
  - Top Privacy-Risiken
- Shared Logs Volume im internen Docker-Stack.

### Fixed

- Docker API Image kopiert neue Phase-6-Routing-Module.
- CouncilResult enthält Routing-Metadaten typisiert.
- DecisionLogEntry enthält Routing-Metadaten typisiert.
- Analytics UI Variable-Fix für produktiven Frontend-Build.
- Docker Compose Shared Logs YAML bereinigt.

### Operational Notes

Finaler Test:

```powershell
npm run stack:down
npm run stack:up:detached
npm run stack:health
```

Release-Tag:

```powershell
git tag v0.4.0-agent-routing-analytics
git push origin v0.4.0-agent-routing-analytics
```
