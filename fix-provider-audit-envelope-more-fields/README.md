# fix-provider-audit-envelope-more-fields

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'secretsIncluded' does not exist on type 'SecureMasterProviderAuditEnvelope'
```

Die Agent-Seite nutzt weitere UI-Felder im Provider-Audit-Envelope, die im Typ noch fehlen.

Dieser Patch erweitert:

```text
frontend/lib/cmt-secure-master-provider-audit-envelope.ts
```

um robuste Default-Felder:

```ts
secretsIncluded
requiredAuditFieldsLater
forbiddenAuditFields
providerName
modelName
networkCallPerformed
providerExecutionAllowed
llmCallPerformed
```

Ausfuehren:

```powershell
node .\fix-provider-audit-envelope-more-fields\scripts\fix-provider-audit-envelope-more-fields.cjs
npm run fixauditmore:verify
npm run build
```
