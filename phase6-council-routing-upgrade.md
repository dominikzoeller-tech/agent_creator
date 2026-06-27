# Phase 6.2 – Council Routing Upgrade

## Ziel

Das Council-Routing soll nicht nur zwischen `direct` und `council` unterscheiden, sondern auch begründen, welche Spezialperspektiven gebraucht werden.

---

## Neue Routing-Signale

### 1. Complexity

Niedrig:
- einfache Frage
- Faktenantwort
- kurze Erklärung

Hoch:
- mehrere Optionen
- Architekturentscheidung
- Projektplanung
- Risikoabwägung

---

### 2. Privacy Risk

Niedrig:
- public/internal

Mittel:
- confidential
- mögliche personenbezogene Daten

Hoch:
- restricted
- Geheimnisse
- hochsensible Inhalte

---

### 3. Decision Need

Council sinnvoll, wenn:

- Nutzer zwischen Optionen wählen will
- Empfehlung erwartet wird
- mehrere Tradeoffs vorhanden sind
- Risiken relevant sind

---

### 4. Implementation Need

Technical Agent sinnvoll, wenn:

- Dateien geändert werden sollen
- Docker/API/UI betroffen sind
- Tests oder Deployments nötig sind

---

## Vorgeschlagene neue Response-Felder

```ts
routingDetails?: {
  route: "direct" | "council";
  reason: string;
  suggestedAgents: string[];
  complexity: "low" | "medium" | "high";
  privacyRisk: "low" | "medium" | "high";
  decisionNeed: boolean;
  implementationNeed: boolean;
}
```

---

## Umsetzung in kleinen Schritten

### Schritt 1
Agent Capability Registry bauen.

### Schritt 2
Council-Entscheidung um `suggestedAgents` erweitern.

### Schritt 3
Decision Logs um `suggestedAgents` erweitern.

### Schritt 4
UI später um Agent-Badges erweitern.
