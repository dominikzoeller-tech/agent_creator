# Runbook – Phase 31.3 Final Provider Request Contract Handoff

## Patch
```powershell
npm run phase31:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase31-3-patch-final-provider-request-contract-handoff.cjs
```

## Verify
```powershell
npm run phase31:3:verify
npm run llm:provider-request-contract:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase31:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final provider request contract handoff"
git push origin main
git status --short
```
