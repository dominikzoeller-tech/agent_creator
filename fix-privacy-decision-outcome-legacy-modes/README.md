# fix-privacy-decision-outcome-legacy-modes

Fix fuer aktuellen TypeScript-Buildfehler:

```text
This comparison appears to be unintentional because the types 'PrivacyDecisionOption' and '"blocked"' have no overlap.
```

Problemstelle:

```ts
if (decision.outcome.mode === 'blocked')
if (decision.outcome.mode === 'cancelled')
```

`cmt-master-secure.ts` erwartet Legacy-Outcome-Modes `blocked` und `cancelled`.  
`cmt-privacy-decision.ts` hatte `outcome.mode` aber nur als `PrivacyDecisionOption` typisiert.

Dieser Patch erweitert:

```text
frontend/lib/cmt-privacy-decision.ts
frontend/app/lib/cmt-privacy-decision.ts
```

so dass gilt:

```ts
mode: PrivacyDecisionOption | 'blocked' | 'cancelled'
```

und `createOutcome(...)` diese Legacy-Modes bei Block/Cancel sauber setzt.

Ausfuehren:

```powershell
node .\fix-privacy-decision-outcome-legacy-modes\scripts\fix-privacy-decision-outcome-legacy-modes.cjs
npm run fixprivacyoutcomemodes:verify
npm run build
```
