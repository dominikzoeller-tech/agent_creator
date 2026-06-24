# Phase 4 – Web-UI / Dashboard Architektur

## Ziel

Die Web-UI ist **nicht** die eigentliche Intelligenzschicht. Die Web-UI ist nur die Darstellungsschicht vor der Privacy-First API.

Die zentrale Regel lautet:

- **UI spricht nur mit der API**
- **API entscheidet über Datenschutz, Routing und Cloud-/Lokalpfad**
- **UI zeigt nur Status, Antworten, Logs und Analytics an**

---

## Zielbild

```text
[Browser / Web-UI]
        |
        v
[Privacy-First API]
        |
        +--> cloud_raw
        +--> cloud_redacted
        +--> local_policy
```

---

## Hauptbereiche der Web-UI

### 1. Chat-Bereich
Der Chat-Bereich ist die primäre Oberfläche für den Master-Agenten.

**Aufgaben:**
- Nutzerfrage eingeben
- Sensitivität auswählen (`public`, `internal`, `confidential`, `restricted`)
- Verarbeitungsmodus auswählen (`auto`, `local_only`, `hybrid`, `cloud_allowed`)
- Antwort anzeigen
- Route sichtbar machen (`direct` oder `council`)
- bei JSON-Modus zusätzlich Recommendation / First Step / Confidence anzeigen

**UI-Elemente:**
- Texteingabefeld
- Senden-Button
- Dropdown für Sensitivität
- Dropdown für Processing Mode
- Toggle für JSON-Modus
- Toggle für `includeCouncilResult`
- Antwortpanel
- Badge für Route
- Badge für `processingPath`

---

### 2. Request-/Privacy-Panel
Dieses Panel erklärt, **wie** die aktuelle Anfrage verarbeitet wurde.

**Anzeigen:**
- `sensitivity`
- `processingMode`
- `processingPath`
- ob Redaction erfolgt ist
- ob Cloud oder lokale Policy verwendet wurde

**Zweck:**
- Transparenz
- Vertrauen
- Debugging
- Datenschutz-Nachvollziehbarkeit

---

### 3. Decision-Log-Ansicht
Diese Ansicht zeigt geloggte Entscheidungen aus `logs/decision-log.jsonl`.

**Anzeigen:**
- Zeitpunkt
- Route
- Frage
- Empfehlung
- erster Schritt
- Konfidenz
- erkannte Optionen

**Später sinnvoll:**
- Filter nach Route
- Filter nach Zeitraum
- Suche nach Frage / Optionen

---

### 4. Analytics-/Dashboard-Bereich
Das Dashboard ist die Management-/Auswertungsschicht über den Logs.

**Anzeigen:**
- Anzahl Direct vs. Council
- Ø Konfidenz
- häufigste Empfehlungen
- häufigste erste Schritte
- häufigste Optionen
- wiederkehrende Entscheidungsmuster
- Zeitreihen nach Tag / Woche / Monat

**Später sinnvoll:**
- kleine Charts
- Downloadlinks für CSV / Excel
- Trendvergleich

---

### 5. Admin-/Systemstatus-Bereich
Dieser Bereich ist für Betrieb und Debugging hilfreich.

**Anzeigen:**
- API Health (`/health`)
- aktiver Port
- unterstützte Sensitivitäten
- unterstützte Processing Modes
- letzter API Smoke Test Status

---

## Empfohlene Seiten / Tabs

### Variante A – klein und pragmatisch
- `Chat`
- `Logs`
- `Analytics`
- `System`

### Variante B – später ausbaubar
- `Chat`
- `Privacy`
- `Logs`
- `Analytics`
- `Admin`

Für den Start empfehle ich **Variante A**.

---

## Empfohlene Komponentenstruktur

```text
frontend/
├─ app/
│  ├─ page.tsx                 # Startseite / Chat
│  ├─ logs/page.tsx            # Logs
│  ├─ analytics/page.tsx       # Analytics
│  └─ system/page.tsx          # Health / System
│
├─ components/
│  ├─ ChatComposer.tsx
│  ├─ ChatResponseCard.tsx
│  ├─ PrivacyPanel.tsx
│  ├─ RouteBadge.tsx
│  ├─ ProcessingPathBadge.tsx
│  ├─ LogTable.tsx
│  ├─ AnalyticsSummary.tsx
│  └─ HealthPanel.tsx
│
└─ lib/
   ├─ api-client.ts
   └─ types.ts
```

---

## Was in Phase 4 NICHT in die UI gehört

Die folgenden Dinge sollen **nicht** in die UI verlagert werden:

- Redaction-Logik
- Routing-Entscheidungen
- Council-Policy-Entscheidungen
- Sensitivitätslogik
- Secret-Handling
- direkter LLM-Zugriff aus dem Browser

Das bleibt alles in der API.

---

## Klare Architekturregel

### Browser darf nie direkt mit dem LLM sprechen

Die UI soll **nur** gegen deine API sprechen.

**Warum:**
- API-Key bleibt serverseitig
- Datenschutzlogik bleibt zentral
- `restricted` kann sauber blockiert werden
- `confidential` kann serverseitig redigiert werden
- Cloud-/Lokal-Split bleibt kontrollierbar

---

## Meine Empfehlung für die Umsetzungsreihenfolge

### Schritt 1
- Chat-Seite
- Health-Anzeige
- Request-/Privacy-Panel

### Schritt 2
- Logs-Seite
- einfache Log-Tabelle

### Schritt 3
- Analytics-Seite
- Summary + Exporte

### Schritt 4
- UI verfeinern
- Filters / Suche / Charting

