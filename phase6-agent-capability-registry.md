# Phase 6.1 – Agent Capability Registry

## Ziel

Die Agent Capability Registry ist eine zentrale Beschreibung aller Agentenfähigkeiten.

Sie ist zunächst bewusst einfach und text-/typbasiert. Später kann sie programmatisch für Routing, UI-Anzeige, Analytics und Council-Auswahl genutzt werden.

---

## Warum eine Registry?

Aktuell entscheidet der Master-Agent bereits zwischen direkter Antwort und Council.

Mit einer Registry kann das System zusätzlich entscheiden:

- welche Spezialperspektive gebraucht wird
- welche Agenten am Council teilnehmen sollen
- welche Fähigkeiten für eine Anfrage relevant sind
- welche Agenten in Logs/Analytics auftauchen

---

## Vorgeschlagene Agenten

### 1. Decision Agent

**Zweck:** Entscheidungen strukturieren.

Nutzt bei:

- Optionen vergleichen
- Prioritäten setzen
- Empfehlung ableiten
- First Step bestimmen

Liefert:

- `recommendation`
- `firstStep`
- `confidence`
- `tradeoffs`

---

### 2. Privacy Agent

**Zweck:** Datenschutz-/Sensitivitätsperspektive.

Nutzt bei:

- confidential / restricted Daten
- personenbezogenen Daten
- Cloud-/Lokal-Abwägung
- Redaction-Fragen

Liefert:

- `privacyRisk`
- `processingRecommendation`
- `redactionRequired`
- `reason`

---

### 3. Planning Agent

**Zweck:** Schritt-für-Schritt-Pläne.

Nutzt bei:

- Projektplanung
- Roadmaps
- Phasenmodell
- Umsetzungsschritte

Liefert:

- `plan`
- `milestones`
- `nextActions`

---

### 4. Risk Agent

**Zweck:** Risiken, Nebenwirkungen und Schwachstellen prüfen.

Nutzt bei:

- Deployment
- Architekturentscheidungen
- Sicherheit
- mögliche Fehlerrisiken

Liefert:

- `risks`
- `mitigations`
- `watchouts`

---

### 5. Technical Agent

**Zweck:** technische Umsetzung, Code, Infrastruktur.

Nutzt bei:

- TypeScript / Node
- Docker
- API
- Frontend
- Tests

Liefert:

- `implementationNotes`
- `filesToChange`
- `commands`
- `testPlan`

---

### 6. Writing Agent

**Zweck:** Dokumentation und verständliche Texte.

Nutzt bei:

- README
- Runbooks
- Changelogs
- UI-Texte

Liefert:

- `draft`
- `summary`
- `improvements`

---

### 7. Research Agent

**Zweck:** externe oder interne Informationssammlung.

Nutzt bei:

- Vergleiche
- Best Practices
- aktuelle technische Infos
- Architektur-Alternativen

Liefert:

- `findings`
- `sources`
- `recommendation`

Hinweis: Dieser Agent muss später klar zwischen internem Wissen, lokaler Suche und Web-Suche unterscheiden.

---

## Minimaler Registry-Datensatz

Jeder Agent sollte mindestens folgende Felder haben:

```ts
{
  id: string;
  label: string;
  description: string;
  category: string;
  triggers: string[];
  outputs: string[];
  privacyNotes: string[];
  enabled: boolean;
}
```

---

## Erste Integration

Phase 6.1 sollte noch nicht zu viel umbauen.

Empfohlene erste Umsetzung:

1. Datei `agent-capabilities.ts` anlegen
2. Registry als Array definieren
3. Helper-Funktion `getAgentCapabilities()` exportieren
4. Helper-Funktion `suggestAgentCapabilities(userInput)` vorbereiten
5. Council später damit erweitern

---

## Spätere UI-Nutzung

Die UI kann später anzeigen:

- welche Agenten verfügbar sind
- welche Agenten vorgeschlagen wurden
- welche Agenten in einer Council-Antwort beteiligt waren
- welche Agenten häufig genutzt werden
