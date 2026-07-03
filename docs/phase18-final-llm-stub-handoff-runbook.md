# Runbook – Phase 18.3 Final LLM Stub Handoff

## Patch
```powershell
npm run phase18:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase18-3-patch-final-llm-stub-handoff.cjs
```

## Verify
```powershell
npm run phase18:3:verify
npm run llm:stub:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase18:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final llm stub handoff"
git push origin main
git status --short
```
