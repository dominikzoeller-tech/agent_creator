# agent-worker-2

Ziel: Web-Agent und lokaler Worker werden verbunden.

Damit kann die Agent-Seite jetzt eine Worker-Aufgabe schreiben und das Worker-Ergebnis wieder laden.

Neue API-Routen:

```text
/api/cmt/master/secure/worker/task
/api/cmt/master/secure/worker/result
```

Neue UI-Sektion:

```text
Agent-Worker-Steuerung
```

Ablauf:

1. Auf der Agent-Seite Aufgabe formulieren.
2. Button `Worker-Aufgabe schreiben` klicken.
3. Im Terminal `npm run worker:run` ausführen.
4. `y` bestätigen.
5. Auf der Agent-Seite `Worker-Ergebnis laden` klicken.

Ausführen:

```powershell
node .\agent-worker-2\scripts\agent-worker-2.cjs
npm run worker2:verify
npm run build
```
