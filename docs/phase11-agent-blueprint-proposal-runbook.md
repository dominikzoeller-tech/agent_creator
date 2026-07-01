# Runbook – Phase 11.5 Agent Blueprint Proposal

## Patch
```powershell
npm run phase11:5:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase11-5-patch-agent-blueprint-proposal.cjs
```

## Verify
```powershell
npm run phase11:5:verify
npm run build
npm run stack:health
```

## Manuelle Prüfung
1. Chat öffnen.
2. Eingeben: Bitte erstelle einen Agent Blueprint für outlook-mail-calendar-capability.
3. Erwartung: Response enthält agentBlueprintProposalId und agentBlueprintProposalUrl.
4. /agent-blueprints öffnen und Proposal prüfen.
