# Runbook – Phase 11.6 Controlled Agent Registry Activation

## Patch
```powershell
npm run phase11:6:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase11-6-patch-controlled-agent-registry-activation.cjs
```

## Verify
```powershell
npm run phase11:6:verify
npm run build
npm run stack:health
```

## Manuelle Prüfung
1. /agent-registry öffnen.
2. Agent in Test Mode registrieren.
3. Status auf active, disabled, registered oder test_mode setzen.
4. Sicherstellen: Es wird keine automatische Tool-Ausführung gestartet.
