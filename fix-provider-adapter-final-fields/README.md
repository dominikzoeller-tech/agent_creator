# fix-provider-adapter-final-fields

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'activationRequirements' does not exist on type 'SecureMasterProviderAdapterContract'
```

Die Agent-Seite nutzt im Provider-Adapter-Contract weitere UI-Felder:

```ts
activationRequirements
nextStep
```

Dieser Patch erweitert:

```text
frontend/lib/cmt-secure-master-provider-adapter-contract.ts
```

um diese Felder und setzt robuste Default-Werte.

Ausfuehren:

```powershell
node .\fix-provider-adapter-final-fields\scripts\fix-provider-adapter-final-fields.cjs
npm run fixadapterfinal:verify
npm run build
```
