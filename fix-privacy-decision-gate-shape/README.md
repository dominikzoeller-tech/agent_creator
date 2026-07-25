# fix-privacy-decision-gate-shape

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'decision' does not exist on type 'PrivacyGateDecision'
```

Problemstelle:

```tsx
result.gate.decision.decision
```

Die Page `frontend/app/cmt/privacy/decision/page.tsx` erwartet, dass `result.gate.decision` ein Objekt mit innerem Feld `decision` ist. Einige Legacy-Typen liefern aber nur den String:

```ts
'allow_local_only' | 'block_external'
```

Dieser Patch stabilisiert `frontend/lib/cmt-privacy-decision.ts` und `frontend/app/lib/cmt-privacy-decision.ts` mit einer kompatiblen Result-Form:

```ts
result.gate.decision.decision
result.gate.detected.sensitivity
result.gate.approval.required
```

Ausfuehren:

```powershell
node .\fix-privacy-decision-gate-shape\scripts\fix-privacy-decision-gate-shape.cjs
npm run fixprivacydecisionshape:verify
npm run build
```
