# Phase 7 Roadmap – Ziel und nächste Schritte

## Aktuelles Ziel

Das System soll nicht nur antworten, sondern lokales Projektwissen sicher nutzen, sichtbar machen und auswerten.

## Erreicht bis Phase 7.7

- Lokale Knowledge Base im Ordner `knowledge/`
- Knowledge-Suche und Context-Bridge
- Knowledge-Kontext im echten Agent Flow
- Knowledge-Hits im API-Debug und Frontend
- Knowledge-Nutzung in Logs/Analytics
- Knowledge Admin zum Verwalten lokaler Dateien
- Knowledge-Link in der Navigation

## Nächste sinnvolle Schritte

### Phase 7.8 – Knowledge Quality Checks

Ziel:

- doppelte Knowledge-Dateien erkennen
- leere oder sehr kurze Dateien markieren
- fehlende `Tags:` erkennen
- veraltete Dateien über `updatedAt` anzeigen

### Phase 7.9 – Knowledge Search Tuning

Ziel:

- bessere Trefferqualität
- Gewichtung nach Titel, Tags und Inhalt
- Stopwords und Mindestscore verbessern
- Knowledge-Hits weniger zufällig machen

### Phase 8.0 – Personal/Project Memory Layer

Ziel:

- dauerhaftes Projektgedächtnis getrennt von Knowledge-Dateien
- strukturierte Fakten über Projektentscheidungen
- automatische Zusammenfassungen wichtiger Sessions

### Phase 8.1 – Agent Evaluation & Regression Tests

Ziel:

- feste Testfragen
- erwartete Routing-/Knowledge-Ergebnisse
- Regression verhindern, wenn Routing/Knowledge geändert wird

## Fernziel

Ein privacy-first Agentensystem, das:

1. lokale Daten sicher nutzt,
2. Entscheidungen transparent routet,
3. Agenten und Knowledge-Hits sichtbar macht,
4. Logs und Analytics für Verbesserung nutzt,
5. später als persönlicher Projekt-Copilot mit lokaler Wissensbasis funktioniert.
