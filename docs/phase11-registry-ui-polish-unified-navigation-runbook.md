# Runbook – Phase 11.7 Registry UI Polish & Unified Navigation

## Patch
```powershell
npm run phase11:7:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase11-7-patch-registry-ui-polish-unified-navigation.cjs
```

## Verify
```powershell
npm run phase11:7:verify
npm run build
npm run stack:health
```

## Manuelle Prüfung
1. http://localhost:3000 öffnen.
2. Prüfen, dass nur eine einheitliche Navigation sichtbar ist.
3. Links prüfen: Tool Consent, Capability Requests, Agent Blueprints, Agent Registry, Analytics, Logs, System.
4. Prüfen, dass aktive Seite optisch markiert ist.
