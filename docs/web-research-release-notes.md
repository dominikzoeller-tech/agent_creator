# Phase 9 Web Research Release Notes

## Ziel

Phase 9 ergänzt kontrollierte Web Research Fähigkeiten für den Privacy-First Agent.

## Enthaltene Phasen

### 9.0 – Web Research Tool Foundation

- separate Web Research API
- separate Testseite `/web-research`
- standardmäßig deaktiviert

### 9.1 – Web Research in Agent Flow

- Web Research Intent-Erkennung
- Query-Sanitizer
- Web Research Kontext im Agent Flow

### 9.2 – AI Web Research Summary

- LLM-Zusammenfassung von Web-Snippets
- Quellenstruktur
- Debug-Felder für Summary und Quellen

### 9.3 – Frontend Visibility

- Web Research Panel im Chat
- Treffer, Summary und Quellen sichtbar

### 9.4 – Analytics

- Web Research Nutzung messbar
- Top Queries, Sources und Titles
- Summary-Erfolgsquote

### 9.5 – Save to Knowledge/Memory

- geprüfte Research-Ergebnisse als Knowledge speichern
- optional als Memory speichern

### 9.6 – Quality & Governance

- Governance-Gate vor Speicherung
- Deduplizierung
- Secret-/PII-Warnungen

### 9.7 – Admin/Settings

- Statusübersicht ohne Secret-Leak
- Aktivierungsanleitung
- Governance-Regeln sichtbar

### 9.8 – Regression & Hardening

- Smoke Tests
- Testmatrix
- Hardening Runbook

### 9.9 – Release Polish

- finale Navigation
- Release Notes
- Aktivierungsanleitung
- Completion Checklist

## Activation

Web Research wird erst aktiv mit:

```env
WEB_RESEARCH_ENABLED=true
BING_SEARCH_API_KEY=...
```

Ohne diese Werte bleiben die Web Research Funktionen sichtbar, aber echte Websuche ist deaktiviert.

## Security Notes

- `.env` darf nicht getrackt werden.
- API-Keys dürfen nicht in Screenshots oder Logs auftauchen.
- Settings zeigt nur Boolesche Statusfelder, keine Secret-Werte.
- Governance blockiert Speicherung bei offensichtlichen Secrets.
