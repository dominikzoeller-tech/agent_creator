# Phase 11.9 – Governance Release Polish

Dieses Paket enthält Patch-, Verify- und Smoke-Script für Phase 11.9.

Ausführen im Projektroot:

```powershell
node scripts/phase11-9-patch-governance-release-polish.cjs
npm run phase11:9:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase11:9:smoke
```
