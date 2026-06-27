<!-- PHASE6_AGENT_ROUTING_START -->

## Phase 6 – Agenten-Routing, Logs und Analytics

Phase 6 erweitert den Master-Agenten um eine strukturierte Agenten- und Routing-Schicht.

### Agent Capability Registry

Das System kennt jetzt zentrale Agentenfähigkeiten, unter anderem:

- `decision_agent`
- `privacy_agent`
- `planning_agent`
- `risk_agent`
- `technical_agent`
- `writing_agent`
- `research_agent`

Die Registry befindet sich in:

```text
agent-capabilities.ts
```

### Routing-Metadaten

Council-Ergebnisse enthalten zusätzliche Routing-Metadaten:

```text
suggestedAgents
routingDetails
routingSummary
```

Diese Metadaten werden im Frontend angezeigt und in Decision Logs geschrieben.

### Frontend-Sichtbarkeit

Die Chat-Seite zeigt Routing-Metadaten in einem eigenen Panel:

```text
frontend/components/RoutingMetadataPanel.tsx
```

Die Analytics-Seite zeigt Agenten- und Routing-Auswertungen:

```text
frontend/components/AgentRoutingAnalyticsPanel.tsx
```

### Logs und Analytics

Decision Logs enthalten Routing-Metadaten. Analytics wertet zusätzlich aus:

- Top Suggested Agents
- Top Routing-Komplexitäten
- Top Privacy-Risiken

### Docker Shared Logs

Damit API und Frontend im Docker-Stack dieselben Logs sehen, nutzt der interne Stack gemeinsame Volumes:

```yaml
api:
  volumes:
    - ./logs:/app/logs

frontend:
  volumes:
    - ./logs:/logs:ro
```

### Wichtige Tests

```powershell
npm run agent:capabilities:test
npm run agent:routing:test
npm run council:routing:metadata:test
npm run stack:up:detached
npm run stack:health
```

### UI prüfen

```text
http://localhost:3000
http://localhost:3000/analytics
```

<!-- PHASE6_AGENT_ROUTING_END -->
