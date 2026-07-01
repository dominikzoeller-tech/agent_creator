# Phase 11.9a – Hotfix Patch-Script Syntax

Dieser Hotfix repariert das Phase-11.9-Patch-Script, wenn es beim Ausführen mit `SyntaxError: Unexpected identifier '$'` abbricht.

Ursache war ein verschachteltes Template Literal im eingebetteten Smoke-Script:

```js
console.log(`${good ? "OK  " : "MISS"} ${label}: ${res.status} ${url}`);
```

Das wird in sichere String-Verkettung umgewandelt.

Ausführen:

```powershell
node scripts/phase11-9a-hotfix-patch-script-syntax.cjs
node scripts/phase11-9a-verify-patch-script-syntax.cjs
node scripts/phase11-9-patch-governance-release-polish.cjs
npm run phase11:9:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase11:9:smoke
```
