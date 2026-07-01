# Phase 12.4 – Runtime Dashboard & Phase-12 Smoke

Dieses Paket enthält Patch-, Verify- und Smoke-Script für Phase 12.4.

Ausführen im Projektroot:

```powershell
node scripts/phase12-4-patch-runtime-dashboard-smoke.cjs
npm run phase12:4:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase12:4:smoke
```
