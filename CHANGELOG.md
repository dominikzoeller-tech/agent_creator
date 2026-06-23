# Changelog

## Added
- Master-Agent CLI mit Routing zwischen `direct` und `council`
- Council-Engine als spezialisiertes Entscheidungsmodul
- JSON-Ausgabe im **compact**- und **debug**-Modus
- Decision Logging in `logs/decision-log.jsonl`
- `log-view.ts` zum Anzeigen geloggter Entscheidungen
- `decision-stats.ts` für Auswertung der Decision Logs
- CSV-Export:
  - vollständige Entries
  - kompakte Entries
  - Summary
  - Empfehlungen
  - erste Schritte
  - Optionen
  - wiederkehrende Entscheidungsmuster
- Excel-Export:
  - vollständiger Report mit mehreren Sheets
  - Summary-only Workbook
- Zeitaggregation für:
  - Tag
  - Woche
  - Monat
- ASCII-Balken für Route-Verteilung
- ASCII-Heatmaps für Empfehlungen, erste Schritte und Optionen
- Mini-Scorecard für wiederkehrende Entscheidungsmuster
- timestamp-basierte Export-Dateinamen
- CSV-Varianten für Empfehlungen, erste Schritte, Optionen und Patterns

## Improved
- Routing-Logik verbessert:
  - Faktenfragen gehen jetzt korrekt auf `direct`
  - echte Tradeoff-/Entscheidungsfragen gehen auf `council`
- CLI gegen Shell-Missverständnisse abgesichert
- JSON-Output für andere Agenten/Tools besser standardisiert
- Export-Dateinamen mit:
  - Route-Filter
  - Reihenfolge
  - Timestamp
- Analytics-Ausgabe um Zeitreihen und Mustererkennung erweitert

## Fixed
- `xlsx` von unsicherer npm-Version `0.18.5` auf CDN-Version `0.20.3` umgestellt
- `npm audit` zeigt jetzt **0 vulnerabilities**
- Fehltrigger bei faktischen Fragen reduziert
- Typfehler in `decision-stats.ts` rund um `PatternAggregate.avgConfidencePercent` bereinigt
- beschädigte / doppelt eingefügte Blöcke in `decision-stats.ts` bereinigt

## Security
- Direkte `xlsx`-Dependency auf:
  `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`
  umgestellt
- bekannte High-Severity-Warnung aus alter npm-Version entfernt
- Audit-Status nach Dependency-Umstellung überprüft
