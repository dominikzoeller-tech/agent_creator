# Runbook – Phase 21.3 Final Invocation Envelope Handoff

## Patch
```powershell
npm run phase21:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase21-3-patch-final-invocation-envelope-handoff.cjs
```

## Verify
```powershell
npm run phase21:3:verify
npm run llm:approved-envelope:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase21:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final invocation envelope handoff"
git push origin main
git status --short
```
