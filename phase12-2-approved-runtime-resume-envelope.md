# Phase 12.2 – Approved Runtime Resume Envelope

Dieses Paket enthält Patch- und Verify-Script für Phase 12.2.

Ausführen im Projektroot:

```powershell
node scripts/phase12-2-patch-approved-runtime-resume-envelope.cjs
npm run phase12:2:verify
npm run build
npm run stack:up:detached
npm run stack:health
```
