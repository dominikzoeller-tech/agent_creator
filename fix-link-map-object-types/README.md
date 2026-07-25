# fix-link-map-object-types

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Argument of type '(link: string) => JSX.Element' is not assignable ...
```

Ursache:

Der vorherige Map-Param-Fix hat `link` global als `string` typisiert. In `frontend/app/cmt/land/page.tsx` ist `link` aber ein Objekt mit:

```ts
{ title: string; href: string; description: string }
```

Dieser Patch ersetzt deshalb riskante Typisierung:

```tsx
.map((link: string) => ...)
```

mit:

```tsx
.map((link: any) => ...)
```

Ausfuehren:

```powershell
node .\fix-link-map-object-types\scripts\fix-link-map-object-types.cjs
npm run fixlinkmap:verify
npm run build
```
