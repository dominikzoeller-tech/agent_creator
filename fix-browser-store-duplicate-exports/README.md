# fix-browser-store-duplicate-exports

Fix fuer aktuellen Webpack/TypeScript-Buildfehler:

```text
Identifier 'SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY' has already been declared
```

Ursache:

Mehrere Patches haben denselben Export in Browser-Store-Kompatibilitaetsdateien mehrfach angehaengt.

Dieser Patch dedupliziert doppelte Export-Deklarationen in:

```text
frontend/app/lib/cmt-master-answer-log-list-browser-store.ts
frontend/lib/cmt-master-answer-log-list-browser-store.ts
```

Ausfuehren:

```powershell
node .\fix-browser-store-duplicate-exports\scripts\fix-browser-store-duplicate-exports.cjs
npm run fixbrowserdupes:verify
npm run build
```
