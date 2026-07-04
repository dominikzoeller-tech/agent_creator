# Runbook – Phase 23.3 Final Provider Config Handoff

## Patch
```powershell
npm run phase23:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase23-3-patch-final-provider-config-handoff.cjs
```

## Verify
```powershell
npm run phase23:3:verify
npm run llm:provider-config:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase23:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final provider config handoff"
git push origin main
git status --short
```
