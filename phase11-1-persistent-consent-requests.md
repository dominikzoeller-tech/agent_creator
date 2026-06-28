# Phase 11.1 – Persistent Consent Requests

## Ziel

Phase 11.1 macht Consent Requests persistent und bedienbar.

## Enthalten

- Consent Store im Frontend
- API für Consent Requests
- UI für Anzeigen/Genehmigen/Ablehnen
- Statuswerte pending/approved/denied/expired
- einfache Redaction für Preview-Daten
- Navigation zu `/tool-consent`

## Neue Dateien

```text
frontend/lib/tool-consent-store.ts
frontend/app/api/tool-consent/route.ts
frontend/app/tool-consent/page.tsx
docs/phase11-persistent-consent-requests-runbook.md
scripts/phase11-1-patch-persistent-consent-requests.cjs
scripts/phase11-1-verify-persistent-consent-requests.cjs
phase11-1-persistent-consent-requests.md
```

## Anwendung

```powershell
node scripts/phase11-1-patch-persistent-consent-requests.cjs
npm run tools:consent:verify
```

## Danach Frontend neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache frontend
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

```text
http://localhost:3000/tool-consent
```

Erwartung:

- Seite lädt
- Test-Request kann erstellt werden
- Request kann genehmigt oder abgelehnt werden
- Status ändert sich sichtbar

## Nächster Schritt

Phase 11.2 – Consent Request Integration in Agent Flow:

- Agent erstellt automatisch Consent Requests bei confirmationRequired
- Chat Panel verlinkt auf konkrete Consent Request
- Tool-Ausführung bleibt bis Approval gesperrt
