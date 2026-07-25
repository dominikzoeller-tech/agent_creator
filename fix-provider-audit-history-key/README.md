# fix-provider-audit-history-key

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Cannot find name 'SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY'
```

Die Agent-Seite verwendet den LocalStorage-Key, aber die Konstante fehlt/importiert nicht.

Dieser Patch:

- ergaenzt `SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY` in `frontend/lib/cmt-secure-master-provider-audit-envelope.ts`
- stellt sicher, dass die Konstante in `frontend/app/cmt/master/secure/agent/page.tsx` importiert ist

Ausfuehren:

```powershell
node .\fix-provider-audit-history-key\scripts\fix-provider-audit-history-key.cjs
npm run fixauditkey:verify
npm run build
```
