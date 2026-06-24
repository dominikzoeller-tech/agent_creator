# Test Matrix – Routing, Master-Agent und Rat

Dieses Dokument ist die manuelle Referenz für **Phase 2 – Stabilisierung + Testen**.

Ziel:
- Faktenfragen sollen zuverlässig `direct` sein
- echte Entscheidungsfragen sollen zuverlässig `council` sein
- Grenzfälle sollen bewusst beobachtet werden
- CLI-Fehlbedienungen sollen nicht mit echten Nutzerfragen verwechselt werden

---

## Kategorie A – Faktenfragen → `direct`

Diese Fragen sollen **nicht** den Rat aktivieren.

### Beispiele
- Was ist der Unterschied zwischen TypeScript und JavaScript?
- Was ist JSON?
- Erkläre mir Promises.
- Wie funktioniert `git push`?
- Definiere statische Typisierung.
- Wer ist OpenAI?
- Fasse kurz zusammen, was ein API-Endpoint ist.

### Erwartung
- `shouldInvokeCouncil(...) === false`
- `runMasterAgent(...).route === "direct"`

---

## Kategorie B – echte Entscheidungsfragen → `council`

Diese Fragen enthalten echte Tradeoffs, Unsicherheit oder mehrere Optionen.

### Beispiele
- Soll ich zuerst die CLI fertig bauen oder zuerst JSON-Output standardisieren?
- Ich bin hin- und hergerissen: Soll ich zuerst Stabilität oder Geschwindigkeit priorisieren?
- Welche Option ist besser: modularer Ausbau oder schnelle Integration?
- Soll ich den Rat später als Modul ausbauen oder erstmal nur die Kernarchitektur stabilisieren?

### Erwartung
- `shouldInvokeCouncil(...) === true`
- `runMasterAgent(...).route === "council"`

---

## Kategorie C – explizite Rat-Trigger → `council`

Diese Formulierungen sollen den Rat **immer** aktivieren.

### Beispiele
- rat das durch: Soll ich X oder Y machen?
- frag den Rat: Welche Option ist robuster?
- pressure-test das: Soll ich zuerst deployen oder zuerst härten?
- Ich kann mich nicht entscheiden: API zuerst oder UI zuerst?
- Welche Option würdest du an meiner Stelle wählen?

### Erwartung
- `shouldInvokeCouncil(...) === true`
- `runMasterAgent(...).route === "council"`

---

## Kategorie D – Grenzfälle

Diese Fälle sind bewusst interessant, weil sie leicht kippen können.

### Beispiele
- Vergleiche TypeScript und JavaScript.
- Ist TypeScript besser als JavaScript?
- Welche Vor- und Nachteile hat ein modularer Master-Agent?
- Lohnt es sich, früher zu deployen?
- Ist das der richtige Move?

### Erwartung
- bewusst prüfen, ob das Routing sinnvoll reagiert
- diese Fälle regelmäßig gegen Regression testen

### Hinweis
Nicht jeder Vergleich ist automatisch eine Council-Frage.

---

## Kategorie E – CLI-Fehlbedienung / Shell-Kommandos

Diese Eingaben sollen **nicht** als normale Agentenfragen behandelt werden, wenn sie in der CLI auftauchen.

### Beispiele
- npm run stats:view
- npm run health:check
- git status
- git push origin main
- node test.js
- npx ts-node master-test.ts

### Erwartung
- CLI erkennt Shell-Befehl
- CLI gibt Warnung aus
- Agent wird nicht aufgerufen

---

## Kategorie F – JSON-Modus

Zusätzlich zur Route soll geprüft werden, ob die Form korrekt ist.

### Direct JSON
Beispiel:
- Was ist JSON?

### Erwartung
- `format === "json"`
- `route === "direct"`
- `usedCouncil === false`
- `recommendation === null`
- `firstStep === null`
- `confidence === null`

### Council JSON
Beispiel:
- rat das durch: Soll ich X oder Y machen?

### Erwartung
- `format === "json"`
- `route === "council"`
- `usedCouncil === true`
- `recommendation` vorhanden
- `firstStep` vorhanden
- `confidence` > 0

---

## Kategorie G – Logging / Analytics

Diese Funktionen hängen indirekt am Routing und an echten Council-Fällen.

### Erwartung bei Council-Fällen
- Decision Log schreibt Eintrag
- `log:view` zeigt Eintrag
- `stats:view` wertet Eintrag aus
- CSV/Excel-Export läuft durch

### Erwartung bei Direct-Fällen
- keine unnötige Council-Logik
- keine falschen Council-Metriken

---

## Praktischer Minimal-Durchlauf vor jedem Deployment

```bash
npm run health:check
npm run council:test
npm run master:test
npm run json:test
npm run stats:view -- --route=all --order=newest --limit=20
```

---

## Definition of Done für Phase 2

Phase 2 gilt als stabil, wenn:

- Faktenfragen zuverlässig `direct` sind
- Entscheidungsfragen zuverlässig `council` sind
- explizite Rat-Trigger zuverlässig `council` sind
- CLI Shell-Befehle blockiert
- JSON-Modi korrekt aufgebaut sind
- Logging funktioniert
- Stats / Exporte funktionieren
- `health-check.ts` auf `OK` läuft

