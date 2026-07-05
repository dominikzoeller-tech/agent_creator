# Runbook – Phase 29.0 Approval Token Activation Gate

## Patch
```powershell
npm run phase29:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase29-0-patch-approval-token-activation-gate.cjs
```

## Verify
```powershell
npm run phase29:0:verify
npm run build
```

## Browser-Test
http://localhost:3000/approval-token-activation-gate
