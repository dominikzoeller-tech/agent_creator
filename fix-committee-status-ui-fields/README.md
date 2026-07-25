# fix-committee-status-ui-fields

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'label' does not exist on type 'SecureMasterCommitteeStatus'
```

Die Status-Page erwartet UI-Felder wie:

```ts
label
committeeState.summary
mainCommitteePage
mainQualityPage
```

Dieser Patch schreibt die Committee-Status-Kompatibilitaetsmodule stabil neu und ergaenzt diese UI-Felder.

Ausfuehren:

```powershell
node .\fix-committee-status-ui-fields\scripts\fix-committee-status-ui-fields.cjs
npm run fixcommitteestatusui:verify
npm run build
```
