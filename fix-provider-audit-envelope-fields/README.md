# fix-provider-audit-envelope-fields

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'auditPrepared' does not exist on type 'SecureMasterProviderAuditEnvelope'
```

Die Agent-Seite zeigt Felder an, die im Typ/Factory-Return noch fehlen:

```ts
auditPrepared
requestId
dispatchStatus
```

Dieser Patch erweitert `frontend/lib/cmt-secure-master-provider-audit-envelope.ts` um diese Felder und setzt robuste Default-Werte.

Ausfuehren:

```powershell
node .\fix-provider-audit-envelope-fields\scripts\fix-provider-audit-envelope-fields.cjs
npm run fixauditfields:verify
npm run build
```
