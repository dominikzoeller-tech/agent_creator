# hotfix-self-builder-top

Fix: Agent-Selbstbau sichtbar ganz nach oben setzen.

Problem:

Der Bereich `Agent-Selbstbau` ist nicht sichtbar oder wurde zu weit unten eingefuegt.

Fix:

- Fuegt einen kompakten Self-Builder-Block direkt unter dem Header ein.
- Fuegt fehlende State-Felder und Funktionen nach.
- Fuegt die API-Route `/api/cmt/master/secure/self-build/plan` nach, falls sie fehlt.

Ausfuehren:

```powershell
node .\hotfix-self-builder-top\scripts\hotfix-self-builder-top.cjs
npm run selftop:verify
npm run build
```
