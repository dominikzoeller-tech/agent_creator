# Phase 6 – Agenten-Funktionen ausbauen

## Ziel

Nach API, Frontend, Logs, Analytics und internem Docker-Deployment wird jetzt die eigentliche Agenten-Intelligenz erweitert.

Phase 6 konzentriert sich auf:

- bessere Council-/Rat-Logik
- klarere Spezialagenten
- Agent Capability Registry
- strukturiertere Tool-/Fähigkeitsauswahl
- spätere Knowledge-Base- und Dokumentenfunktionen

---

## Empfohlene Reihenfolge

### Phase 6.1 – Agent Capability Registry

Ziel: Das System bekommt eine zentrale Übersicht, welche Agenten/Fähigkeiten existieren.

Beispiele:

- `decision_agent`
- `privacy_agent`
- `planning_agent`
- `risk_agent`
- `research_agent`
- `writing_agent`
- `technical_agent`

Ergebnis:

- eine zentrale Registry-Datei
- klare Agenten-Beschreibungen
- Kategorien
- Trigger-Hinweise
- Fähigkeitspfade

---

### Phase 6.2 – Besseres Council-Routing

Ziel: Der Master-Agent entscheidet sauberer, ob eine Anfrage direkt beantwortet wird oder ob mehrere Spezialagenten beteiligt werden.

Kriterien:

- Komplexität
- Risiko
- Datenschutz
- Mehrdeutigkeit
- Bedarf an Planung
- Bedarf an Gegenargumenten

Ergebnis:

- besseres Routing-Modell
- nachvollziehbare Routing-Begründung
- bessere Logs

---

### Phase 6.3 – Entscheidungsagenten verbessern

Ziel: Council-Entscheidungen werden strukturierter.

Neue Felder könnten sein:

- `decisionType`
- `tradeoffs`
- `risks`
- `assumptions`
- `recommendedAgents`
- `nextCheckpoint`

---

### Phase 6.4 – Knowledge Base / Memory vorbereiten

Ziel: Das System kann später projektspezifisches Wissen einbinden.

Erstmal nur Architektur:

- lokale Wissensdateien
- Projektkontext
- Entscheidungshistorie
- wiederkehrende Muster

---

### Phase 6.5 – Dokumenten-/Datei-Funktionen

Ziel: Später können Dokumente/PDFs/Markdown-Dateien analysiert werden.

Wichtig:

- weiterhin Privacy-First
- sensible Inhalte erst redigieren
- restricted lokal behandeln

---

## Empfehlung für jetzt

Sofort anfangen mit:

# Phase 6.1 – Agent Capability Registry

Warum?

Weil alle späteren Agenten-Funktionen davon profitieren, wenn das System zuerst weiß:

- welche Agententypen existieren
- wann welcher Agent sinnvoll ist
- welche Fähigkeiten verfügbar sind
- wie Council-Routing diese Fähigkeiten nutzt
