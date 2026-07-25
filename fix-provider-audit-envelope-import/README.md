# fix-provider-audit-envelope-import

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Cannot find name 'createSecureMasterProviderAuditEnvelope'
```

Die Agent-Seite verwendet `createSecureMasterProviderAuditEnvelope`, aber der Import bzw. die Factory fehlt.

Dieser Patch:

- erstellt `frontend/lib/cmt-secure-master-provider-audit-envelope.ts`
- stellt `createSecureMasterProviderAuditEnvelope` bereit
- stellt `SecureMasterProviderAuditHistoryItem` bereit
- importiert beide Symbole in `frontend/app/cmt/master/secure/agent/page.tsx`, falls sie fehlen

Ausfuehren:

```powershell
node .\fix-provider-audit-envelope-import\scripts\fix-provider-audit-envelope-import.cjs
npm run fixaudit:verify
npm run build
```
