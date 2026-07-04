# Runbook – Phase 27.3 Final Approval Token Request Handoff

## Patch
```powershell
npm run phase27:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase27-3-patch-final-approval-token-request-handoff.cjs
```

## Verify
```powershell
npm run phase27:3:verify
npm run llm:approval-token-request:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase27:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final approval token request handoff"
git push origin main
git status --short
```
