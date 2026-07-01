# Phase 11.4a – Hotfix Patch-Script Syntax

Dieser Hotfix repariert das Phase-11.4-Patch-Script, wenn es beim Ausführen mit `SyntaxError: Unexpected identifier 'UI'` abbricht.

Ursache war ein verschachteltes Template Literal im eingebetteten TSX-String:

```ts
decisionNote: `UI decision: ${status}`
```

Das wird in eine sichere String-Verkettung umgewandelt. Zusätzlich werden versehentlich gespeicherte HTML-Entities wie `&lt;` und `&gt;` im Patch-Script zurückrepariert.

Ausführen:

```powershell
node scripts/phase11-4a-hotfix-patch-script-syntax.cjs
node scripts/phase11-4a-verify-patch-script-syntax.cjs
node scripts/phase11-4-patch-missing-tool-capability-request-flow.cjs
npm run phase11:4:verify
npm run build
npm run stack:health
```
