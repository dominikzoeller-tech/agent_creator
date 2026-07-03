# Runbook – Phase 14.5 Final Cockpit Handoff

## Patch
```powershell
npm run phase14:5:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase14-5-patch-final-cockpit-handoff.cjs
```

## Verify
```powershell
npm run phase14:5:verify
npm run cockpit:final:check
npm run build
npm run stack:health
```

## Optional Smoke
Wenn Docker-Frontend bereits läuft:
```powershell
npm run phase14:0:smoke
npm run phase14:1:smoke
npm run phase14:4:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final cockpit handoff"
git push origin main
git status --short
```
