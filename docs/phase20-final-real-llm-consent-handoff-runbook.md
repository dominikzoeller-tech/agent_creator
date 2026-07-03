# Runbook – Phase 20.3 Final Real LLM Consent Handoff

## Patch
```powershell
npm run phase20:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase20-3-patch-final-real-llm-consent-handoff.cjs
```

## Verify
```powershell
npm run phase20:3:verify
npm run llm:real-consent:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase20:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final real llm consent handoff"
git push origin main
git status --short
```
