# fix-secure-status-capabilities-field

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'capabilities' does not exist on type 'SecureMasterStatus'
```

Die Status-Page liest:

```ts
status.capabilities
```

Dieser Patch erweitert/stabilisiert:

```text
frontend/lib/cmt-master-secure-status.ts
frontend/app/lib/cmt-master-secure-status.ts
```

um `capabilities` und weitere sichere Status-Felder.

Ausfuehren:

```powershell
node .\fix-secure-status-capabilities-field\scripts\fix-secure-status-capabilities-field.cjs
npm run fixsecurecapabilities:verify
npm run build
```
