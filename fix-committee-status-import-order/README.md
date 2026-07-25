# fix-committee-status-import-order

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Individual declarations in merged declaration 'getSecureMasterCommitteeDemo' must be all exported or all local.
```

Ursache:

In `frontend/lib/cmt-master-committee-status.ts` steht ein `import` nicht sauber am Dateianfang bzw. kollidiert mit einer lokalen/Export-Deklaration.

Dieser Patch schreibt die Datei stabil neu und vermeidet die kollidierende Import-Deklaration.

Ausfuehren:

```powershell
node .\fix-committee-status-import-order\scripts\fix-committee-status-import-order.cjs
npm run fixcommitteestatus:verify
npm run build
```
