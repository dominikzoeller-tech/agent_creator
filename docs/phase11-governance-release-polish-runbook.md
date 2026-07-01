# Runbook – Phase 11.9 Governance Release Polish

## Patch
```powershell
npm run phase11:9:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase11-9-patch-governance-release-polish.cjs
```

## Verify
```powershell
npm run phase11:9:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase11:9:smoke
```

## Manuelle Prüfung
1. Browser öffnen: http://localhost:3000
2. Prüfen, dass keine doppelte Legacy-Navigation mehr sichtbar ist.
3. Diese Seiten öffnen:
   - /tool-consent
   - /capability-requests
   - /agent-blueprints
   - /agent-registry
   - /governance-audit
4. Smoke Script muss alle UI/API Routen mit OK melden.

## Commit
```powershell
git add .
git commit -m "chore: polish governance release"
git push origin main
```
