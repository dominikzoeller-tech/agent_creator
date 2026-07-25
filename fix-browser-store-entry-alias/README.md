# fix-browser-store-entry-alias

Fix fuer aktuellen TypeScript-Buildfehler:

```text
has no exported member named 'getSecureMasterAnswerLogBrowserStoreEntry'
```

Der Patch ergaenzt den fehlenden Alias in den Legacy-Kompatibilitaets-Stubs:

```ts
getSecureMasterAnswerLogBrowserStoreEntry
```

Ausfuehren:

```powershell
node .\fix-browser-store-entry-alias\scripts\fix-browser-store-entry-alias.cjs
npm run fixbrowserentry:verify
npm run build
```
