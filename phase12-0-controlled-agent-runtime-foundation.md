# Phase 12.0 – Controlled Agent Runtime Foundation

Dieses Paket enthält Patch- und Verify-Script für Phase 12.0.

Ausführen im Projektroot:

```powershell
node scripts/phase12-0-patch-controlled-agent-runtime-foundation.cjs
npm run phase12:0:verify
npm run build
npm run stack:up:detached
npm run stack:health
```
