# Runbook – Phase 13.5 Final Tool Adapter Handoff

## Patch
```powershell
npm run phase13:5:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase13-5-patch-final-tool-adapter-handoff.cjs
```

## Final Verify
```powershell
npm run phase13:5:verify
npm run tool-adapter:final:check
npm run build
npm run stack:health
```

## Manuelle UI-Prüfung
Diese URLs öffnen:
- http://localhost:3000/tool-sandbox
- http://localhost:3000/tool-adapter-consent
- http://localhost:3000/tool-adapter-resume
- http://localhost:3000/tool-adapter-policy
- http://localhost:3000/tool-adapter-dashboard
- http://localhost:3000/governance-audit

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final tool adapter handoff"
git push origin main
git status --short
```

## Hinweis zu data/
`data/` enthält Runtime-/Testdaten und sollte durch `.gitignore` ignoriert bleiben.
