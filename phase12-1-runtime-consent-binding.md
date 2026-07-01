# Phase 12.1 – Runtime Consent Binding

Dieses Paket enthält Patch- und Verify-Script für Phase 12.1.

Ausführen im Projektroot:

```powershell
node scripts/phase12-1-patch-runtime-consent-binding.cjs
npm run phase12:1:verify
npm run build
npm run stack:up:detached
npm run stack:health
```
