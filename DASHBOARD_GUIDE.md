# 🤖 AI Agent Factory Dashboard - Anleitung

## 🚀 Quick Start

### Dashboard starten:
```bash
cd c:\Users\User\ai-assistant\agent_creator
python -m streamlit run dashboard.py
```

Das Dashboard wird dann im Browser unter `http://localhost:8501` geöffnet.

---

## 📋 Features

### 1. **Agent erstellen**
- **Eingabefeld**: Gib eine Aufgabe ein (z.B. "Baue einen Trading Bot für Bitcoin")
- **🚀 Erstellen**: Startet die Generierung von 2-3 Agentvarianten
- **🗑️ Löschen**: Leert das Eingabefeld
- **🔄 Aktualisieren**: Aktualisiert die UI

### 2. **Echtzeitstatus**
- Status-Anzeige während der Verarbeitung
- Metriken: Iterationen, Quality Score, Ausführungsversuch, Ausführungsstatus

### 3. **Detaillierte Ergebnisse**

Vier Tabs für verschiedene Aspekte:

#### 📋 Plan
- Agent-Name und -Beschreibung
- Geschätzte Komplexität
- Planschritte mit Implementierungsnotizen

#### 💻 Code
- Generierter Code mit Syntax-Highlighting
- Zeilenanzahl und Größe
- Dateinamen der generierten Varianten

#### 🚀 Ausführung
- Ausführungsstatus (Erfolgreich/Fehlgeschlagen)
- Fehlerausgabe (falls vorhanden)
- Output der Codeausführung

#### 📊 Varianten
- Vergleichstabelle aller generierten Varianten
- Variante, Label, Score und Erfolgsstatus

### 4. **Beste Variante**
Oben im Ergebnisbereich werden die Details der besten Variante angezeigt:
- Variantenname (z.B. "v1")
- Label (z.B. "simple", "api-heavy", "modular")
- Score (0-10)

### 5. **Task-Verlauf**
Expandierbarer Bereich mit Verlauf aller verarbeiteten Tasks:
- Zeitstempel
- Aufgabenbeschreibung
- Status
- Generierte Datei

### 6. **Bester Agent**
- Zeigt den besten generierten Agent an
- Metadaten (Score, Variante, Ausführungsstatus)
- Code-Viewer
- **Herunterladen**: Speichert `best_agent.py` lokal
- **Starten**: Führt den besten Agenten aus

### 7. **Sidebar**
- **System Status**: Anzahl generierter Agenten und Verfügbarkeit des besten Agenten
- **Über**: Kurzübersicht des Systems

---

## 📊 Generierte Dateien

Alle generierten Agenten werden in `output/generated_agents/` gespeichert:
- `agent_v1.py` - Erste Variante (z.B. "Simple")
- `agent_v2.py` - Zweite Variante (z.B. "API-Heavy")
- `agent_v3.py` - Dritte Variante (optional, z.B. "Modular")
- `agent_v1.log` - Ausführungsprotokoll Variante 1
- `agent_v2.log` - Ausführungsprotokoll Variante 2
- `agent_v3.log` - Ausführungsprotokoll Variante 3

Der beste Agent wird zusätzlich gespeichert in:
- `output/best_agent/best_agent.py` - Der beste generierte Agent
- `output/best_agent/best_agent_metadata.txt` - Metadaten (Score, Variante, Status)

---

## 🔧 Konfiguration

Die Systemkonfiguration befindet sich in `config.py`:

| Parameter | Standard | Beschreibung |
|-----------|----------|-------------|
| `OPENAI_MODEL` | `gpt-4` | LLM-Modell für Codegenerierung |
| `MAX_ITERATIONS` | `3` | Max. Iterationen für Verbesserungen |
| `EXECUTION_MAX_RETRIES` | `2` | Max. Versuche bei Ausführungsfehlern |
| `EXECUTION_TIMEOUT` | `15` | Timeout für Codeausführung (Sekunden) |
| `QUALITY_THRESHOLD` | `7.0` | Minimaler Quality Score (0-10) |

---

## 💡 Tipps

### 1. **Bessere Prompts**
- Sei spezifisch: "Baue einen Bitcoin-Preis-Monitoring-Bot mit Trading-Alerts"
- Statt: "Baue einen Bot"

### 2. **API-Integration**
Das System erkennt automatisch benötigte APIs:
- **Crypto**: CoinGecko API
- **Nachrichten**: NewsAPI.org
- **Finanzen**: Yahoo Finance (yfinance)

Umgebungsvariable erforderlich:
```bash
NEWSAPI_KEY=your_api_key
```

### 3. **Varianten verstehen**
- **v1 (Simple)**: Einfache, fokussierte Lösung
- **v2 (API-Heavy)**: Mit vielen API-Integrationen
- **v3 (Modular)**: Modularer, erweiterbarer Code

### 4. **Speichern von Best Agents**
Nach jeder erfolgreichen Generierung wird der beste Agent automatisch gespeichert.
Du kannst ihn direkt herunterladen!

---

## 🐛 Troubleshooting

### Dashboard startet nicht?
```bash
python -m streamlit run dashboard.py --logger.level=debug
```

### LLM API-Fehler?
- Überprüfe `OPENAI_API_KEY` in `.env`
- Verfügbare Kontingente bei OpenAI

### Codeausführung fehlgeschlagen?
- Check die Logs in `output/generated_agents/agent_vX.log`
- Erhöhe `EXECUTION_TIMEOUT` falls nötig
- Überprüfe erforderliche API-Keys

### Streamlit Port bereits in Benutzung?
```bash
python -m streamlit run dashboard.py --server.port 8502
```

---

## 📝 Beispiele

### Beispiel 1: Bitcoin-Preis-Monitor
```
Eingabe: "Baue einen Bitcoin-Preis-Monitor mit Benachrichtigungen bei Preisänderungen > 5%"
Erwartete Varianten:
- v1: Einfache Abfrage mit CoinGecko
- v2: Datenspeicherung + Statistiken
- v3: WebSocket-basiertes Echtzeit-Monitoring
```

### Beispiel 2: News-Aggregator
```
Eingabe: "Erstelle einen News-Aggregator für Tech-Nachrichten mit Stichwort-Filter"
Erwartete Varianten:
- v1: Einfache NewsAPI-Abfrage
- v2: Mit Sentiment-Analyse
- v3: Mit Datenbankpersistenz
```

---

## 🎓 Technologie-Stack

- **Framework**: Streamlit (Web-UI)
- **LLM**: OpenAI GPT-4
- **Orchestrierung**: LangChain + LangGraph
- **APIs**: CoinGecko, NewsAPI, Yahoo Finance
- **Speicherung**: SQLite (Memory) + Dateisystem

---

## 📞 Weitere Hilfe

- **config.py** - Systemkonfiguration
- **main.py** - AgentFactorySystem-Logik
- **core/state.py** - Datenmodelle
- **agents/** - Planungs-, Programmier-, Prüf- und Verbesserungsagenten

---

**Viel Spaß mit dem AI Agent Factory Dashboard! 🚀**
