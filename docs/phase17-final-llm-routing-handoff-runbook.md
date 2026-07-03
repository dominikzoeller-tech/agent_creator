# Runbook – Phase 17.3 Final LLM Routing Handoff

## Patch
```powershell
npm run phase17:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase17-3-patch-final-llm-routing-handoff.cjs
```

## Verify
```powershell
npm run phase17:3:verify
npm run llm:routing:final:check
npm run build
```

## Optional Stack Check
```powershell
npm run stack:health
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final llm routing handoff"
git push origin main
git status --short
```
