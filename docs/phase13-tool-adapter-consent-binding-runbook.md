# Runbook – Phase 13.1 Tool Adapter Consent Binding

## Patch
```powershell
npm run phase13:1:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase13-1-patch-tool-adapter-consent-binding.cjs
```

## Verify
```powershell
npm run phase13:1:verify
npm run build
npm run stack:up:detached
npm run stack:health
```

## Manuelle Prüfung
1. /tool-sandbox öffnen und Dry-run Plan erzeugen.
2. /tool-adapter-consent öffnen.
3. Plan auswählen und Binding erstellen.
4. Link zu /tool-consent?requestId=<id> öffnen.
5. Approve/Deny testen.
6. /tool-adapter-consent neu laden und Status-Sync prüfen.
