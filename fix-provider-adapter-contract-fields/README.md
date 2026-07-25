# fix-provider-adapter-contract-fields

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'adapterDispatchAllowed' does not exist on type 'SecureMasterProviderAdapterContract'
```

Die Agent-Seite nutzt weitere UI-Felder im Provider-Adapter-Contract, die im Typ/Factory-Return noch fehlen.

Dieser Patch erweitert:

```text
frontend/lib/cmt-secure-master-provider-adapter-contract.ts
```

um robuste Default-Felder:

```ts
adapterDispatchAllowed
selectedProvider
selectedModel
requestEnvelopePreview
requiredEnvLater
forbiddenClientFields
nextSafeStep
```

Ausfuehren:

```powershell
node .\fix-provider-adapter-contract-fields\scripts\fix-provider-adapter-contract-fields.cjs
npm run fixadapterfields:verify
npm run build
```
