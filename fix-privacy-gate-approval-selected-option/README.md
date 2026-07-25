# fix-privacy-gate-approval-selected-option

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'selectedOption' does not exist on type 'PrivacyGateApproval'
```

Die Page `frontend/app/cmt/privacy/page.tsx` liest:

```ts
result.approval.selectedOption
```

Dieser Patch erweitert/stabilisiert:

```text
frontend/lib/cmt-privacy-gate.ts
frontend/app/lib/cmt-privacy-gate.ts
```

um:

```ts
approval.selectedOption: string
```

Ausfuehren:

```powershell
node .\fix-privacy-gate-approval-selected-option\scripts\fix-privacy-gate-approval-selected-option.cjs
npm run fixprivacygateapproval:verify
npm run build
```
