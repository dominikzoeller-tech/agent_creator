# fix-provider-adapter-envelope-fields

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'secretsIncluded' does not exist on type requestEnvelopePreview
```

Die Agent-Seite nutzt weitere Felder in:

```ts
providerAdapterContract.requestEnvelopePreview
providerAdapterContract.responseEnvelopePreview
```

Dieser Patch erweitert:

```text
frontend/lib/cmt-secure-master-provider-adapter-contract.ts
```

um:

```ts
requestEnvelopePreview.secretsIncluded
responseEnvelopePreview.message
responseEnvelopePreview.providerCallAllowed
responseEnvelopePreview.dispatchStatus
```

Ausfuehren:

```powershell
node .\fix-provider-adapter-envelope-fields\scripts\fix-provider-adapter-envelope-fields.cjs
npm run fixadapterenv:verify
npm run build
```
