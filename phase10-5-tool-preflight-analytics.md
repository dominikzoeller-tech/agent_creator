# Phase 10.5 – Tool Preflight Analytics

## Ziel

Phase 10.4 zeigt Tool Preflight im Chat UI. Phase 10.5 macht Tool-Preflight-Nutzung messbar.

## Neue Analytics-Kennzahlen

```text
toolPreflightEntriesCount
toolPreflightCandidateCount
toolPreflightAllowedCandidateCount
toolPreflightBlockedCandidateCount
toolPreflightBlockedSharePercent
toolPreflightHighRiskCandidateCount
topToolPreflightCandidates
topToolPreflightBlockedTools
topToolPreflightAllowedTools
topToolPreflightBlockReasons
topToolPreflightWarnings
```

## Neues Frontend Panel

```text
frontend/components/ToolPreflightAnalyticsPanel.tsx
```

Das Panel zeigt auf `/analytics`:

- Preflight Logs
- erkannte Kandidaten
- erlaubte Kandidaten
- blockierte Kandidaten
- Blockierquote
- High-Risk Kandidaten
- Top Kandidaten
- Top blockierte Tools
- Top Blockiergründe
- Top Warnungen

## Anwendung

```powershell
node scripts/phase10-5-patch-tool-preflight-analytics.cjs
npm run tools:preflight:analytics:verify
```

## Danach Frontend neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache frontend
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

1. Im Chat mehrere Tool-relevante Fragen stellen:

```text
Was ist aktuell zu Privacy-first AI Agents relevant?
Suche in der Knowledge Base nach Web Research.
Bitte speicher das als Memory.
```

2. Analytics öffnen:

```text
http://localhost:3000/analytics
```

Erwartung:

- Panel `Tool-Preflight-Analytics` ist sichtbar.
- Kandidaten/Blockierungen werden gezählt.
- Top Blockiergründe werden angezeigt.

## Nächster Schritt

Phase 10.6 – Tool Permission Enforcement Prep:

- Preflight Ergebnis als Entscheidungsgrundlage vorbereiten
- noch keine harte Tool-Ausführung blockieren
- Guardrail-Schalter und Rollback vorbereiten
