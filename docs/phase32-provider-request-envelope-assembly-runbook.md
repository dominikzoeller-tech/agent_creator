# Runbook – Phase 32.0 Provider Request Envelope Assembly

## Patch
```powershell
npm run phase32:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase32-0-patch-provider-request-envelope-assembly.cjs
```

## Verify
```powershell
npm run phase32:0:verify
npm run build
```

## Browser-Test
http://localhost:3000/provider-request-envelope
