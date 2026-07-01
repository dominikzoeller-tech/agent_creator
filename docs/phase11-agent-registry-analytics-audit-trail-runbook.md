# Runbook – Phase 11.8 Agent Registry Analytics & Audit Trail

## Patch
```powershell
npm run phase11:8:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase11-8-patch-agent-registry-analytics-audit-trail.cjs
```

## Verify
```powershell
npm run phase11:8:verify
npm run build
npm run stack:health
```

## Manuelle Prüfung
1. /capability-requests öffnen und Request erstellen/entscheiden.
2. /agent-blueprints öffnen und Proposal erstellen/entscheiden.
3. /agent-registry öffnen und Agent registrieren oder Status ändern.
4. /governance-audit öffnen und Events prüfen.
