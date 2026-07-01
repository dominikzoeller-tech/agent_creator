# Runbook – Phase 11.3 Consent Resume / Approved Tool Execution

## Patch
```powershell
npm run phase11:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase11-3-patch-consent-resume-approved-execution.cjs
```

## Verify
```powershell
npm run phase11:3:verify
npm run phase11:2:verify
npm run tools:consent:verify
npm run build
npm run stack:health
```

## Manuelle Prüfung
1. Anfrage auslösen, die Consent erfordert.
2. `consentRequestId` aus Response kopieren.
3. Request unter `/tool-consent` genehmigen.
4. Dieselbe Anfrage mit `consentRequestId` erneut gegen `/v1/ask` senden.
5. Erwartung: Bei approved läuft der Agent Flow weiter; bei pending/denied/expired bleibt er blockiert.
