# Runbook – Phase 12.5 Final Runtime Handoff

## Patch
```powershell
npm run phase12:5:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase12-5-patch-final-runtime-handoff.cjs
```

## Final Verify
```powershell
npm run phase12:5:verify
npm run runtime:final:check
npm run build
npm run stack:health
```

## Manuelle UI-Prüfung
Diese URLs öffnen:
- http://localhost:3000/agent-runtime
- http://localhost:3000/agent-runtime-consent
- http://localhost:3000/agent-runtime-resume
- http://localhost:3000/agent-runtime-policy
- http://localhost:3000/agent-runtime-dashboard
- http://localhost:3000/governance-audit

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final runtime handoff"
git push origin main
git status --short
```

## Hinweis zu data/
`data/` enthält Runtime-/Testdaten und sollte durch `.gitignore` ignoriert bleiben.
