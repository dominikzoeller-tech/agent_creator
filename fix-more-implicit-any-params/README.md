# fix-more-implicit-any-params

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Parameter 'action' implicitly has an 'any' type.
```

Dieser Patch typisiert weitere typische `.map(...)` Callback-Parameter in alten Pages, z. B.:

```tsx
.map((action) => ...)
```

wird zu:

```tsx
.map((action: string) => ...)
```

Ausfuehren:

```powershell
node .\fix-more-implicit-any-params\scripts\fix-more-implicit-any-params.cjs
npm run fixmoreany:verify
npm run build
```
