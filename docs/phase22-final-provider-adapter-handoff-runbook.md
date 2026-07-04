# Runbook – Phase 22.3 Final Provider Adapter Handoff

## Patch
```powershell
npm run phase22:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase22-3-patch-final-provider-adapter-handoff.cjs
```

## Verify
```powershell
npm run phase22:3:verify
npm run llm:provider-stub:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase22:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final provider adapter handoff"
git push origin main
git status --short
```
