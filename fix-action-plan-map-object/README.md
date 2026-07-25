# fix-action-plan-map-object

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Argument of type '(action: string) => JSX.Element' is not assignable to parameter of type '(value: ActionPlan, index: number, array: ActionPlan[]) => Element'
```

Ursache:

Ein vorheriger defensiver Map-Fix hat `action` als `string` typisiert. In `frontend/app/master-orchestrator/page.tsx` ist `action` aber ein Objekt vom Typ `ActionPlan` mit Feldern wie:

```ts
action.id
action.title
action.actionType
```

Dieser Patch ersetzt riskante Typisierung:

```tsx
.map((action: string) => ...)
```

mit:

```tsx
.map((action: any) => ...)
```

Ausfuehren:

```powershell
node .\fix-action-plan-map-object\scripts\fix-action-plan-map-object.cjs
npm run fixactionmap:verify
npm run build
```
