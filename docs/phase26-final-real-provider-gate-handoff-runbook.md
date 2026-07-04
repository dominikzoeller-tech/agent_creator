# Runbook – Phase 26.3 Final Real Provider Gate Handoff

## Patch
```powershell
npm run phase26:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase26-3-patch-final-real-provider-gate-handoff.cjs
```

## Verify
```powershell
npm run phase26:3:verify
npm run llm:real-provider-gate:final:check
npm run build
```

## Smoke optional
Wenn der Stack läuft:
```powershell
npm run stack:health
npm run phase26:2:smoke
```

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final real provider gate handoff"
git push origin main
git status --short
```
