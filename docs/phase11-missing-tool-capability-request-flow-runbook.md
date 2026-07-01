# Runbook – Phase 11.4 Missing Tool / Capability Request Flow

## Patch
```powershell
npm run phase11:4:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase11-4-patch-missing-tool-capability-request-flow.cjs
```

## Verify
```powershell
npm run phase11:4:verify
npm run build
npm run stack:health
```

## Manuelle Prüfung
1. Chat öffnen.
2. Explizit fehlende Fähigkeit anfordern, z.B. "Ich brauche ein Outlook Tool, das Mails und Kalender integrieren kann."
3. Erwartung: kein Tool wird gebaut; Response enthält `capabilityRequestId` und `capabilityUrl`.
4. `/capability-requests` öffnen und Request prüfen/entscheiden.
