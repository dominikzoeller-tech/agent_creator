# fix-committee-state-final-fields

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'finalRecommendationVisible' does not exist on type committeeState
```

Die Status-Page liest weitere Felder unter:

```ts
status.committeeState
```

Dieser Patch erweitert die Committee-Status-Kompatibilitaetsmodule um die restlichen UI-Felder:

```ts
finalRecommendationVisible
liveModelEnabled
providerEnabled
internetEnabled
```

Ausfuehren:

```powershell
node .\fix-committee-state-final-fields\scripts\fix-committee-state-final-fields.cjs
npm run fixcommitteestatefinal:verify
npm run build
```
