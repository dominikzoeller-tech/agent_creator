# Runbook – Phase 30.3 Final Token-Backed Provider Preflight Handoff

## Patch
```powershell
npm run phase30:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase30-3-patch-final-token-backed-provider-preflight-handoff.cjs
```

## Verify
```powershell
npm run phase30:3:verify
npm run llm:token-backed-provider:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase30:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final token backed provider preflight handoff"
git push origin main
git status --short
```
