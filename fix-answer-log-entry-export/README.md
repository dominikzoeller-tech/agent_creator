# fix-answer-log-entry-export

Fix für aktuellen TypeScript-Buildfehler:

```text
has no exported member named 'getSecureMasterAnswerLogEntry'
```

Der Patch ergänzt die fehlenden `getSecureMaster...` Export-Aliase in den Legacy-Kompatibilitäts-Stubs.

Ausführen:

```powershell
node .\fix-answer-log-entry-export\scripts\fix-answer-log-entry-export.cjs
npm run fixanswerentry:verify
npm run build
```
