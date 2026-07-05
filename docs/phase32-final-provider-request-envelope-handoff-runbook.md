# Runbook – Phase 32.3 Final Provider Request Envelope Handoff

## Patch
```powershell
npm run phase32:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase32-3-patch-final-provider-request-envelope-handoff.cjs
```

## Verify
```powershell
npm run phase32:3:verify
npm run llm:provider-request-envelope:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase32:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final provider request envelope handoff"
git push origin main
git status --short
```
