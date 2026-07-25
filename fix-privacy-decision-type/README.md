# fix-privacy-decision-type

Fix fuer aktuellen TypeScript-Buildfehler:

```text
PrivacyDecisionOption refers to a value, but is being used as a type here.
```

Der Patch stellt sicher, dass `frontend/lib/cmt-privacy-decision.ts` den Typ
`PrivacyDecisionOption` als echten TypeScript-Type exportiert.

Ausführen:

```powershell
node .\fix-privacy-decision-type\scripts\fix-privacy-decision-type.cjs
npm run fixprivacytype:verify
npm run build
```
