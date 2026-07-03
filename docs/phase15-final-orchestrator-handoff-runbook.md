# Runbook – Phase 15.3 Final Orchestrator Handoff

## Patch
```powershell
npm run phase15:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase15-3-patch-final-orchestrator-handoff.cjs
```

## Verify
```powershell
npm run phase15:3:verify
npm run orchestrator:final:check
npm run build
```

## Optional Stack Check
```powershell
npm run stack:health
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final orchestrator handoff"
git push origin main
git status --short
```
