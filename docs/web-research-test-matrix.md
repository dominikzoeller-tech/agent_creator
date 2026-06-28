# Web Research Test Matrix

## Ziel

Diese Matrix prüft die Web-Research-Funktionen aus Phase 9.0 bis 9.8.

## Baseline

| Bereich | Erwartung |
|---|---|
| Web Research deaktiviert | API antwortet ohne echte Treffer und ohne Fehler |
| Settings | zeigt Status ohne API-Keys oder Secrets |
| Governance | bewertet Query, Summary, Quellen und Speicherziel |
| Save API | blockiert unsichere Payloads mit Governance Errors |

## Testfälle

### 1. Web Research API

```powershell
Invoke-RestMethod "http://localhost:3000/api/web-research?q=privacy-first%20ai%20agents" | ConvertTo-Json -Depth 10
```

Erwartung:

- `ok=true`
- `results` ist Array
- keine Secrets in Response

### 2. Settings ohne Secret-Leak

```powershell
Invoke-RestMethod "http://localhost:3000/api/web-research-settings" | ConvertTo-Json -Depth 10
```

Erwartung:

- Boolesche Flags statt API-Key-Werte
- kein `OPENAI_API_KEY`
- kein `BING_SEARCH_API_KEY`

### 3. Governance: kein Speicherziel

Erwartung:

- `allowed=false`
- Issue `nothing-selected`

### 4. Governance: Duplicate Sources

Erwartung:

- `duplicate-sources` als Info
- deduplizierte Quellenliste

### 5. Save API: Secret-Leak Payload

Erwartung:

- HTTP 400
- `ok=false`
- Speicherung blockiert

## Smoke Test

```powershell
npm run web:research:smoke
```

Der Smoke Test prüft die wichtigsten API-Pfade automatisch.
