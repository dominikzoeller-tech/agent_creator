# fix-provider-audit-history-item

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Cannot find name 'createProviderAuditHistoryItem'
```

Die Agent-Seite verwendet:

```ts
createProviderAuditHistoryItem(envelope)
```

aber die Factory fehlt im Import/Lib.

Dieser Patch:

- erweitert `frontend/lib/cmt-secure-master-provider-audit-envelope.ts`
- exportiert `createProviderAuditHistoryItem`
- importiert `createProviderAuditHistoryItem` in `frontend/app/cmt/master/secure/agent/page.tsx`

Ausfuehren:

```powershell
node .\fix-provider-audit-history-item\scripts\fix-provider-audit-history-item.cjs
npm run fixaudititem:verify
npm run build
```
