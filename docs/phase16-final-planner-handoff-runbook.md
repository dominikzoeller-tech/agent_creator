# Runbook – Phase 16.3 Final Planner Handoff

## Patch
```powershell
npm run phase16:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase16-3-patch-final-planner-handoff.cjs
```

## Verify
```powershell
npm run phase16:3:verify
npm run planner:final:check
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
git commit -m "docs: add final planner handoff"
git push origin main
git status --short
```
