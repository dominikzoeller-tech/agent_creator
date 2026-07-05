# Runbook – Phase 29.3 Final Approval Token Activation Handoff

## Patch
```powershell
npm run phase29:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase29-3-patch-final-approval-token-activation-handoff.cjs
```

## Verify
```powershell
npm run phase29:3:verify
npm run llm:approval-token-activation:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase29:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final approval token activation handoff"
git push origin main
git status --short
```
