# Phase 13.4 – Tool Adapter Dashboard & Phase-13 Smoke

Dieses Paket enthält Patch-, Verify- und Smoke-Script für Phase 13.4.

Ausführen im Projektroot:

```powershell
node scripts/phase13-4-patch-tool-adapter-dashboard-smoke.cjs
npm run phase13:4:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase13:4:smoke
```
