# fix-secure-status-ui-fields

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'currentMode' does not exist on type 'SecureMasterStatus'
```

Die Status-Page liest weitere Top-Level-Felder:

```ts
status.currentMode
status.mainPage
```

Dieser Patch erweitert/stabilisiert:

```text
frontend/lib/cmt-master-secure-status.ts
frontend/app/lib/cmt-master-secure-status.ts
```

mit den erwarteten UI-Feldern.

Ausfuehren:

```powershell
node .\fix-secure-status-ui-fields\scripts\fix-secure-status-ui-fields.cjs
npm run fixsecurestatusui:verify
npm run build
```
