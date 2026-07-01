# Phase 11.3 – Consent Resume / Approved Tool Execution

Dieses Paket enthält Patch- und Verify-Script für Phase 11.3.

Ausführen im Projektroot:

```powershell
node scripts/phase11-3-patch-consent-resume-approved-execution.cjs
npm run phase11:3:verify
npm run build
npm run stack:health
```

Verify-Hinweis: pending/denied/expired/missing bleiben blockiert; approved darf den Agent Flow fortsetzen.

