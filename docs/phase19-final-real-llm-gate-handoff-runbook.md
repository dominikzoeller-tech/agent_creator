# Runbook – Phase 19.3 Final Real LLM Gate Handoff

## Patch
```powershell
npm run phase19:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase19-3-patch-final-real-llm-gate-handoff.cjs
```

## Verify
```powershell
npm run phase19:3:verify
npm run llm:real-gate:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase19:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final real llm gate handoff"
git push origin main
git status --short
```
