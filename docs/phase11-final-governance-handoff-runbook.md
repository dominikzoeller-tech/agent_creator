# Runbook – Phase 11.10 Final Governance Handoff

## Patch
```powershell
npm run phase11:10:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase11-10-patch-final-governance-handoff.cjs
```

## Final Verify
```powershell
npm run phase11:10:verify
npm run governance:final:check
npm run build
npm run stack:health
```

## Manuelle UI-Prüfung
Diese URLs öffnen:
- http://localhost:3000/tool-consent
- http://localhost:3000/capability-requests
- http://localhost:3000/agent-blueprints
- http://localhost:3000/agent-registry
- http://localhost:3000/governance-audit

## Git Abschluss
```powershell
git status --short
git add .
git commit -m "docs: add final governance handoff"
git push origin main
git status --short
```

## Hinweis zu data/
`data/` enthält Runtime-/Testdaten und sollte durch `.gitignore` ignoriert bleiben.
