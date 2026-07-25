# mvp-agent-3

Fokus: schneller vorwärts mit einem echten Arbeitsflow statt Mini-Phasen.

Dieses Paket verbessert nur die zentrale Agent-Seite:

- zeigt `modeLabel`, `confidence` und `reason` sichtbar an
- ergänzt klare Status-Badges
- ergänzt einen kleinen Abschnitt "Arbeitsmodus"
- ergänzt Link-Hinweis auf Haupttestseite
- keine neuen Status-/Entry-/Handoff-Seiten
- kein Provider, kein Internet, kein Live-Modell

Route bleibt:

```text
/cmt/master/secure/agent
```

Ausführen:

```powershell
node .\mvp-agent-3\scripts\mvp-agent-3.cjs
npm run mvp3:verify
npm run build
```
