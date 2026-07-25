# fix-provider-adapter-contract-import

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Cannot find name 'createSecureMasterProviderAdapterContract'
```

Der Patch stellt sicher, dass die fehlende Funktion vorhanden und in der Agent-Seite importiert ist.

Ausfuehren:

```powershell
node .\fix-provider-adapter-contract-import\scripts\fix-provider-adapter-contract-import.cjs
npm run fixadaptercontract:verify
npm run build
```
