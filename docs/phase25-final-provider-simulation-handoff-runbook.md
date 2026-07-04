# Runbook – Phase 25.3 Final Provider Simulation Handoff

## Patch
```powershell
npm run phase25:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase25-3-patch-final-provider-simulation-handoff.cjs
```

## Verify
```powershell
npm run phase25:3:verify
npm run llm:provider-simulation:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase25:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final provider simulation handoff"
git push origin main
git status --short
```
