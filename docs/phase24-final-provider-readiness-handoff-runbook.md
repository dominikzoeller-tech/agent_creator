# Runbook – Phase 24.3 Final Provider Readiness Handoff

## Patch
```powershell
npm run phase24:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase24-3-patch-final-provider-readiness-handoff.cjs
```

## Verify
```powershell
npm run phase24:3:verify
npm run llm:provider-readiness:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase24:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final provider readiness handoff"
git push origin main
git status --short
```
