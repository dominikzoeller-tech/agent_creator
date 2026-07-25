# fix-privacy-decision-outcome-field

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'outcome' does not exist on type 'PrivacyDecisionResult'
```

Die Page `frontend/app/cmt/privacy/decision/page.tsx` liest:

```ts
result.outcome.accepted
result.outcome.mode
result.outcome.message
result.outcome.nextAction
```

Dieser Patch erweitert/stabilisiert:

```text
frontend/lib/cmt-privacy-decision.ts
frontend/app/lib/cmt-privacy-decision.ts
```

um:

```ts
outcome: {
  accepted: boolean;
  mode: PrivacyDecisionOption;
  message: string;
  nextAction: string;
}
```

Ausfuehren:

```powershell
node .\fix-privacy-decision-outcome-field\scripts\fix-privacy-decision-outcome-field.cjs
npm run fixprivacyoutcome:verify
npm run build
```
