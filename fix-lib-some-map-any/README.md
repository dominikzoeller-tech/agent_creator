# fix-lib-some-map-any

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Parameter 'block' implicitly has an 'any' type.
```

Diesmal ist es kein `.map(...)`, sondern `.some(...)` in:

```text
frontend/lib/cmt-master-main-view-model.ts
```

Beispiel:

```ts
blocks.some((block) => block.title === 'Safety')
```

wird zu:

```ts
blocks.some((block: any) => block.title === 'Safety')
```

Der Patch scannt `frontend/lib/**/*.ts(x)` und typisiert typische Callback-Parameter fuer `.some`, `.filter`, `.find`, `.every` und `.map` defensiv als `any`.

Ausfuehren:

```powershell
node .\fix-lib-some-map-any\scripts\fix-lib-some-map-any.cjs
npm run fixlibcallbackany:verify
npm run build
```
