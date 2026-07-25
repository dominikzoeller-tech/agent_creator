# fix-approval-decision-index-type

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Record<SecureMasterApprovalDecision, string>'
```

Problem:

In `frontend/app/cmt/master/secure/agent/page.tsx` wurde `decision` durch vorherige Legacy-Map-Fixes als `any` typisiert. Danach kann TypeScript `explanations[decision]` nicht sicher indexieren.

Fix:

`decision` wird lokal auf den Key-Typ der `explanations` gecastet:

```tsx
secureMasterApprovalDecisionPreview.explanations[decision as keyof typeof secureMasterApprovalDecisionPreview.explanations]
```

Ausfuehren:

```powershell
node .\fix-approval-decision-index-type\scripts\fix-approval-decision-index-type.cjs
npm run fixapprovalindex:verify
npm run build
```
