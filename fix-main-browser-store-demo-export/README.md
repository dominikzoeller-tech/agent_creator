# fix-main-browser-store-demo-export

Fix fuer aktuellen TypeScript-Buildfehler:

```text
has no exported member named 'getSecureMasterAnswerLogMainBrowserStoreDemo'
```

Das Modul existiert jetzt, aber der Demo-Export fehlt noch.

Dieser Patch ergaenzt in:

```text
frontend/lib/cmt-master-answer-log-list-main-browser-store.ts
frontend/app/lib/cmt-master-answer-log-list-main-browser-store.ts
```

folgende Exports:

```ts
getSecureMasterAnswerLogMainBrowserStoreDemo
getSecureMasterAnswerLogListMainBrowserStoreDemo
getSecureMasterAnswerLogMainBrowserStoreStatus
```

Ausfuehren:

```powershell
node .\fix-main-browser-store-demo-export\scripts\fix-main-browser-store-demo-export.cjs
npm run fixmainbrowserdemo:verify
npm run build
```
