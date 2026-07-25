# fix-browser-store-demo-exports

Fix fuer aktuellen TypeScript-Buildfehler:

```text
has no exported member named 'getSecureMasterAnswerLogBrowserStoreDemo'
```

Betroffene Importstelle:

```text
frontend/lib/cmt-master-answer-log-list-browser-store-status.ts
```

Dieser Patch ergaenzt in den Browser-Store-Kompatibilitaetsmodulen fehlende Exports:

```ts
getSecureMasterAnswerLogBrowserStoreDemo
SecureMasterAnswerLogBrowserStoreResult
SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY
```

Ausfuehren:

```powershell
node .\fix-browser-store-demo-exports\scripts\fix-browser-store-demo-exports.cjs
npm run fixbrowserdemo:verify
npm run build
```
