# Phase 13.0a – Hotfix Patch-Script Syntax

Dieser Hotfix repariert das Phase-13.0-Patch-Script, falls es beim Ausführen abbricht und danach `phase13:0:verify` weiterhin fehlt.

Ausführen:

```powershell
node scripts/phase13-0a-hotfix-patch-script-syntax.cjs
node scripts/phase13-0a-verify-patch-script-syntax.cjs
node scripts/phase13-0-patch-tool-adapter-registry-sandbox.cjs
npm run phase13:0:verify
npm run build
npm run stack:up:detached
npm run stack:health
git status --short
```
