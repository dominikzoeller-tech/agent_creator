# Phase 6.8c – Agenten- und Routing-Analytics im Frontend anzeigen

## Ziel

Die Analytics-API liefert seit Phase 6.8b zusätzliche Felder:

```text
topSuggestedAgents
topRoutingComplexities
topPrivacyRisks
```

Phase 6.8c zeigt diese Felder im Frontend auf `/analytics` an.

## Neue Datei

```text
frontend/components/AgentRoutingAnalyticsPanel.tsx
```

## Patch-Script

```text
scripts/phase6-8c-patch-analytics-ui.cjs
scripts/add-phase6-8c-analytics-ui-script.cjs
```

## Anwendung

```powershell
node scripts/add-phase6-8c-analytics-ui-script.cjs
npm run phase6:analytics:ui:patch
```

## Test

```powershell
npm run stack:down
npm run stack:up:detached
npm run stack:health
```

Danach eine neue Council-Anfrage senden und öffnen:

```text
http://localhost:3000/analytics
```

Erwartung:

- Abschnitt `Agenten- und Routing-Analytics` ist sichtbar.
- `Top Suggested Agents` zeigt nach neuen Log-Einträgen z. B. `decision_agent`.
- `Top Routing-Komplexitäten` zeigt `low`, `medium` oder `high`.
- `Top Privacy-Risiken` zeigt `low`, `medium` oder `high`.
