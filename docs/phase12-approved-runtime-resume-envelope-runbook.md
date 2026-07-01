# Runbook – Phase 12.2 Approved Runtime Resume Envelope

## Patch
```powershell
npm run phase12:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase12-2-patch-approved-runtime-resume-envelope.cjs
```

## Verify
```powershell
npm run phase12:2:verify
npm run build
npm run stack:up:detached
npm run stack:health
```

## Manuelle Prüfung
1. /agent-runtime öffnen und Envelope erzeugen.
2. /agent-runtime-consent öffnen und Binding erzeugen.
3. /tool-consent öffnen und Consent Request approved setzen.
4. /agent-runtime-resume öffnen und Resume Envelope erzeugen.
5. Prüfen: toolExecutionAllowed=false und dryRunOnly=true.
