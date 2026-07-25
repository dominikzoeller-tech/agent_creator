# fix-implicit-any-map-params

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Parameter 'href' implicitly has an 'any' type.
```

Dieser Patch typisiert typische `.map(...)` Callback-Parameter in alten CMT-Pages, z. B.:

```tsx
entry.visibleLinks.map((href) => ...)
```

wird zu:

```tsx
entry.visibleLinks.map((href: string) => ...)
```

Ausfuehren:

```powershell
node .\fix-implicit-any-map-params\scripts\fix-implicit-any-map-params.cjs
npm run fixmapany:verify
npm run build
```
