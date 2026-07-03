# Phase 13.1 – Tool Adapter Consent Binding

Dieses Paket enthält Patch- und Verify-Script für Phase 13.1.

Ausführen im Projektroot:

```powershell
node scripts/phase13-1-patch-tool-adapter-consent-binding.cjs
npm run phase13:1:verify
npm run build
npm run stack:up:detached
npm run stack:health
```
