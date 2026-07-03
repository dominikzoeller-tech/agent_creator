# Phase 14.1 – Navigation Cleanup / Admin Mode Grouping

Dieses Paket enthält Patch-, Verify- und Smoke-Script für Phase 14.1.

Ausführen im Projektroot:

```powershell
node scripts/phase14-1-patch-navigation-cleanup-admin-mode.cjs
npm run phase14:1:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase14:1:smoke
```
