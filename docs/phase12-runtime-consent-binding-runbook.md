# Runbook – Phase 12.1 Runtime Consent Binding

## Patch
```powershell
npm run phase12:1:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase12-1-patch-runtime-consent-binding.cjs
```

## Verify
```powershell
npm run phase12:1:verify
npm run build
npm run stack:up:detached
npm run stack:health
```

## Manuelle Prüfung
1. /agent-runtime öffnen und Dry-run Envelope erzeugen.
2. /agent-runtime-consent öffnen.
3. Envelope auswählen und Runtime Consent Binding erstellen.
4. Link zu /tool-consent?requestId=<id> öffnen.
5. Approve/Deny testen.
6. /agent-runtime-consent neu laden und Status-Sync prüfen.
