# agent-worker-1

Ziel: Lokaler Worker, damit der Agent nicht nur Text erzeugt, sondern kontrolliert mit deinem Projektprozess arbeiten kann.

Der Worker kommuniziert nicht direkt mit VS Code, sondern sicher ueber Dateien:

```text
tasks/next-task.json       -> Aufgabe fuer den Worker
tasks/last-result.json     -> Ergebnis vom Worker
logs/last-agent-worker.log -> Terminal-/Build-Log
```

Der Worker kann aktuell kontrolliert ausfuehren:

- `git status --short`
- `npm run build`
- `npm --prefix frontend run build`
- optional spaeter weitere whitelisted Commands

Wichtig:

- Kein Auto-Run ohne deine Eingabe.
- Worker fragt im Terminal vorher `Execute? y/N`.
- Keine Secrets werden gelesen oder ausgegeben.
- Keine externen Calls.

Ausfuehren:

```powershell
node .\agent-worker-1\scripts\agent-worker-1.cjs
npm run worker1:verify
node .\scripts\agent-worker.cjs
```
