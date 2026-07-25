# fix-missing-secure-exports

Fix fuer aktuellen Build-Fehler:

```text
has no exported member named 'getSecureMasterAppEntry'
```

Dieser Patch erweitert die Kompatibilitaets-Stubs um die alten/erwarteten `getSecureMaster...` Exports.

Ausfuehren:

```powershell
node .\fix-missing-secure-exports\scripts\fix-missing-secure-exports.cjs
npm run fixsecureexports:verify
npm run build
```
