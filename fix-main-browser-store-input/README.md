# fix-main-browser-store-input

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Argument of type 'SecureMasterAnswerLogJsonExportInput' is not assignable to parameter of type 'any[]'
```

Ursache:

`createSecureMasterAnswerLogMainBrowserStore(...)` wurde zuerst zu eng typisiert:

```ts
(items: any[] = [])
```

Die aufrufende Datei uebergibt aber ein Objekt:

```ts
createSecureMasterAnswerLogMainBrowserStore(input)
```

Dieser Patch macht die Factory robust:

```ts
(input: any = [])
```

und extrahiert Items defensiv aus:

```ts
input
input.items
input.entries
input.logs
```

Ausfuehren:

```powershell
node .\fix-main-browser-store-input\scripts\fix-main-browser-store-input.cjs
npm run fixmainbrowserinput:verify
npm run build
```
