# fix-map-item-object-types

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Argument of type '(item: string) => JSX.Element' is not assignable to parameter of type '(value: Issuance, index: number, array: Issuance[]) => Element'.
```

Ursache:

Der vorherige Map-Param-Fix hat `item` global als `string` typisiert. In manchen Pages ist `item` aber ein Objekt, z. B. `Issuance` mit `item.id`, `item.decision`, usw.

Dieser Patch ersetzt deshalb riskante Typisierung:

```tsx
.map((item: string) => ...)
```

mit:

```tsx
.map((item: any) => ...)
```

Das ist fuer Legacy-Pages stabiler und bringt den Build weiter.

Ausfuehren:

```powershell
node .\fix-map-item-object-types\scripts\fix-map-item-object-types.cjs
npm run fixmapitem:verify
npm run build
```
