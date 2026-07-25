# fix-provider-audit-envelope-final-fields

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'redactionRules' does not exist on type 'SecureMasterProviderAuditEnvelope'
```

Die Agent-Seite nutzt weitere UI-Felder im Provider-Audit-Envelope:

```ts
redactionRules
nextSafeStep
```

Dieser Patch erweitert:

```text
frontend/lib/cmt-secure-master-provider-audit-envelope.ts
```

um diese Felder und setzt robuste Defaults.

Ausfuehren:

```powershell
node .\fix-provider-audit-envelope-final-fields\scripts\fix-provider-audit-envelope-final-fields.cjs
npm run fixauditfinal:verify
npm run build
```
