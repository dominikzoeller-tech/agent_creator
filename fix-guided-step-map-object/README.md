# fix-guided-step-map-object

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Argument of type '(step: string) => JSX.Element' is not assignable to parameter of type '(value: GuidedStep, index: number, array: GuidedStep[]) => Element'
```

Ursache:

Ein vorheriger defensiver Map-Fix hat `step` als `string` typisiert. In `frontend/app/master-cockpit/page.tsx` ist `step` aber ein Objekt vom Typ `GuidedStep` mit Feldern wie:

```ts
step.id
step.href
step.title
step.description
step.status
```

Dieser Patch ersetzt riskante Typisierung:

```tsx
.map((step: string) => ...)
```

mit:

```tsx
.map((step: any) => ...)
```

Ausfuehren:

```powershell
node .\fix-guided-step-map-object\scripts\fix-guided-step-map-object.cjs
npm run fixguidedstep:verify
npm run build
```
