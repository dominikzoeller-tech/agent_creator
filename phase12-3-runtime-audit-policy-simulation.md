# Phase 12.3 – Runtime Audit Integration & Policy Simulation

Dieses Paket enthält Patch- und Verify-Script für Phase 12.3.

Ausführen im Projektroot:

```powershell
node scripts/phase12-3-patch-runtime-audit-policy-simulation.cjs
npm run phase12:3:verify
npm run build
npm run stack:up:detached
npm run stack:health
```
