# Phase 6.6 – Council Engine Snippet Extractor

## Ziel

Für den echten Patch von `council-engine.ts` brauchen wir die relevanten Codebereiche.

Der Phase-6.5-Inspector hat gezeigt:

- `runCouncil` beginnt ungefähr bei Zeile 622
- `handleUserMessage` beginnt ungefähr bei Zeile 776
- Return-Strukturen liegen ungefähr bei 570, 699, 715, 716

Dieses Paket ergänzt ein Script, das genau diese Bereiche ausgibt.

## Einrichtung

```powershell
node scripts/add-phase6-6-snippet-script.cjs
```

## Ausführen

```powershell
npm run phase6:council:snippets
```

## Danach

Kopiere die Ausgabe in den Chat.

Danach kann der eigentliche Phase-6.6-Patch gezielt erstellt werden:

- Imports ergänzen
- Routing-Metadaten berechnen
- Return-Objekte additiv erweitern
- Regression-/Smoke-Tests ausführen
