# fix-lib-map-badge-any

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Parameter 'badge' implicitly has an 'any' type.
```

Diesmal liegt der Fehler nicht in `frontend/app`, sondern in:

```text
frontend/lib/cmt-master-answer-log.ts
```

Dieser Patch typisiert typische `.map(...)` Callback-Parameter in `frontend/lib/**/*.ts(x)` defensiv als `any`, z. B.:

```ts
.map((badge) => ...)
```

wird zu:

```ts
.map((badge: any) => ...)
```

Ausfuehren:

```powershell
node .\fix-lib-map-badge-any\scripts\fix-lib-map-badge-any.cjs
npm run fixlibmapany:verify
npm run build
```
