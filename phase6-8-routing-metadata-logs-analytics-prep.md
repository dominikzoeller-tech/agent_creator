# Phase 6.8 – Routing-Metadaten in Logs / Analytics aufnehmen

## Ziel

Die in Phase 6.6/6.7 sichtbaren Routing-Metadaten sollen dauerhaft auswertbar werden.

Neue beziehungsweise künftig zu speichernde Felder:

```text
suggestedAgents
routingDetails
routingSummary
```

## Warum dieser Schritt wichtig ist

Phase 6.7 zeigt Routing-Metadaten bereits im Frontend. Phase 6.8 macht diese Informationen historisch auswertbar:

- Welche Agenten werden häufig vorgeschlagen?
- Welche Anfragen werden wegen Risiko/Planung/Technik zum Council geroutet?
- Wie oft ist `privacyRisk` medium/high?
- Welche Routen hängen mit hoher/niedriger Confidence zusammen?

## Sicherer Ablauf

Weil Logging und Analytics bereits produktiv verwendet werden, startet Phase 6.8 mit einem Inspector.

Der Inspector prüft:

- `decision-log.ts`
- `server.ts`
- `frontend/app/api/logs/route.ts`
- `frontend/app/api/analytics/route.ts`
- `frontend/lib/types.ts`
- `frontend/app/analytics/page.tsx`

Danach kann ein gezielter Patch erstellt werden.

## Dateien in diesem Paket

```text
scripts/phase6-8-inspect-logging-analytics.cjs
scripts/add-phase6-8-inspect-script.cjs
phase6-8-routing-metadata-logs-analytics-prep.md
```

## Anwendung

Im Projekt-Root:

```powershell
node scripts/add-phase6-8-inspect-script.cjs
npm run phase6:logs:inspect
```

## Danach

Die Ausgabe in den Chat kopieren.

Danach erstellen wir den echten Phase-6.8-Patch für:

1. Log-Schema erweitern
2. `server.ts` Log-Aufruf erweitern
3. Logs-API neue Felder durchreichen
4. Analytics-API Agenten-Auswertung ergänzen
5. Frontend Analytics später um Agenten-Statistik erweitern
